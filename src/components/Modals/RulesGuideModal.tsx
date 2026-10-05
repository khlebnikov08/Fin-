import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { RULES_SLIDES } from '../../data/rulesContent';
import { sound } from '../../utils/audio';

interface RulesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesGuideModal: React.FC<RulesGuideModalProps> = ({ isOpen, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (!isOpen) return null;

  const slide = RULES_SLIDES[currentSlideIndex];

  const handleNext = () => {
    sound.playClick();
    if (currentSlideIndex < RULES_SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    sound.playClick();
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 flex flex-col justify-between min-h-[540px]">
        {/* Top bar with back icon, dots and close */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className={`p-2 rounded-full border border-slate-200 transition-colors ${
                currentSlideIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Назад"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Pagination dots (like user screenshots) */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] scrollbar-none py-1">
              {RULES_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    setCurrentSlideIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlideIndex
                      ? 'w-6 bg-slate-900'
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Слайд ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Slide Content */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              <span>{slide.category}</span>
              {slide.highlightTag && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-500 font-normal">{slide.highlightTag}</span>
                </>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
              {slide.title}
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {slide.text}
            </p>

            {slide.bulletPoints && slide.bulletPoints.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 mt-4">
                {slide.bulletPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4 mt-6">
          <span className="text-xs text-slate-400 font-mono">
            {currentSlideIndex + 1} из {RULES_SLIDES.length}
          </span>

          <div className="flex items-center gap-2">
            {currentSlideIndex < RULES_SLIDES.length - 1 ? (
              <button
                onClick={handleNext}
                className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>Далее</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playSuccess();
                  onClose();
                }}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Понятно, в игру!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
