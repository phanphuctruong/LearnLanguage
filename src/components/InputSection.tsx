import React, { useRef, useEffect } from 'react';
import { Search, Sparkles, X, CornerDownLeft, Mic, Infinity } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { TargetLanguageCode } from '../types';
import { useTheme } from '../context/ThemeContext';

interface InputSectionProps {
  query: string;
  onChangeQuery: (value: string) => void;
  onSubmit: () => void;
  onPracticeNow?: () => void;
  isLoading: boolean;
  selectedLang: TargetLanguageCode;
  onSelectSample: (phrase: string) => void;
}

const COMMON_VIETNAMESE_SAMPLES = [
  'Xin chào',
  'Cảm ơn rất nhiều',
  'Tôi muốn gọi một tách cà phê',
  'Cái này bao nhiêu tiền?',
  'Rất vui được gặp bạn',
  'Chúc một ngày tốt lành',
];

export const InputSection: React.FC<InputSectionProps> = ({
  query,
  onChangeQuery,
  onSubmit,
  onPracticeNow,
  isLoading,
  selectedLang,
  onSelectSample,
}) => {
  const { theme, styles } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const currentLangConfig = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLang);

  useEffect(() => {
    // Focus input on mount or language switch
    inputRef.current?.focus();
  }, [selectedLang]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className={`w-full ${styles.bgCard} p-6 sm:p-8 rounded-[32px] shadow-2xl border-2 ${styles.border}`}>
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className={`text-lg font-bold ${styles.textPrimary}`}>
            Nhập tiếng Việt hoặc ngoại ngữ để dịch & luyện phát âm
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
            <Infinity className="w-3 h-3" />
            Không giới hạn số từ & lượt luyện
          </span>
          <span className={`text-xs ${styles.textSecondary} font-medium hidden sm:inline`}>
            <kbd className={`px-2 py-0.5 ${styles.bgCardSubtle} border ${styles.border} rounded-md text-[11px] font-mono ${styles.textLight}`}>Enter ↵</kbd>
          </span>
        </div>
      </div>

      <div className="relative mb-4">
        <input
          ref={inputRef}
          id="user-word-input"
          type="text"
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Nhập từ/câu tiếng Việt để dịch sang ${currentLangConfig?.name || 'ngôn ngữ đã chọn'}... VD: "Xin chào", "Tôi muốn ăn tối"...`}
          className={`w-full p-4 pr-24 sm:pr-32 ${styles.bgInput} ${styles.textLight} placeholder:text-gray-500 text-base font-semibold rounded-2xl border-2 ${styles.border} ${styles.borderFocus} outline-none transition-all shadow-inner`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onChangeQuery('');
                inputRef.current?.focus();
              }}
              className={`p-1.5 ${styles.textSecondary} hover:${styles.textPrimary} rounded-xl hover:${styles.bgElevated} transition-colors cursor-pointer`}
              title="Xóa chữ"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className={`${styles.textSecondary} px-2 hidden sm:block`}>
            <Search className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Buttons: Translate & Practice */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          id="btn-submit-translate"
          onClick={onSubmit}
          disabled={!query.trim() || isLoading}
          className={`w-full sm:w-auto flex-1 py-3.5 px-6 ${styles.btnPrimary} disabled:opacity-40 font-black text-sm tracking-wider uppercase rounded-2xl shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>ĐANG DỊCH & PHÂN TÍCH CẤP ĐỘ...</span>
            </>
          ) : (
            <>
              <span>DỊCH & TẠO CÁC CẤP ĐỘ</span>
              <CornerDownLeft className="w-4 h-4" />
            </>
          )}
        </button>

        {onPracticeNow && (
          <button
            type="button"
            id="btn-translate-and-practice"
            onClick={onPracticeNow}
            disabled={!query.trim() || isLoading}
            className="w-full sm:w-auto py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 font-black text-sm tracking-wider uppercase rounded-2xl shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            title="Dịch và lập tức mở phòng luyện phát âm AI"
          >
            <Mic className="w-4 h-4" />
            <span>DỊCH & LUYỆN PHÁT ÂM NGAY</span>
          </button>
        )}
      </div>

      {/* Quick sample chips */}
      <div className={`mt-5 pt-4 border-t ${styles.border} space-y-2.5`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold ${styles.textPrimary} uppercase tracking-wider flex items-center gap-1 mr-1`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Mẫu câu tiếng Việt (dịch sang {currentLangConfig?.name}):
          </span>
          {COMMON_VIETNAMESE_SAMPLES.map((viSample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSample(viSample)}
              className={`text-xs px-3 py-1 rounded-full ${styles.bgCardSubtle} ${styles.textLight} hover:${styles.borderAccent} border ${styles.border} transition-all font-semibold flex items-center gap-1 cursor-pointer`}
            >
              <span>{viSample}</span>
            </button>
          ))}
        </div>

        {currentLangConfig && currentLangConfig.samplePhrases.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className={`text-xs font-bold ${styles.textSecondary} uppercase tracking-wider flex items-center gap-1 mr-1`}>
              Mẫu {currentLangConfig.name}:
            </span>
            {currentLangConfig.samplePhrases.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSample(phrase.query)}
                className={`text-xs px-3 py-1 ${styles.btnSecondary} hover:${styles.borderAccent} rounded-full transition-all font-bold flex items-center gap-1.5 cursor-pointer`}
              >
                <span>{phrase.query}</span>
                <span className={`text-[10px] ${styles.textSecondary} font-normal`}>({phrase.label})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
