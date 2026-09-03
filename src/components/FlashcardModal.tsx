import React, { useState } from 'react';
import { X, Volume2, ChevronLeft, ChevronRight, RotateCw, Sparkles } from 'lucide-react';
import { HistoryItem } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { speakText } from '../utils/speech';
import { useTheme } from '../context/ThemeContext';

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: HistoryItem[];
}

export const FlashcardModal: React.FC<FlashcardModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const { theme, styles } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  if (cards.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
        <div className={`w-full max-w-md ${styles.bgCard} rounded-[32px] p-8 text-center space-y-4 shadow-2xl border-2 ${styles.border}`}>
          <div className={`w-14 h-14 mx-auto rounded-full ${styles.bgCardSubtle} ${styles.textPrimary} flex items-center justify-center border-2 ${styles.border}`}>
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className={`font-black ${styles.textPrimary} text-lg`}>Chưa có thẻ từ vựng nào</h3>
          <p className={`text-xs ${styles.textLight} leading-relaxed font-medium`}>
            Hãy tra cứu một vài từ hoặc câu trước, sau đó mở chế độ Ôn tập Thẻ để kiểm tra khả năng phát âm và ghi nhớ nhé!
          </p>
          <button
            type="button"
            onClick={onClose}
            className={`px-6 py-3 ${styles.btnPrimary} font-bold text-xs rounded-full shadow-md transition-all cursor-pointer`}
          >
            Quay lại tra cứu
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex] || cards[0];
  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.id === currentCard.languageId);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(currentCard.result.original, langConfig?.voiceLang || 'en-US');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`relative w-full max-w-md ${styles.bgCard} rounded-[32px] shadow-2xl border-4 ${styles.borderAccent} overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b-2 ${styles.border} flex items-center justify-between ${theme === 'black-gold' ? 'bg-[#06070A]' : 'bg-[#0B132B]'}`}>
          <div className="flex items-center gap-2">
            <span className="text-base">{langConfig?.flag}</span>
            <span className={`font-bold text-xs ${styles.textPrimary}`}>
              {langConfig?.name} · Thẻ {currentIndex + 1} / {cards.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 ${styles.textSecondary} hover:${styles.textPrimary} rounded-full hover:${styles.bgElevated} cursor-pointer transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flashcard Body */}
        <div className="p-6 sm:p-8 flex flex-col items-center">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full min-h-[240px] p-6 rounded-[24px] border-3 border-dashed ${styles.borderAccent} ${styles.bgCardSubtle} hover:${styles.bgElevated} flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none shadow-md group`}
          >
            {!isFlipped ? (
              <div className="space-y-3">
                <span className={`text-xs font-black ${styles.textSecondary} uppercase tracking-[0.2em]`}>
                  Nghĩa tiếng Việt (Nhấn để lật)
                </span>
                <div className={`text-2xl font-black ${styles.textHeading}`}>
                  {currentCard.result.meaning_vi}
                </div>
                <div className={`text-xs ${styles.textPrimary} font-bold flex items-center justify-center gap-1.5 mt-3 ${theme === 'black-gold' ? 'bg-[#090A0F]' : 'bg-[#0B132B]'} px-3.5 py-1.5 rounded-full border ${styles.border}`}>
                  <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                  <span>Chạm để xem từ & bồi âm</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <span className={`text-xs font-bold ${styles.textSecondary} uppercase tracking-wider`}>
                  {langConfig?.name}
                </span>
                <div className={`text-3xl font-black ${styles.textHeading} leading-snug`}>
                  {currentCard.result.original}
                </div>
                <div className={`text-base font-black ${styles.translitText} ${theme === 'black-gold' ? 'bg-[#090A0F] border-[#F59E0B]/60' : 'bg-[#0B132B] border-[#F97316]/60'} border-2 px-4 py-1.5 rounded-full inline-block`}>
                  {currentCard.result.vi_transliteration}
                </div>
                <div className={`text-xs font-mono ${styles.textLight} font-semibold`}>
                  /{currentCard.result.ipa}/
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePlay}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full ${styles.btnPrimary} text-xs font-bold shadow-md cursor-pointer transition-all`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Nghe đọc</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer controls */}
        <div className={`px-6 py-4 ${theme === 'black-gold' ? 'bg-[#06070A]' : 'bg-[#0B132B]'} border-t-2 ${styles.border} flex items-center justify-between`}>
          <button
            type="button"
            onClick={handlePrev}
            className={`flex items-center gap-1 px-4 py-2 text-xs font-bold ${styles.btnSecondary} rounded-full cursor-pointer transition-colors`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trước</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className={`text-xs ${styles.textPrimary} font-bold hover:underline cursor-pointer`}
          >
            {isFlipped ? 'Xem lại nghĩa' : 'Lật xem phát âm'}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className={`flex items-center gap-1 px-4 py-2 text-xs font-bold ${styles.btnPrimary} rounded-full shadow-md cursor-pointer transition-colors`}
          >
            <span>Tiếp theo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
