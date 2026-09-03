import React, { useState } from 'react';
import { X, Trash2, Bookmark, BookmarkCheck, Search, Volume2, Mic } from 'lucide-react';
import { HistoryItem } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { speakText } from '../utils/speech';
import { useTheme } from '../context/ThemeContext';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  onClearHistory: () => void;
  onPracticeItem?: (item: HistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onToggleFavorite,
  onClearHistory,
  onPracticeItem,
}) => {
  const { theme, styles } = useTheme();
  const [filterFav, setFilterFav] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (filterFav && !item.isFavorite) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.query.toLowerCase().includes(q) ||
        item.result.original.toLowerCase().includes(q) ||
        item.result.meaning_vi.toLowerCase().includes(q) ||
        item.result.vi_transliteration.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className={`w-full max-w-md ${styles.bgCard} h-full shadow-2xl flex flex-col border-l-2 ${styles.border}`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b-2 ${styles.border} ${theme === 'black-gold' ? 'bg-[#06070A]' : 'bg-[#0B132B]'} flex items-center justify-between`}>
          <div>
            <h2 className={`text-lg font-black ${styles.textPrimary}`}>
              Lịch Sử Tra Cứu & Đã Lưu
            </h2>
            <p className={`text-xs ${styles.textSecondary} font-semibold`}>
              {history.length} mục đã tra cứu
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 ${styles.textSecondary} hover:${styles.textPrimary} rounded-full hover:${styles.bgElevated} transition-colors cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search */}
        <div className={`p-4 border-b-2 ${styles.border} space-y-3 ${theme === 'black-gold' ? 'bg-[#0E1017]' : 'bg-[#0D1830]'}`}>
          <div className="relative">
            <Search className={`w-4 h-4 ${styles.textSecondary} absolute left-3.5 top-3`} />
            <input
              type="text"
              placeholder="Tìm kiếm từ đã tra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 text-xs ${styles.bgInput} border-2 ${styles.border} ${styles.borderFocus} rounded-xl focus:outline-none font-semibold ${styles.textLight} placeholder:text-gray-500`}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setFilterFav(!filterFav)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors font-bold cursor-pointer ${
                filterFav
                  ? `${styles.btnPrimary}`
                  : `${styles.bgCardSubtle} border ${styles.border} ${styles.textLight} hover:${styles.textPrimary} hover:${styles.bgElevated}`
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Chỉ hiển thị đã lưu ({history.filter((h) => h.isFavorite).length})</span>
            </button>

            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Xóa toàn bộ lịch sử"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hết</span>
              </button>
            )}
          </div>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className={`text-center py-12 ${styles.textSecondary} space-y-2`}>
              <div className={`w-12 h-12 mx-auto rounded-full ${styles.bgCardSubtle} flex items-center justify-center`}>
                <Search className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold">Chưa có mục nào trong lịch sử.</p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const langConfig = SUPPORTED_LANGUAGES.find((l) => l.id === item.languageId);
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border-2 ${styles.border} hover:${styles.borderAccent} ${styles.bgCardSubtle} hover:${styles.bgElevated} transition-all space-y-2 group shadow-xs`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{langConfig?.flag}</span>
                      <span className={`text-[11px] font-bold ${styles.textSecondary}`}>
                        {langConfig?.name || item.targetLanguage}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Practice button */}
                      {onPracticeItem && (
                        <button
                          type="button"
                          onClick={() => {
                            onPracticeItem(item);
                            onClose();
                          }}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 rounded-full hover:bg-emerald-500/10 cursor-pointer"
                          title="Luyện phát âm từ này"
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          speakText(item.result.original, langConfig?.voiceLang || 'en-US')
                        }
                        className={`p-1.5 ${styles.textSecondary} hover:${styles.textPrimary} rounded-full hover:${styles.bgElevated} cursor-pointer`}
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleFavorite(item.id)}
                        className={`p-1.5 rounded-full cursor-pointer ${
                          item.isFavorite
                            ? `${styles.btnPrimary}`
                            : `${styles.textSecondary} hover:${styles.textPrimary} hover:${styles.bgElevated}`
                        }`}
                      >
                        {item.isFavorite ? (
                          <BookmarkCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Main content click to open */}
                  <div
                    onClick={() => {
                      onSelectHistory(item);
                      onClose();
                    }}
                    className="cursor-pointer"
                  >
                    <div className={`font-black text-base ${styles.textHeading} group-hover:${styles.textPrimary} transition-colors`}>
                      {item.result.original}
                    </div>
                    <div className={`text-xs font-bold ${styles.translitText} ${theme === 'black-gold' ? 'bg-[#090A0F] border-[#F59E0B]/40' : 'bg-[#0B132B] border-[#F97316]/40'} border px-2.5 py-0.5 rounded-full inline-block mt-1`}>
                      {item.result.vi_transliteration}
                    </div>
                    <div className={`text-xs ${styles.textSecondary} font-medium mt-1`}>
                      {item.result.meaning_vi}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
