import React from 'react';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
import { TRANSLITERATION_RULES } from '../data/languages';
import { useTheme } from '../context/ThemeContext';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const { theme, styles } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`relative w-full max-w-lg ${styles.bgCard} rounded-[28px] shadow-2xl border-2 ${styles.borderAccent} overflow-hidden max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b-2 ${styles.border} flex items-center justify-between ${theme === 'black-gold' ? 'bg-[#06070A]' : 'bg-[#0B132B]'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl ${styles.bgCardSubtle} ${styles.textPrimary} flex items-center justify-center border ${styles.border}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className={`text-base font-black ${styles.textPrimary}`}>
              Quy Tắc Phiên Âm & Định Dạng JSON
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 ${styles.textSecondary} hover:${styles.textPrimary} rounded-full hover:${styles.bgElevated} transition-colors cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className={`p-6 overflow-y-auto space-y-4 text-sm ${styles.textLight}`}>
          <div className={`p-4 rounded-2xl ${styles.bgCardSubtle} border-2 ${styles.border} ${styles.textLight} text-xs leading-relaxed`}>
            <p className={`font-bold ${styles.textPrimary} mb-1 flex items-center gap-1.5 uppercase tracking-wider`}>
              <ShieldCheck className="w-4 h-4" />
              Tiêu chuẩn phiên âm tiếng Việt bồi
            </p>
            Mục tiêu là giúp người Việt có thể cất tiếng nói ngay lập tức một cách tự nhiên nhất bằng cách mượn chữ quốc ngữ và thanh điệu tiếng Việt để ký âm chuẩn xác.
          </div>

          {/* Language Rules Table */}
          <div className="space-y-2.5">
            <h3 className={`font-black text-xs uppercase tracking-[0.15em] ${styles.textSecondary}`}>
              {TRANSLITERATION_RULES.length} Ngôn ngữ hỗ trợ & Quy chuẩn
            </h3>
            <div className="space-y-2.5">
              {TRANSLITERATION_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border-2 ${styles.border} ${styles.bgCardSubtle} space-y-1`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-black ${styles.textPrimary} text-xs`}>
                      {rule.lang}
                    </span>
                    <span className={`text-xs font-bold ${theme === 'black-gold' ? 'bg-[#090A0F]' : 'bg-[#0B132B]'} px-2.5 py-0.5 rounded-full border ${styles.border} ${styles.translitText}`}>
                      {rule.example}
                    </span>
                  </div>
                  <p className={`text-xs ${styles.textLight} font-medium leading-normal`}>
                    {rule.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* JSON Specification */}
          <div className="space-y-2">
            <h3 className={`font-black text-xs uppercase tracking-[0.15em] ${styles.textSecondary}`}>
              Cấu trúc JSON phản hồi
            </h3>
            <pre className={`p-4 rounded-2xl ${styles.bgInput} ${styles.textLight} border ${styles.border} font-mono text-xs overflow-x-auto shadow-inner`}>
{`{
  "original": "Từ hoặc câu bằng ngôn ngữ mục tiêu",
  "meaning_vi": "Nghĩa tiếng Việt",
  "ipa": "Phát âm quốc tế IPA",
  "vi_transliteration": "Tiếng Việt bồi"
}`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 ${theme === 'black-gold' ? 'bg-[#06070A]' : 'bg-[#0B132B]'} border-t-2 ${styles.border} flex justify-end`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-6 py-2.5 ${styles.btnPrimary} font-bold text-xs rounded-full transition-all shadow-md cursor-pointer`}
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
