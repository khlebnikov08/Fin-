import React from 'react';
import { EducationTier, CharacterPreset } from '../../types/game';
import { GraduationCap, Award, Briefcase, TrendingUp, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { sound } from '../../utils/audio';

interface CareerTabProps {
  cash: number;
  character: CharacterPreset;
  annualSalary: number;
  educationTiers: EducationTier[];
  onCompleteEducation: (tierId: string) => void;
  burnoutPenaltyActive: boolean;
  flowStateActive: boolean;
}

export const CareerTab: React.FC<CareerTabProps> = ({
  cash,
  character,
  annualSalary,
  educationTiers,
  onCompleteEducation,
  burnoutPenaltyActive,
  flowStateActive,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Карьера, Образование и Человеческий Капитал
          </h3>
          <p className="text-xs text-slate-500">
            Инвестируйте в новые знания для кратного роста ежегодной заработной платы
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Свободно наличных: <span className="font-bold text-slate-900 tabular-nums">{cash.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>

      {/* Current Position & Status */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-xs">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900">
                  {character.name}
                </span>
                <span className="text-xs text-slate-500 font-medium">({character.role})</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Базовый стартовый оклад: {(character.initialSalary / 12).toLocaleString('ru-RU')} ₽/мес
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Текущий годовой доход:</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 tabular-nums">
              {annualSalary.toLocaleString('ru-RU')} ₽ / год
            </span>
            <span className="text-xs text-slate-400 block tabular-nums">
              ~{Math.round(annualSalary / 12).toLocaleString('ru-RU')} ₽ в месяц
            </span>
          </div>
        </div>

        {/* Emotion status buffs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs">
          {burnoutPenaltyActive && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>
                <strong>Синдром выгорания:</strong> из-за низкой радости (&lt;30) ваша продуктивность и доход снижены на 20%!
              </span>
            </div>
          )}

          {flowStateActive && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Состояние потока:</strong> высокий уровень радости (85+) дает вдохновение и бонусы к премии!
              </span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 flex items-center gap-2 col-span-full">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Налоговый вычет:</strong> при оплате любого образовательного курса государство вернет 13% от его стоимости на следующем ходу!
            </span>
          </div>
        </div>
      </div>

      {/* Education Ladder (Replicating IMG_9094) */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900">
          Ступени образования и повышения квалификации
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {educationTiers.map((tier) => {
            const taxRefund = Math.round(tier.cost * 0.13);

            return (
              <div
                key={tier.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  tier.completed
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-xl ${
                          tier.completed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">
                          {tier.name}
                        </span>
                        <span className="text-xs text-emerald-600 font-semibold">
                          +{(tier.salaryBonusMultiplier * 100).toFixed(0)}% к зарплате навсегда
                        </span>
                      </div>
                    </div>

                    <span className="text-sm font-bold text-slate-900 tabular-nums shrink-0">
                      {tier.cost.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-xs text-slate-600 mb-4">
                    <span className="flex items-center gap-1 text-purple-700 font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      +{tier.joyBonus} радости
                    </span>
                    <span className="text-blue-600 font-medium">
                      Вычет 13%: +{taxRefund.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                <div>
                  {tier.completed ? (
                    <div className="w-full py-2 bg-emerald-100/70 text-emerald-800 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Диплом получен · Бонус активен</span>
                    </div>
                  ) : tier.inProgress ? (
                    <div className="w-full py-2.5 px-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span>Идет обучение: {tier.progressYears} из {tier.durationYears} {tier.durationYears === 1 ? 'года' : 'лет'}</span>
                        <span>{Math.round((tier.progressYears / tier.durationYears) * 100)}%</span>
                      </div>
                      <div className="w-full bg-amber-200/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(10, (tier.progressYears / tier.durationYears) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-amber-700 block text-center">
                        Диплом и надбавка к окладу будут получены через {tier.durationYears - tier.progressYears} {tier.durationYears - tier.progressYears === 1 ? 'год' : 'года'}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        sound.playJoy();
                        onCompleteEducation(tier.id);
                      }}
                      disabled={cash < tier.cost}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors ${
                        cash >= tier.cost
                          ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Начать обучение ({tier.cost.toLocaleString('ru-RU')} ₽ · {tier.durationYears} {tier.durationYears === 1 ? 'год' : 'года'})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
