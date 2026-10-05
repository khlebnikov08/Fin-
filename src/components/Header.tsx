import React from 'react';
import { Volume2, VolumeX, BookOpen, Trophy, RotateCcw, Download, HelpCircle, GraduationCap } from 'lucide-react';
import { sound } from '../utils/audio';

export type ActiveTab = 'overview' | 'investments' | 'banking' | 'career' | 'news' | 'analytics';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenRules: () => void;
  onOpenLeaderboard: () => void;
  onOpenDownload: () => void;
  onOpenTour: () => void;
  onRestartGame: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  year: number;
  gameMode: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenRules,
  onOpenLeaderboard,
  onOpenDownload,
  onOpenTour,
  onRestartGame,
  isMuted,
  setIsMuted,
  year,
  gameMode,
}) => {
  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'Обзор года' },
    { id: 'investments', label: 'Инвестиции' },
    { id: 'banking', label: 'Банки & Карты' },
    { id: 'career', label: 'Образование & Бизнес' },
    { id: 'news', label: 'Новости & ЦБ' },
    { id: 'analytics', label: 'Аналитика' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('overview');
            }}
            className="text-xl font-bold tracking-tight text-slate-900 font-heading hover:text-emerald-600 transition-colors"
          >
            ФинПуть
          </a>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-800">Год {year}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 truncate max-w-[120px]">{gameMode}</span>
          </div>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                data-tour={`nav-${item.id}`}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(item.id);
                }}
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onOpenDownload();
            }}
            className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Скачать архив проекта (.zip)"
            aria-label="Скачать архив"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Скачать архив</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenTour();
            }}
            className="p-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Интерактивный тур и обучение"
            aria-label="Обучение"
          >
            <GraduationCap className="w-4 h-4" />
            <span className="hidden lg:inline">Обучение</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenRules();
            }}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Правила и справочник механик"
            aria-label="Правила игры"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Рейтинг рекордов"
            aria-label="Рейтинг рекордов"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleSound}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
            aria-label="Звуковые эффекты"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          <button
            onClick={() => {
              sound.playWarning();
              onRestartGame();
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
            title="Начать новую игру"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Новая игра</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-100 gap-1 bg-white scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(item.id);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
