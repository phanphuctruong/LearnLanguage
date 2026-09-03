import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Play,
  Square,
  Flame,
  Award,
  BookOpen,
  Infinity,
  Layers,
  CornerDownLeft,
  Search,
} from 'lucide-react';
import { TranslationResult, LanguageConfig, PronunciationEvaluation } from '../types';
import { speakText, stopSpeech } from '../utils/speech';
import { useTheme } from '../context/ThemeContext';

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TranslationResult | null;
  targetLanguage: string;
  langConfig: LanguageConfig | undefined;
  onUpdateGlobalResult?: (newResult: TranslationResult) => void;
}

export const PronunciationModal: React.FC<PronunciationModalProps> = ({
  isOpen,
  onClose,
  result,
  targetLanguage,
  langConfig,
  onUpdateGlobalResult,
}) => {
  const { theme, styles } = useTheme();

  const [selectedLevelIndex, setSelectedLevelIndex] = useState<'main' | number>('main');
  const [customInput, setCustomInput] = useState('');
  const [isTranslatingNew, setIsTranslatingNew] = useState(false);
  const [practiceCount, setPracticeCount] = useState<number>(0);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evaluation, setEvaluation] = useState<PronunciationEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bestScore, setBestScore] = useState<number>(0);

  // Audio recording playback
  const [userAudioBlob, setUserAudioBlob] = useState<Blob | null>(null);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);

  // Native speech recognition ref
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const userAudioElementRef = useRef<HTMLAudioElement | null>(null);

  const levelExpressions = result?.level_expressions || [];

  const currentTarget =
    selectedLevelIndex !== 'main' && levelExpressions[selectedLevelIndex]
      ? {
          original: levelExpressions[selectedLevelIndex].original,
          meaning_vi: levelExpressions[selectedLevelIndex].meaning_vi,
          ipa: levelExpressions[selectedLevelIndex].ipa,
          vi_transliteration: levelExpressions[selectedLevelIndex].vi_transliteration,
          level_label: levelExpressions[selectedLevelIndex].level_label,
          context: levelExpressions[selectedLevelIndex].context,
        }
      : {
          original: result?.original || '',
          meaning_vi: result?.meaning_vi || '',
          ipa: result?.ipa || '',
          vi_transliteration: result?.vi_transliteration || '',
          level_label: 'Từ / Câu chính',
          context: '',
        };

  // Reset state when opening or when active target changes
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setEvaluation(null);
      setErrorMessage(null);
      setUserAudioBlob(null);
      if (userAudioUrl) {
        URL.revokeObjectURL(userAudioUrl);
        setUserAudioUrl(null);
      }
    }
  }, [isOpen, currentTarget.original]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (userAudioUrl) {
        URL.revokeObjectURL(userAudioUrl);
      }
      stopSpeech();
    };
  }, [userAudioUrl]);

  if (!isOpen || !result) return null;

  // Translate a new Vietnamese phrase entered on-the-fly inside the modal
  const handleTranslateNewVietnamese = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = customInput.trim();
    if (!text || isTranslatingNew) return;

    setIsTranslatingNew(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Không thể dịch từ mới lúc này.');
      }

      const newResult: TranslationResult = json.data;
      onUpdateGlobalResult?.(newResult);
      setSelectedLevelIndex('main');
      setCustomInput('');
      setTranscript('');
      setEvaluation(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi dịch từ mới.');
    } finally {
      setIsTranslatingNew(false);
    }
  };

  const handleStartPractice = async () => {
    setErrorMessage(null);
    setTranscript('');
    audioChunksRef.current = [];

    // 1. Setup speech recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser doesn't support Web Speech Recognition, prompt fallback
      setErrorMessage(
        'Trình duyệt chưa hỗ trợ nhận diện giọng nói tự động. Bạn vẫn có thể nhấn "AI Phân Tích & Chỉnh Sửa" để xem hướng dẫn chi tiết!'
      );
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = langConfig?.voiceLang || 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setTranscript(currentText);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setErrorMessage('Vui lòng cấp quyền Microphone cho trình duyệt để luyện nói.');
          }
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.warn('Recognition start error:', err);
      }
    }

    // 2. Setup MediaRecorder to save audio for user self-listen
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setUserAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setUserAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('MediaRecorder error:', err);
    }
  };

  const handleStopPractice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    setIsRecording(false);
  };

  // Submit to Gemini AI for pronunciation evaluation and coaching
  const handleEvaluate = async (spokenOverride?: string) => {
    const textToEvaluate = spokenOverride !== undefined ? spokenOverride : transcript;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/pronunciation-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetWord: currentTarget.original,
          targetLanguage: targetLanguage,
          ipa: currentTarget.ipa,
          viTransliteration: currentTarget.vi_transliteration,
          spokenText: textToEvaluate,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Không thể đánh giá phát âm lúc này.');
      }

      const data = await res.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        setPracticeCount((prev) => prev + 1);
        if (data.evaluation.score > bestScore) {
          setBestScore(data.evaluation.score);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi chấm điểm phát âm.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlayUserRecording = () => {
    if (!userAudioUrl) return;
    if (isPlayingUserAudio) {
      if (userAudioElementRef.current) {
        userAudioElementRef.current.pause();
        setIsPlayingUserAudio(false);
      }
      return;
    }

    const audio = new Audio(userAudioUrl);
    userAudioElementRef.current = audio;
    setIsPlayingUserAudio(true);
    audio.onended = () => setIsPlayingUserAudio(false);
    audio.onerror = () => setIsPlayingUserAudio(false);
    audio.play().catch(() => setIsPlayingUserAudio(false));
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500 bg-emerald-500/15';
    if (score >= 70) return 'text-amber-400 border-amber-500 bg-amber-500/15';
    if (score >= 50) return 'text-orange-400 border-orange-500 bg-orange-500/15';
    return 'text-rose-400 border-rose-500 bg-rose-500/15';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-3xl ${styles.bgCard} rounded-[32px] sm:rounded-[36px] shadow-2xl border-2 ${styles.borderAccent} overflow-hidden my-auto max-h-[94vh] flex flex-col`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b-2 ${styles.border} flex items-center justify-between ${
            theme === 'black-gold' ? 'bg-[#06070A]' : 'bg-[#080E1E]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${styles.border} ${styles.bgCardSubtle}`}
            >
              <Mic className={`w-5 h-5 ${styles.textPrimary}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-black ${styles.textHeading}`}>
                  Phòng Luyện & Chỉnh Sửa Phát Âm AI
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold">
                  <Infinity className="w-3 h-3" />
                  Không giới hạn
                </span>
              </div>
              <p className={`text-xs ${styles.textSecondary} font-semibold flex items-center gap-2 mt-0.5`}>
                <span>{langConfig?.flag} {targetLanguage}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">Lượt đã luyện: {practiceCount}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-pronounce-modal"
            onClick={onClose}
            className={`p-1.5 rounded-full ${styles.textSecondary} hover:${styles.textPrimary} hover:${styles.bgElevated} transition-colors cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* In-Modal Quick Vietnamese Input for Unlimited Vocabulary Practice */}
          <form
            onSubmit={handleTranslateNewVietnamese}
            className={`p-4 rounded-2xl ${styles.bgCardSubtle} border-2 ${styles.border} space-y-2`}
          >
            <div className="flex items-center justify-between">
              <label htmlFor="modal-vi-input" className={`text-xs font-bold uppercase tracking-wider ${styles.textPrimary} flex items-center gap-1.5`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Luyện từ/câu tiếng Việt khác (không giới hạn):
              </label>
              <span className={`text-[11px] ${styles.textSecondary}`}>
                Dịch sang {targetLanguage} & luyện ngay
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="modal-vi-input"
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={`Nhập từ/câu tiếng Việt mới... VD: "Cảm ơn", "Tôi muốn đặt phòng"...`}
                  className={`w-full p-2.5 pr-8 ${styles.bgInput} ${styles.textLight} text-sm font-semibold rounded-xl border ${styles.border} ${styles.borderFocus} outline-none transition-all shadow-inner`}
                />
                {customInput && (
                  <button
                    type="button"
                    onClick={() => setCustomInput('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!customInput.trim() || isTranslatingNew}
                className={`px-4 py-2.5 ${styles.btnPrimary} disabled:opacity-40 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0`}
              >
                {isTranslatingNew ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Dịch & Luyện</span>
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Level Switcher (If leveled expressions are available) */}
          {levelExpressions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${styles.textSecondary} flex items-center gap-1.5`}>
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Chọn cấp độ để luyện phát âm:
                </span>
                <span className={`text-[11px] font-semibold ${styles.textPrimary}`}>
                  {currentTarget.level_label}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLevelIndex('main')}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedLevelIndex === 'main'
                      ? `${styles.btnPrimary} ring-2 ring-orange-500/40 shadow-sm`
                      : `${styles.bgCardSubtle} ${styles.border} ${styles.textSecondary} hover:${styles.textPrimary}`
                  }`}
                >
                  <span className="text-[10px] uppercase font-black">🌟 Từ chính</span>
                  <span className="text-xs font-bold truncate mt-0.5">{result.original}</span>
                </button>

                {levelExpressions.map((exp, idx) => {
                  const isSelected = selectedLevelIndex === idx;
                  const levelPrefix = idx === 0 ? '🟢 Cấp 1' : idx === 1 ? '🔵 Cấp 2' : '🟣 Cấp 3';
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedLevelIndex(idx)}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? `${styles.btnPrimary} ring-2 ring-orange-500/40 shadow-sm`
                          : `${styles.bgCardSubtle} ${styles.border} ${styles.textSecondary} hover:${styles.textPrimary}`
                      }`}
                    >
                      <span className="text-[10px] uppercase font-black">{levelPrefix}</span>
                      <span className="text-xs font-bold truncate mt-0.5">{exp.original}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Target Word Hero Section */}
          <div
            className={`p-6 rounded-3xl border-2 ${styles.border} ${styles.bgCardSubtle} text-center relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-[0.2em] ${styles.textSecondary}`}
              >
                {currentTarget.level_label || 'Từ / Câu đang luyện'}
              </span>
              {currentTarget.context && (
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${styles.bgInput} border ${styles.border} ${styles.textSecondary} italic font-medium`}>
                  📌 {currentTarget.context}
                </span>
              )}
            </div>

            <div className={`text-3xl sm:text-4xl font-black ${styles.textHeading} mb-2 tracking-tight`}>
              {currentTarget.original}
            </div>

            <div className={`text-base sm:text-lg font-semibold ${styles.textPrimary} mb-4`}>
              ({currentTarget.meaning_vi})
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
              <span
                className={`text-xs sm:text-sm font-mono font-bold px-3.5 py-1.5 rounded-full border ${styles.border} ${
                  theme === 'black-gold' ? 'bg-[#090A0F]' : 'bg-[#0B132B]'
                } ${styles.textLight}`}
              >
                IPA: {currentTarget.ipa.startsWith('/') ? currentTarget.ipa : `/${currentTarget.ipa}/`}
              </span>

              <span
                className={`text-xs sm:text-sm font-black px-4 py-1.5 rounded-full border-2 ${
                  theme === 'black-gold'
                    ? 'border-[#F59E0B] bg-[#222738] text-[#FBBF24]'
                    : 'border-[#F97316] bg-[#192A4D] text-[#FF7A00]'
                }`}
              >
                Bồi: {currentTarget.vi_transliteration}
              </span>
            </div>

            {/* Audio reference buttons */}
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => speakText(currentTarget.original, langConfig?.voiceLang || 'en-US', 1.0)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${styles.btnPrimary}`}
                title="Nghe mẫu phát âm chuẩn"
              >
                <Volume2 className="w-4 h-4" />
                <span>Nghe mẫu 1.0x</span>
              </button>

              <button
                type="button"
                onClick={() => speakText(currentTarget.original, langConfig?.voiceLang || 'en-US', 0.7)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${styles.btnSecondary}`}
                title="Nghe chậm để bắt rõ từng âm"
              >
                <Volume2 className="w-4 h-4 opacity-70" />
                <span>Nghe chậm 0.7x</span>
              </button>

              {userAudioUrl && (
                <button
                  type="button"
                  onClick={handlePlayUserRecording}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isPlayingUserAudio
                      ? 'bg-purple-600 text-white border-purple-400 animate-pulse'
                      : `${styles.bgElevated} ${styles.textLight} hover:${styles.textPrimary} ${styles.border}`
                  }`}
                  title="Nghe lại bản ghi của bạn"
                >
                  {isPlayingUserAudio ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingUserAudio ? 'Đang phát...' : 'Nghe giọng của bạn'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Mic / Recording Action */}
          <div
            className={`p-6 rounded-3xl border-2 ${styles.border} ${
              theme === 'black-gold' ? 'bg-[#12141D]' : 'bg-[#0E1A34]'
            } flex flex-col items-center text-center space-y-4`}
          >
            {/* Big Record Button with Pulse */}
            <div className="relative">
              {isRecording && (
                <div
                  className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
                    theme === 'black-gold' ? 'bg-[#F59E0B]' : 'bg-rose-500'
                  }`}
                />
              )}

              <button
                type="button"
                id="btn-toggle-mic-recording"
                onClick={isRecording ? handleStopPractice : handleStartPractice}
                disabled={isAnalyzing}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white scale-110 ring-4 ring-rose-400/40 animate-pulse'
                    : `${styles.btnPrimary} hover:scale-105 active:scale-95`
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title={isRecording ? 'Nhấn để dừng ghi âm' : 'Nhấn để bắt đầu đọc và ghi âm'}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            <div>
              <div className={`text-base font-bold ${isRecording ? 'text-rose-400 font-black animate-pulse' : styles.textLight}`}>
                {isRecording ? 'Đang lắng nghe... Hãy nói to rõ ràng!' : 'Nhấn nút Mic để bắt đầu nói'}
              </div>
              <p className={`text-xs ${styles.textSecondary} mt-1 max-w-md`}>
                Đọc theo phiên âm bồi: <span className={`font-black ${styles.translitText}`}>{currentTarget.vi_transliteration}</span>.
                Hệ thống AI sẽ chấm điểm và chỉ ra lỗi sai chi tiết!
              </p>
            </div>

            {/* Live Transcript Display */}
            {(transcript || isRecording) && (
              <div
                className={`w-full p-4 rounded-2xl border ${styles.border} ${
                  theme === 'black-gold' ? 'bg-[#06070A]' : 'bg-[#080E1E]'
                } text-left`}
              >
                <span className={`text-[11px] font-bold uppercase tracking-wider ${styles.textSecondary} block mb-1`}>
                  Giọng nói ghi nhận được:
                </span>
                <p className={`text-sm font-semibold ${transcript ? styles.textLight : 'text-gray-500 italic'}`}>
                  {transcript || '(Đang bắt âm thanh... Hãy phát âm từ hoặc câu trên)'}
                </p>
              </div>
            )}

            {/* Error banner if mic fails */}
            {errorMessage && (
              <div className="w-full p-3 rounded-xl bg-rose-950/70 border border-rose-600 text-rose-300 text-xs text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Action buttons after speech */}
            <div className="flex items-center gap-3 flex-wrap justify-center pt-2">
              <button
                type="button"
                id="btn-evaluate-pronunciation"
                onClick={() => handleEvaluate()}
                disabled={isAnalyzing || isRecording}
                className={`px-6 py-3 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center gap-2 ${
                  isAnalyzing
                    ? 'bg-amber-600/80 text-white cursor-wait'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-102'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>AI đang phân tích khẩu hình...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI Chấm Điểm & Chỉnh Sửa</span>
                  </>
                )}
              </button>

              {evaluation && (
                <button
                  type="button"
                  onClick={() => {
                    setEvaluation(null);
                    setTranscript('');
                    setUserAudioBlob(null);
                    if (userAudioUrl) {
                      URL.revokeObjectURL(userAudioUrl);
                      setUserAudioUrl(null);
                    }
                  }}
                  className={`px-4 py-3 rounded-full ${styles.btnSecondary} text-xs font-bold flex items-center gap-1.5 cursor-pointer`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Luyện lại lượt mới</span>
                </button>
              )}
            </div>
          </div>

          {/* AI EVALUATION RESULTS PRESENTATION */}
          {evaluation && (
            <div
              className={`p-6 rounded-3xl border-2 ${styles.border} ${styles.bgCardSubtle} space-y-6 animate-in slide-in-from-bottom duration-200`}
            >
              {/* Score header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-700/30">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 ${getScoreColor(
                      evaluation.score
                    )} shadow-lg`}
                  >
                    <span className="text-2xl font-black">{evaluation.score}</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider">/ 100</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-black ${styles.textHeading}`}>
                        Đánh giá: {evaluation.accuracy_level}
                      </span>
                      {evaluation.score >= 85 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <p className={`text-xs ${styles.textSecondary} mt-0.5`}>
                      {evaluation.native_comparison}
                    </p>
                  </div>
                </div>

                {bestScore > 0 && (
                  <div
                    className={`px-3.5 py-1.5 rounded-full border ${styles.border} text-xs font-bold ${styles.textPrimary} flex items-center gap-1.5`}
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Điểm cao nhất: {bestScore}/100</span>
                  </div>
                )}
              </div>

              {/* Syllable-by-Syllable Breakdown */}
              {evaluation.syllable_breakdown && evaluation.syllable_breakdown.length > 0 && (
                <div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${styles.textSecondary} block mb-3`}
                  >
                    Phân tích chi tiết từng âm tiết:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {evaluation.syllable_breakdown.map((syl, idx) => {
                      const isCorrect = syl.status === 'correct';
                      const isClose = syl.status === 'almost';
                      const statusColor = isCorrect
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                        : isClose
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                        : 'border-rose-500/50 bg-rose-500/10 text-rose-300';

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border ${statusColor} text-left space-y-1`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black tracking-wide">
                              "{syl.syllable}" ({syl.vi_approximation})
                            </span>
                            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md border border-current">
                              {isCorrect ? 'Chuẩn' : isClose ? 'Tạm ổn' : 'Cần sửa'}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-gray-300">
                            {syl.feedback}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Vietnamese-Specific Coaching Tip */}
              {evaluation.vietnamese_speaker_tip && (
                <div
                  className={`p-4 rounded-2xl border-2 ${
                    theme === 'black-gold' ? 'border-[#F59E0B]/40 bg-[#14120A]' : 'border-[#F97316]/40 bg-[#181E2F]'
                  } text-left space-y-1.5`}
                >
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Mẹo sửa lỗi người Việt hay gặp:
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm font-medium ${styles.textLight} leading-relaxed`}>
                    {evaluation.vietnamese_speaker_tip}
                  </p>
                </div>
              )}

              {/* Actionable recommendations list */}
              {evaluation.actionable_fixes && evaluation.actionable_fixes.length > 0 && (
                <div className="text-left space-y-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${styles.textSecondary} flex items-center gap-1.5`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    Các bước khắc phục ngay:
                  </span>
                  <ul className="space-y-1.5 pl-1">
                    {evaluation.actionable_fixes.map((fix, idx) => (
                      <li
                        key={idx}
                        className={`text-xs sm:text-sm ${styles.textLight} flex items-start gap-2`}
                      >
                        <span className="text-emerald-400 font-bold shrink-0">✔</span>
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t-2 ${styles.border} flex items-center justify-between ${
            theme === "black-gold" ? "bg-[#06070A]" : "bg-[#080E1E]"
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
            <span>Chuyên gia phát âm AI đồng hành · Không giới hạn số từ & lượt luyện</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${styles.btnPrimary}`}
          >
            Hoàn tất luyện tập
          </button>
        </div>
      </div>
    </div>
  );
};
