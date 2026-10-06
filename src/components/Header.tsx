import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  GraduationCap,
  MoreHorizontal,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
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
}) => {
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const runMenuAction = (action: () => void, isRestart = false) => {
    setIsActionsMenuOpen(false);
    if (isRestart) sound.playWarning();
    else sound.playClick();
    action();
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

        {/* Zone 3: Sound stays handy; secondary actions live in one menu. */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleSound}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
            aria-label="Звуковые эффекты"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          <div
            className="relative"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsActionsMenuOpen(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setIsActionsMenuOpen(false);
            }}
          >
            <button
              type="button"
              aria-label="Дополнительные действия"
              aria-haspopup="menu"
              aria-expanded={isActionsMenuOpen}
              aria-controls="header-actions-menu"
              onClick={() => {
                sound.playClick();
                setIsActionsMenuOpen((open) => !open);
              }}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {isActionsMenuOpen && (
              <div
                id="header-actions-menu"
                role="menu"
                aria-label="Дополнительные действия"
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runMenuAction(onOpenTour)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  Интерактивное обучение
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runMenuAction(onOpenRules)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <BookOpen className="w-4 h-4" />
                  Правила игры
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runMenuAction(onOpenLeaderboard)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Trophy className="w-4 h-4" />
                  Рейтинг рекордов
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runMenuAction(onOpenDownload)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  Скачать архив
                </button>
                <div className="my-1.5 border-t border-slate-100" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runMenuAction(onRestartGame, true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  Начать новую игру
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-100 gap-1 bg-white scrollbar-none">
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
