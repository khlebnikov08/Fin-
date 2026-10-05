import React from 'react';
import { Download, Package, FileCode, CheckCircle2, X, ExternalLink, Server } from 'lucide-react';
import { sound } from '../../utils/audio';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                Скачать архив игры
              </h3>
              <p className="text-xs text-slate-500">
                Готовые файлы для развертывания на вашем хостинге
              </p>
            </div>
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

        {/* Options */}
        <div className="space-y-3.5">
          {/* Option 1: Production Build */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 hover:border-emerald-300 transition-all flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  Готовая сборка для хостинга (dist)
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  Рекомендуется
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Скомпилированные статические файлы (HTML, CSS, JS). Достаточно просто распаковать архив в корневую папку сайта (`public_html`, `www`, Nginx, Apache, Timeweb, Beget, cPanel).
              </p>
            </div>

            <a
              href="/finlife-production-build.zip"
              download="finlife-production-build.zip"
              onClick={() => sound.playSuccess()}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-center"
            >
              <Download className="w-4 h-4" />
              <span>Скачать готовую сборку (finlife-production-build.zip)</span>
            </a>
          </div>

          {/* Option 2: Full Source Code */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:border-slate-300 transition-all flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-blue-600" />
                  Полный исходный код проекта
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  React + TypeScript + Vite
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Полные исходники с `package.json`, компонентами и инструкцией `DEPLOY.md`. Запуск через `npm install` и `npm run dev` или `npm run build`.
              </p>
            </div>

            <a
              href="/finlife-source-code.zip"
              download="finlife-source-code.zip"
              onClick={() => sound.playSuccess()}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-center"
            >
              <Download className="w-4 h-4" />
              <span>Скачать исходный код (finlife-source-code.zip)</span>
            </a>
          </div>
        </div>

        {/* Quick Instructions */}
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 space-y-1.5">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-slate-500" />
            <span>Как развернуть на хостинге:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-500 pl-1">
            <li>Скачайте архив готовой сборки <code>finlife-production-build.zip</code>.</li>
            <li>Распакуйте его в директорию вашего сайта (например, <code>public_html</code>).</li>
            <li>Откройте домен в браузере — игра сразу заработает без настройки баз данных!</li>
          </ol>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="py-2 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
