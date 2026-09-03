import React from 'react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { TargetLanguageCode } from '../types';
import { useTheme } from '../context/ThemeContext';

interface LanguageSelectorProps {
  selectedLang: TargetLanguageCode;
  onSelectLang: (lang: TargetLanguageCode) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLang,
  onSelectLang,
}) => {
  const { theme, styles } = useTheme();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <label className={`text-xs font-black uppercase tracking-[0.15em] ${styles.textSecondary}`}>
          Chọn Ngôn Ngữ Mục Tiêu
        </label>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${styles.badgeAccent}`}>
          {SUPPORTED_LANGUAGES.length} ngôn ngữ chuẩn
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              id={`lang-btn-${lang.id}`}
              onClick={() => onSelectLang(lang.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer text-sm font-bold ${
                isSelected
                  ? `${styles.btnPrimary}`
                  : `${styles.bgCardSubtle} ${styles.textLight} border-2 ${styles.border} hover:${styles.borderAccent} hover:${styles.bgElevated}`
              }`}
            >
              <span className="text-base" role="img" aria-label={lang.name}>
                {lang.flag}
              </span>
              <span>{lang.name}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  isSelected
                    ? 'bg-black/20 text-current'
                    : `${theme === 'black-gold' ? 'bg-[#090A0F]' : 'bg-[#0B132B]'} ${styles.textPrimary} border ${styles.border}`
                }`}
              >
                {lang.ruleExample.transliteration}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
