import React from 'react';
import { MacroNews } from '../../types/game';
import {
  TrendingUp,
  Newspaper,
  Landmark,
  Building2,
  Building,
  Briefcase,
  Layers,
  Flame,
  Rocket,
  ShieldAlert,
  Calendar,
} from 'lucide-react';

interface NewsTabProps {
  currentNews: MacroNews;
  inflationRate: number;
  keyRate: number;
  newsHistory: { year: number; news: MacroNews; inflation: number; keyRate: number }[];
  year: number;
  activeCrisis: MacroNews | null;
}

export const NewsTab: React.FC<NewsTabProps> = ({
  currentNews,
  inflationRate,
  keyRate,
  newsHistory,
  year,
  activeCrisis,
}) => {
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'MACRO':
        return <Landmark className="w-3.5 h-3.5 text-blue-600" />;
      case 'STOCKS':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
      case 'BONDS':
        return <Layers className="w-3.5 h-3.5 text-amber-600" />;
      case 'BANKING':
        return <Building className="w-3.5 h-3.5 text-indigo-600" />;
      case 'REAL_ESTATE':
        return <Building2 className="w-3.5 h-3.5 text-teal-600" />;
      case 'BUSINESS':
        return <Briefcase className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Newspaper className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Newspaper Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-xs">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Финансово-экономическое обозрение
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[10px] font-semibold text-slate-500">
                  Выпуск №{year}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
                Деловой Вестник: Экономика & Финансы
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
              <span className="text-slate-400 block text-[10px]">Инфляция (ИПЦ)</span>
              <span className="font-bold text-amber-700 tabular-nums">
                +{(inflationRate * 100).toFixed(1)}%
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
              <span className="text-slate-400 block text-[10px]">Ключевая ставка ЦБ</span>
              <span className="font-bold text-blue-700 tabular-nums">
                {(keyRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Lead Story / Macro Regime */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {activeCrisis && (activeCrisis.cycleType === 'CRISIS' || activeCrisis.cycleType === 'STAGFLATION') ? (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                Особый период: Экономическая рецессия
              </span>
            ) : activeCrisis && (activeCrisis.cycleType === 'BOOM' || activeCrisis.cycleType === 'TECH_RALLY') ? (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-emerald-600" />
                Особый период: Экономический подъем
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                Главная тема года
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentNews.headline}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {currentNews.summary}
          </p>
        </div>

        {/* Central Bank Press Briefing */}
        {currentNews.centralBank && (
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 shadow-2xs space-y-2 mt-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs font-extrabold text-xs">
                  ЦБ РФ
                </span>
                <div>
                  <h4 className="font-extrabold text-indigo-950 text-sm">
                    Пресс-релиз Совета директоров Банка России
                  </h4>
                  <span className="text-[11px] text-indigo-700">
                    Председатель: Эльвира Набиуллина · Таргет по инфляции: 4.0%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-900 tabular-nums">
                  Ставка: {(keyRate * 100).toFixed(1)}% годовых
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                    currentNews.centralBank.action === 'RAISE'
                      ? 'bg-rose-600 text-white'
                      : currentNews.centralBank.action === 'CUT'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {currentNews.centralBank.action === 'RAISE'
                    ? 'Повышена ↑'
                    : currentNews.centralBank.action === 'CUT'
                    ? 'Снижена ↓'
                    : 'Сохранена ='}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-indigo-100">
              «{currentNews.centralBank.statement}»
            </p>
            {currentNews.centralBank.reasoning && (
              <p className="text-[11px] text-indigo-800">
                <strong>Оценка регулятора:</strong> {currentNews.centralBank.reasoning}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 6 Veiled Analytical Articles Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Отраслевые хроники и аналитика рынков ({currentNews.articles?.length || 6} тем)
          </h4>
          <span className="text-[11px] text-slate-400">
            Редакция ФинПуть · Данные Росстата и Мосбиржи
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(currentNews.articles && currentNews.articles.length > 0
            ? currentNews.articles
            : [
                {
                  id: 'def_1',
                  category: 'MACRO' as const,
                  categoryLabel: 'Центробанк & Макроэкономика',
                  title: 'Совет директоров ЦБ уточнил среднесрочный прогноз траектории процентных ставок',
                  content: 'Регулятор учитывает устойчивые темпы потребительского кредитования и динамику бюджетных стимулов. Монетарные условия остаются взвешенными.',
                },
                {
                  id: 'def_2',
                  category: 'STOCKS' as const,
                  categoryLabel: 'Фондовый рынок',
                  title: 'Корпоративные эмитенты первого эшелона опубликовали операционные результаты',
                  content: 'Инвесторы оценивают влияние издержек на рентабельность бизнеса и следят за рекомендациями советов директоров по дивидендам.',
                },
                {
                  id: 'def_3',
                  category: 'BONDS' as const,
                  categoryLabel: 'Облигации & Госдолг',
                  title: 'Аукционы Минфина фиксируют стабильный спрос со стороны институциональных игроков',
                  content: 'Доходности выпусков с постоянным купоном формируют ориентир для ставок заимствования в корпоративном сегменте.',
                },
                {
                  id: 'def_4',
                  category: 'BANKING' as const,
                  categoryLabel: 'Банки & Вклады',
                  title: 'Кредитные организации обновили тарифные сетки по срочным депозитам населения',
                  content: 'Система страхования вкладов (АСВ) обеспечивает устойчивый приток долгосрочных пассивов в банковский сектор.',
                },
                {
                  id: 'def_5',
                  category: 'REAL_ESTATE' as const,
                  categoryLabel: 'Недвижимость & Девелопмент',
                  title: 'Рынок жилья адаптируется к балансу спроса и предложения в сегменте новостроек',
                  content: 'Арендный рынок сохраняет устойчивость, в то время как динамика сделок купли-продажи зависит от доступности кредитования.',
                },
                {
                  id: 'def_6',
                  category: 'BUSINESS' as const,
                  categoryLabel: 'Бизнес & Потребрынок',
                  title: 'Потребительская активность формирует структуру выручки розничных операторов',
                  content: 'Предприятия розничной торговли и сферы услуг пересматривают цепочки поставок для сохранения конкурентных цен.',
                },
              ]
          ).map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                  {getCategoryIcon(article.category)}
                  <span>{article.categoryLabel}</span>
                </div>

                <h5 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                  {article.title}
                </h5>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {article.content}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Аналитический отдел</span>
                <span>Год {year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Archive */}
      {newsHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Архив новостей предыдущих лет</span>
          </h4>

          <div className="divide-y divide-slate-100">
            {newsHistory.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Год {item.year}:</span>
                    <span className="font-medium text-slate-900">{item.news.headline}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.news.summary}</p>
                </div>

                <div className="shrink-0 text-right font-mono text-[11px] text-slate-400">
                  <div>Инфляция: +{(item.inflation * 100).toFixed(1)}%</div>
                  <div>Ставка: {(item.keyRate * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
