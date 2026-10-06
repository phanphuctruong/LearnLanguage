import React, { useState } from 'react';
import {
  Volume2,
  Volume1,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  SlidersHorizontal,
  FileJson,
  Layout,
  Mic,
  Layers,
  MessageCircle,
} from 'lucide-react';
import { TranslationResult, TargetLanguageCode, LeveledExpression } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { speakText, stopSpeech } from '../utils/speech';
import { JsonViewer } from './JsonViewer';
import { useTheme } from '../context/ThemeContext';

interface ResultCardProps {
  result: TranslationResult;
  selectedLang: TargetLanguageCode;
  query: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenPronunciation?: (targetOverride?: TranslationResult) => void;
  onOpenChat?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  selectedLang,
  query,
  isFavorite,
  onToggleFavorite,
  onOpenPronunciation,
  onOpenChat,
}) => {
  const { theme, styles } = useTheme();
  const [viewMode, setViewMode] = useState<'card' | 'json'>('card');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [playingLevelIdx, setPlayingLevelIdx] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLang);

  const handlePlayAudio = (rate: number = playbackSpeed) => {
    setPlaybackSpeed(rate);
    setPlayingLevelIdx(null);
    if (isPlaying && playbackSpeed === rate && playingLevelIdx === null) {
      stopSpeech();
      setIsPlaying(false);
      return;
    }

    if (isPlaying) {
      stopSpeech();
    }

    setIsPlaying(true);
    speakText(
      result.original,
      currentLang?.voiceLang || 'en-US',
      rate,
      () => setIsPlaying(false),
      () => setIsPlaying(false)
    );
  };

  const handlePlayLevelAudio = (text: string, rate: number, idx: number) => {
    if (isPlaying && playingLevelIdx === idx && playbackSpeed === rate) {
      stopSpeech();
      setIsPlaying(false);
      setPlayingLevelIdx(null);
      return;
    }

    if (isPlaying) {
      stopSpeech();
    }

    setIsPlaying(true);
    setPlaybackSpeed(rate);
    setPlayingLevelIdx(idx);
    speakText(
      text,
      currentLang?.voiceLang || 'en-US',
      rate,
      () => {
        setIsPlaying(false);
        setPlayingLevelIdx(null);
      },
      () => {
        setIsPlaying(false);
        setPlayingLevelIdx(null);
      }
    );
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Split transliteration by hyphens or spaces to present syllables nicely
  const syllables = result.vi_transliteration
    ? result.vi_transliteration.split(/[-–—\s]+/).filter(Boolean)
    : [];

  const levelExpressions: LeveledExpression[] = result.level_expressions || [];

  return (
    <div className={`w-full ${styles.bgCard} rounded-[36px] sm:rounded-[40px] shadow-2xl border-4 ${styles.borderAccent} relative overflow-hidden p-6 sm:p-10`}>
      {/* Decorative background shapes */}
      <div className={`absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-10 pointer-events-none ${styles.borderAccent}`} />
      <div className={`absolute -top-10 -left-10 w-44 h-44 rounded-full opacity-10 pointer-events-none ${styles.borderAccent}`} />

      {/* Top action row */}
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label={currentLang?.name}>
            {currentLang?.flag}
          </span>
          <span className={`font-bold text-sm ${styles.textPrimary} ${styles.bgCardSubtle} px-3.5 py-1 rounded-full border ${styles.border}`}>
            {currentLang?.name}
          </span>
          <span className={`text-xs ${styles.textSecondary} font-semibold hidden sm:inline`}>
            {currentLang?.nativeName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className={`flex items-center ${styles.bgCardSubtle} p-1 rounded-full text-xs font-bold ${styles.textLight} border ${styles.border}`}>
            <button
              type="button"
              id="view-card-btn"
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
                viewMode === 'card'
                  ? `${styles.btnPrimary} shadow-xs`
                  : `hover:${styles.textPrimary}`
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Thẻ học</span>
            </button>
            <button
              type="button"
              id="view-json-btn"
              onClick={() => setViewMode('json')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
                viewMode === 'json'
                  ? `${styles.btnPrimary} shadow-xs`
                  : `hover:${styles.textPrimary}`
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>

          {/* Favorite button */}
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`p-2 rounded-full border-2 transition-all cursor-pointer ${
              isFavorite
                ? `${styles.btnPrimary}`
                : `${styles.bgCardSubtle} ${styles.border} ${styles.textSecondary} hover:${styles.textPrimary} hover:${styles.bgElevated}`
            }`}
            title={isFavorite ? 'Bỏ lưu từ này' : 'Lưu vào từ vựng yêu thích'}
          >
            {isFavorite ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {viewMode === 'json' ? (
        <div className="relative z-10 py-2">
          <JsonViewer data={result} />
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {/* Audio Speaker floating trigger & Pronunciation Lab Button */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <button
                type="button"
                id="btn-play-audio-normal"
                onClick={() => handlePlayAudio(1.0)}
                className={`px-5 py-3.5 rounded-full flex items-center gap-2.5 font-black text-sm sm:text-base transition-all shadow-lg cursor-pointer border-2 ${
                  isPlaying && playbackSpeed === 1.0
                    ? `${styles.btnPrimary} scale-105 ring-4 ring-orange-500/30`
                    : `${styles.btnPrimary} hover:scale-102`
                }`}
                title="Phát âm chuẩn (1.0x)"
              >
                <Volume2 className={`w-6 h-6 ${isPlaying && playbackSpeed === 1.0 ? 'animate-bounce' : ''}`} />
                <span>{isPlaying && playbackSpeed === 1.0 ? 'Đang phát âm...' : 'Nghe phát âm chuẩn'}</span>
              </button>

              <button
                type="button"
                id="btn-play-audio-slow"
                onClick={() => handlePlayAudio(0.7)}
                className={`px-4 py-3 rounded-full text-xs sm:text-sm font-bold border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isPlaying && playbackSpeed === 0.7
                    ? `${styles.btnPrimary} ring-4 ring-orange-500/30`
                    : `${styles.btnSecondary}`
                }`}
                title="Phát âm chậm cho người mới bắt đầu (0.7x)"
              >
                <Volume1 className={`w-4 h-4 ${styles.textPrimary}`} />
                <span>Đọc chậm 0.7x</span>
              </button>

              {onOpenPronunciation && (
                <button
                  type="button"
                  id="btn-practice-pronunciation-card"
                  onClick={onOpenPronunciation}
                  className="px-5 py-3.5 rounded-full flex items-center gap-2 font-black text-sm sm:text-base border-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer hover:scale-102 transition-all"
                  title="Mở phòng luyện đọc, chấm điểm và AI chỉnh sửa lỗi phát âm chi tiết"
                >
                  <Mic className="w-5 h-5" />
                  <span>Luyện & Sửa Lỗi Phát Âm</span>
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </button>
              )}
            </div>
            {isPlaying && (
              <span className={`text-xs ${styles.textPrimary} font-semibold animate-pulse`}>
                🔊 Đang phát âm bản xứ (nhấn lại để dừng)
              </span>
            )}
          </div>

          <span className={`${styles.textSecondary} font-bold text-xs sm:text-sm tracking-[0.2em] uppercase mb-3`}>
            Kết quả tra cứu
          </span>

          <div className="mb-8">
            <h3 className={`text-4xl sm:text-6xl font-black ${styles.textHeading} mb-3 tracking-tight`}>
              {result.original}
            </h3>
            <p className={`text-xl sm:text-3xl ${styles.textPrimary} font-semibold`}>
              ({result.meaning_vi})
            </p>
          </div>

          {/* 2-column info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl mb-8 text-left">
            {/* IPA card */}
            <div className={`${styles.bgCardSubtle} p-5 sm:p-6 rounded-3xl border-2 ${styles.border} shadow-xs relative`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold ${styles.textSecondary} uppercase tracking-wider block`}>
                  Phát âm IPA
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.ipa, 'ipa')}
                  className={`text-xs ${styles.textSecondary} hover:${styles.textPrimary} font-semibold flex items-center gap-1 cursor-pointer`}
                >
                  {copiedField === 'ipa' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <span className={`text-lg sm:text-xl font-mono ${styles.textLight} font-bold`}>
                {result.ipa.startsWith('/') ? result.ipa : `/${result.ipa}/`}
              </span>
            </div>

            {/* Tiếng Việt Bồi card */}
            <div className={`${styles.translitBg} p-5 sm:p-6 rounded-3xl border-2 shadow-lg relative`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold ${styles.textPrimary} uppercase tracking-wider block`}>
                  Tiếng Việt bồi
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.vi_transliteration, 'translit')}
                  className={`text-xs ${styles.textSecondary} hover:${styles.textPrimary} font-semibold flex items-center gap-1 cursor-pointer`}
                >
                  {copiedField === 'translit' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <span className={`text-xl sm:text-2xl font-black ${styles.translitText} uppercase tracking-wide block`}>
                {result.vi_transliteration}
              </span>
              {syllables.length > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {syllables.map((syl, i) => (
                    <span
                      key={i}
                      className={`px-2.5 py-0.5 rounded-full ${
                        theme === 'black-gold' ? 'bg-[#090A0F] border-[#F59E0B]/50' : 'bg-[#0B132B] border-[#F97316]/50'
                      } border ${styles.textPrimary} text-xs font-bold shadow-2xs`}
                    >
                      {syl}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action button pills */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
            {onOpenChat && (
              <button
                type="button"
                id="btn-card-open-chat"
                onClick={onOpenChat}
                className={`px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border-2 ${
                  theme === 'black-gold'
                    ? 'bg-[#191B26] border-[#F59E0B] text-[#FBBF24] hover:bg-[#252A3B]'
                    : 'bg-[#142343] border-[#F97316] text-[#FB923C] hover:bg-[#1A305D]'
                }`}
                title="Chat với trợ lý ngôn ngữ về câu này (có dịch tiếng Việt)"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat với Trợ lý AI</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleCopy(result.original + ' - ' + result.vi_transliteration, 'all')}
              className={`px-6 sm:px-8 py-3 ${styles.btnSecondary} rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2`}
            >
              {copiedField === 'all' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao chép kết quả</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onToggleFavorite}
              className={`px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isFavorite
                  ? `${styles.btnPrimary}`
                  : `${styles.btnSecondary}`
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isFavorite ? 'Đã lưu từ' : 'Lưu vào bộ nhớ'}</span>
            </button>
          </div>

          {/* CÁC CÂU DIỄN ĐẠT THEO CẤP ĐỘ (LEVELED EXPRESSIONS) */}
          {levelExpressions.length > 0 && (
            <div className="w-full mt-10 pt-8 border-t-2 border-dashed border-gray-700/40 text-left">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                <div>
                  <h4 className={`text-lg sm:text-xl font-black ${styles.textHeading} flex items-center gap-2`}>
                    <Layers className="w-5 h-5 text-amber-400" />
                    Các câu diễn đạt theo cấp độ
                  </h4>
                  <p className={`text-xs sm:text-sm ${styles.textSecondary} mt-0.5`}>
                    Học cách dùng từ tự nhiên theo từng hoàn cảnh từ cơ bản đến nâng cao
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${styles.textPrimary} ${styles.bgCardSubtle} px-3 py-1.5 rounded-full border ${styles.border} flex items-center gap-1.5`}>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Đa dạng ngữ cảnh & Bồi âm
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {levelExpressions.map((exp, idx) => {
                  const levelBadgeColor =
                    exp.level === 'basic'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : exp.level === 'intermediate'
                      ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30';

                  const levelNumber = idx + 1;

                  return (
                    <div
                      key={idx}
                      className={`p-5 sm:p-6 rounded-[24px] ${styles.bgCardSubtle} border-2 ${styles.border} hover:${styles.borderAccent} transition-all shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5`}
                    >
                      <div className="flex-1 space-y-2.5">
                        {/* Level & Context Tags */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold border ${levelBadgeColor}`}>
                            Cấp độ {levelNumber}: {exp.level_label}
                          </span>
                          {exp.context && (
                            <span className={`text-[11px] ${styles.textSecondary} italic font-medium px-2.5 py-0.5 rounded-full ${styles.bgInput} border ${styles.border}`}>
                              📌 {exp.context}
                            </span>
                          )}
                        </div>

                        {/* Foreign Sentence & Meaning */}
                        <div>
                          <div className={`text-xl sm:text-2xl font-black ${styles.textHeading} tracking-tight`}>
                            {exp.original}
                          </div>
                          <div className={`text-sm sm:text-base font-semibold ${styles.textPrimary} mt-0.5`}>
                            → {exp.meaning_vi}
                          </div>
                        </div>

                        {/* Pronunciation block */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap pt-1">
                          {/* Tiếng Việt bồi */}
                          <div className={`px-3.5 py-1 rounded-xl ${styles.translitBg} border border-amber-500/30`}>
                            <span className="text-[10px] uppercase font-bold text-amber-400 mr-1.5">Bồi âm:</span>
                            <span className={`font-black ${styles.translitText} text-sm sm:text-base`}>
                              {exp.vi_transliteration}
                            </span>
                          </div>

                          {/* IPA */}
                          <div className={`px-3 py-1 rounded-xl ${styles.bgInput} border ${styles.border} text-xs font-mono ${styles.textLight}`}>
                            {exp.ipa.startsWith('/') ? exp.ipa : `/${exp.ipa}/`}
                          </div>
                        </div>
                      </div>

                      {/* Level expression action buttons */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-700/30">
                        {/* Normal Audio */}
                        <button
                          type="button"
                          onClick={() => handlePlayLevelAudio(exp.original, 1.0, idx)}
                          className={`p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                            isPlaying && playingLevelIdx === idx && playbackSpeed === 1.0
                              ? `${styles.btnPrimary} ring-2 ring-orange-500/50`
                              : `${styles.btnSecondary}`
                          }`}
                          title="Nghe chuẩn 1.0x"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span className="hidden sm:inline">1.0x</span>
                        </button>

                        {/* Slow Audio */}
                        <button
                          type="button"
                          onClick={() => handlePlayLevelAudio(exp.original, 0.7, idx)}
                          className={`p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isPlaying && playingLevelIdx === idx && playbackSpeed === 0.7
                              ? `${styles.btnPrimary} ring-2 ring-orange-500/50`
                              : `${styles.bgInput} ${styles.textSecondary} hover:${styles.textPrimary} ${styles.border}`
                          }`}
                          title="Đọc chậm 0.7x"
                        >
                          <Volume1 className="w-4 h-4" />
                          <span className="hidden sm:inline">0.7x</span>
                        </button>

                        {/* Direct Pronunciation Lab for this level sentence */}
                        {onOpenPronunciation && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenPronunciation({
                                original: exp.original,
                                meaning_vi: exp.meaning_vi,
                                ipa: exp.ipa,
                                vi_transliteration: exp.vi_transliteration,
                                level_expressions: result.level_expressions,
                              })
                            }
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                            title="Luyện phát âm trực tiếp câu này với AI (không giới hạn lượt)"
                          >
                            <Mic className="w-4 h-4" />
                            <span>Luyện phát âm</span>
                          </button>
                        )}

                        {/* Copy button */}
                        <button
                          type="button"
                          onClick={() => handleCopy(`${exp.original} (${exp.vi_transliteration})`, `level-${idx}`)}
                          className={`p-2 rounded-xl ${styles.bgInput} ${styles.textSecondary} hover:${styles.textPrimary} border ${styles.border} transition-all cursor-pointer`}
                          title="Sao chép câu này"
                        >
                          {copiedField === `level-${idx}` ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
