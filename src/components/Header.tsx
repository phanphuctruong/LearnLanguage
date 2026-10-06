import React from 'react';
import { BookOpen, Sparkles, HelpCircle, History, Layers, Mic, Palette, MessageCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onOpenRules: () => void;
  onOpenFlashcards: () => void;
  onToggleHistory: () => void;
  onOpenPronunciation?: () => void;
  onOpenChat?: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRules,
  onOpenFlashcards,
  onToggleHistory,
  onOpenPronunciation,
  onOpenChat,
  historyCount,
}) => {
  const { theme, styles, toggleTheme } = useTheme();

  return (
    <header
      className={`border-b-2 ${styles.border} ${
        theme === 'black-gold' ? 'bg-[#0E1017]' : 'bg-[#0D1B36]'
      } sticky top-0 z-30 shadow-lg`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg font-black text-xl tracking-tighter select-none ${
              theme === 'black-gold' ? 'bg-[#F59E0B] text-[#090A0F]' : 'bg-[#F97316] text-[#0B132B]'
            }`}
          >
            LV
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${styles.textPrimary}`}>
                LingoViệt
              </h1>
              <span
                className={`hidden md:inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full border ${styles.badgeAccent}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Phiên Âm Bồi AI
              </span>
            </div>
            <p className={`text-xs ${styles.textSecondary} font-semibold line-clamp-1`}>
              10 Ngôn ngữ: Anh · Nhật · Trung · Pháp · Thái · Đức · T.B.Nha · Nga · Hàn · Ả Rập
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Chat with AI Assistant Button */}
          {onOpenChat && (
            <button
              type="button"
              id="btn-header-open-chat"
              onClick={onOpenChat}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-black rounded-full transition-all cursor-pointer shadow-md ${
                theme === 'black-gold'
                  ? 'bg-[#F59E0B] hover:bg-[#FBBF24] text-[#090A0F]'
                  : 'bg-[#F97316] hover:bg-[#FB923C] text-[#0B132B]'
              }`}
              title="Chat tương tác với Trợ lý ngôn ngữ (có dịch nghĩa tiếng Việt)"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Chat Trợ Lý</span>
              <span className="sm:hidden">Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}

          {/* Theme Switcher Button */}
          <button
            type="button"
            id="btn-toggle-theme"
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border-2 ${
              theme === 'black-gold'
                ? 'bg-[#191C28] text-[#FBBF24] border-[#F59E0B] hover:bg-[#252A3B]'
                : 'bg-[#132240] text-[#FB923C] border-[#F97316] hover:bg-[#1C325B]'
            }`}
            title="Đổi phong cách giao diện (Xanh Navi & Cam / Đen & Vàng Gold)"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {theme === 'black-gold' ? '✨ Đen & Vàng Gold' : '🍊 Navi & Cam'}
            </span>
            <span className="sm:hidden">{theme === 'black-gold' ? 'Gold' : 'Cam'}</span>
          </button>

          {/* Pronunciation Practice Button */}
          {onOpenPronunciation && (
            <button
              type="button"
              id="btn-header-pronunciation"
              onClick={onOpenPronunciation}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border-2 ${styles.btnSecondary} hover:${styles.borderAccent}`}
              title="Phòng luyện và chỉnh sửa phát âm"
            >
              <Mic className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Luyện Phát Âm</span>
            </button>
          )}

          {/* Flashcards button */}
          <button
            type="button"
            id="btn-open-flashcards"
            onClick={onOpenFlashcards}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border-2 ${styles.btnSecondary} hover:${styles.borderAccent}`}
            title="Thẻ ôn tập từ vựng"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden md:inline">Ôn Thẻ</span>
          </button>

          {/* Rules modal button */}
          <button
            type="button"
            id="btn-open-rules"
            onClick={onOpenRules}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border-2 ${styles.btnSecondary} hover:${styles.borderAccent}`}
            title="Quy tắc phiên âm bồi & cấu trúc JSON"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden lg:inline">Quy Tắc</span>
          </button>

          {/* History button */}
          <button
            type="button"
            id="btn-toggle-history"
            onClick={onToggleHistory}
            className={`relative flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border-2 ${styles.btnSecondary} hover:${styles.borderAccent}`}
            title="Lịch sử tra cứu & từ đã lưu"
          >
            <History className="w-4 h-4" />
            <span className="hidden md:inline">Lịch Sử</span>
            {historyCount > 0 && (
              <span
                className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black rounded-full shadow-xs ${
                  theme === 'black-gold'
                    ? 'bg-[#F59E0B] text-[#090A0F]'
                    : 'bg-[#F97316] text-[#0B132B]'
                }`}
              >
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
