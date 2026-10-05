import React, { useState } from 'react';
import { GameMode, LifeGoal, CharacterPreset } from '../../types/game';
import { INITIAL_CHARACTERS, INITIAL_LIFE_GOALS } from '../../data/initialData';
import { Target, User, Sparkles, Infinity as InfinityIcon, Clock, Check } from 'lucide-react';
import { sound } from '../../utils/audio';

interface GameSetupModalProps {
  isOpen: boolean;
  onStartGame: (params: {
    playerName: string;
    character: CharacterPreset;
    mode: GameMode;
    goal: LifeGoal;
  }) => void;
}

export const GameSetupModal: React.FC<GameSetupModalProps> = ({ isOpen, onStartGame }) => {
  const [playerName, setPlayerName] = useState('Инвестор');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterPreset>(INITIAL_CHARACTERS[0]);
  const [selectedMode, setSelectedMode] = useState<GameMode>('GOAL');
  const [selectedGoal, setSelectedGoal] = useState<LifeGoal>(INITIAL_LIFE_GOALS[1]); // Apartment by default
  const [customCapitalMillions, setCustomCapitalMillions] = useState(20);
  const [customJoyTarget, setCustomJoyTarget] = useState(80);

  if (!isOpen) return null;

  const handleStart = () => {
    sound.playSuccess();
    let finalGoal = selectedGoal;
    if (selectedMode === '10_YEARS') {
      finalGoal = INITIAL_LIFE_GOALS[0];
    } else if (selectedMode === 'SANDBOX') {
      finalGoal = INITIAL_LIFE_GOALS[INITIAL_LIFE_GOALS.length - 1];
    } else if (selectedGoal.id === 'custom') {
      finalGoal = {
        id: 'custom',
        title: `Капитал ${customCapitalMillions} млн ₽`,
        description: `Своя цель: накопить ${customCapitalMillions} 000 000 ₽ при радости не менее ${customJoyTarget} пунктов.`,
        targetCapital: customCapitalMillions * 1000000,
        minJoy: customJoyTarget,
        custom: true,
      };
    }

    onStartGame({
      playerName: playerName.trim() || 'Инвестор',
      character: selectedCharacter,
      mode: selectedMode,
      goal: finalGoal,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6">
        {/* Modal Title */}
        <div className="text-center space-y-1.5 pb-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Новое финансовое путешествие</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Начало Новой Игры
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Выберите персонажа, формат игры и поставьте цель: играйте классические 10 лет или идите к своей мечте сколько угодно времени!
          </p>
        </div>

        {/* Player Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Имя игрока (для Зала Славы)
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Введите ваше имя"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all"
            maxLength={25}
          />
        </div>

        {/* Step 1: Mode Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            1. Выберите режим игры
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 10 years */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedMode('10_YEARS');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedMode === '10_YEARS'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-amber-400" />
                {selectedMode === '10_YEARS' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="font-bold text-sm">Классика: 10 Лет</div>
              <div
                className={`text-xs mt-1 ${
                  selectedMode === '10_YEARS' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Ровно 10 ходов. Задача — заработать максимальный капитал и удержать радость ≥ 80.
              </div>
            </button>

            {/* Goal Mode (Endless until reached) */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedMode('GOAL');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedMode === 'GOAL'
                  ? 'border-emerald-600 bg-emerald-900 text-white shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-emerald-400" />
                {selectedMode === 'GOAL' && <Check className="w-4 h-4 text-emerald-300" />}
              </div>
              <div className="font-bold text-sm">Режим Цели (Без лимита)</div>
              <div
                className={`text-xs mt-1 ${
                  selectedMode === 'GOAL' ? 'text-emerald-200' : 'text-slate-500'
                }`}
              >
                Выбираете мечту и идете к ней столько лет, сколько понадобится!
              </div>
            </button>

            {/* Endless Sandbox */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedMode('SANDBOX');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedMode === 'SANDBOX'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <InfinityIcon className="w-5 h-5 text-teal-400" />
                {selectedMode === 'SANDBOX' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="font-bold text-sm">Песочница (Sandbox)</div>
              <div
                className={`text-xs mt-1 ${
                  selectedMode === 'SANDBOX' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Абсолютная свобода: неограниченное число лет, эксперименты и финансовая жизнь.
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Goal selection if GOAL mode */}
        {selectedMode === 'GOAL' && (
          <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              2. Выберите жизненную цель
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INITIAL_LIFE_GOALS.filter(
                (g) => g.id !== 'mode_10_years' && g.id !== 'goal_sandbox'
              ).map((goal) => {
                const isSelected = selectedGoal.id === goal.id;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedGoal(goal);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-white text-slate-900 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm text-slate-900 flex items-center justify-between">
                      <span>{goal.title}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {goal.description}
                    </div>
                  </button>
                );
              })}

              {/* Custom Goal Option */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedGoal({
                    id: 'custom',
                    title: 'Своя цель',
                    description: 'Настроить собственные целевые значения капитала и радости',
                    targetCapital: customCapitalMillions * 1000000,
                    minJoy: customJoyTarget,
                    custom: true,
                  });
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedGoal.id === 'custom'
                    ? 'border-emerald-600 bg-white text-slate-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                }`}
              >
                <div className="font-semibold text-xs sm:text-sm text-slate-900 flex items-center justify-between">
                  <span>Своя цель (Настроить)</span>
                  {selectedGoal.id === 'custom' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Укажите желаемый капитал в миллионах и минимальный порог радости.
                </div>
              </button>
            </div>

            {/* Custom Goal Sliders */}
            {selectedGoal.id === 'custom' && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3 mt-2 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Целевой капитал:</span>
                    <span className="font-bold text-emerald-700 tabular-nums">{customCapitalMillions} млн ₽</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={customCapitalMillions}
                    onChange={(e) => setCustomCapitalMillions(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Минимальная радость:</span>
                    <span className="font-bold text-purple-700 tabular-nums">{customJoyTarget} из 100</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={95}
                    step={5}
                    value={customJoyTarget}
                    onChange={(e) => setCustomJoyTarget(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Character Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            {selectedMode === 'GOAL' ? '3' : '2'}. Выберите персонажа
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INITIAL_CHARACTERS.map((char) => {
              const isSelected = selectedCharacter.id === char.id;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedCharacter(char);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50/90 ring-2 ring-slate-900/10 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-600" />
                      {char.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                    {char.description}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 border-t border-slate-200/60 pt-2">
                    <span>Зарплата: {(char.initialSalary / 12).toLocaleString('ru-RU')} ₽/мес</span>
                    <span aria-hidden="true">·</span>
                    <span>Старт: {char.initialCash.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={handleStart}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Начать игру</span>
          </button>
        </div>
      </div>
    </div>
  );
};
