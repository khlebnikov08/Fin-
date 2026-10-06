import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Landmark,
  MoreHorizontal,
  Newspaper,
  PieChart,
  RotateCcw,
  Target,
  TrendingUp,
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
  onOpenTour: () => void;
  onRestartGame: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Обзор', fullLabel: 'Обзор года', Icon: Target },
  { id: 'investments', label: 'Активы', fullLabel: 'Инвестиции', Icon: TrendingUp },
  { id: 'banking', label: 'Банки', fullLabel: 'Банки и карты', Icon: Landmark },
  { id: 'career', label: 'Карьера', fullLabel: 'Образование и бизнес', Icon: GraduationCap },
  { id: 'news', label: 'Новости', fullLabel: 'Новости и Центральный банк', Icon: Newspaper },
  { id: 'analytics', label: 'Аналитика', fullLabel: 'Финансовая аналитика', Icon: PieChart },
] satisfies { id: ActiveTab; label: string; fullLabel: string; Icon: typeof Target }[];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenRules,
  onOpenLeaderboard,
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

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              setActiveTab('overview');
            }}
            className="shrink-0 font-heading text-xl font-bold tracking-tight text-slate-900 transition-colors hover:text-emerald-600"
          >
            ФинПуть
          </a>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleSound}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              title={isMuted ? 'Включить звук' : 'Выключить звук'}
              aria-label={isMuted ? 'Включить звуковые эффекты' : 'Выключить звуковые эффекты'}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-emerald-600" />}
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
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>

              {isActionsMenuOpen && (
                <div
                  id="header-actions-menu"
                  role="menu"
                  aria-label="Дополнительные действия"
                  className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => runMenuAction(onOpenTour)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <GraduationCap className="h-4 w-4 text-indigo-600" />
                    Интерактивное обучение
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => runMenuAction(onOpenRules)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <BookOpen className="h-4 w-4" />
                    Правила игры
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => runMenuAction(onOpenLeaderboard)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Trophy className="h-4 w-4" />
                    Рейтинг рекордов
                  </button>
                  <div className="my-1.5 border-t border-slate-100" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => runMenuAction(onRestartGame, true)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Начать новую игру
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav
        aria-label="Основные разделы"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl"
      >
        <div className="mx-auto flex h-[4.75rem] max-w-4xl items-stretch justify-between px-1 sm:px-4">
          {NAV_ITEMS.map(({ id, label, fullLabel, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                data-tour={`nav-${id}`}
                aria-label={fullLabel}
                aria-current={isActive ? 'page' : undefined}
                title={fullLabel}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(id);
                }}
                className={`group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 transition-colors ${
                  isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {isActive && <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-emerald-600" />}
                <span
                  className={`flex h-8 w-10 items-center justify-center rounded-xl transition-colors ${
                    isActive ? 'bg-emerald-50' : 'group-hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.25]' : ''}`} aria-hidden="true" />
                </span>
                <span className={`max-w-full truncate text-[9px] sm:text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
