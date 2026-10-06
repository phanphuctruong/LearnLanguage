export interface LeveledExpression {
  level: 'basic' | 'intermediate' | 'advanced';
  level_label: string; // e.g. "Cơ bản (A1 - A2)", "Tự nhiên (B1 - B2)", "Nâng cao / Lịch sự (C1 - C2)"
  original: string;
  meaning_vi: string;
  ipa: string;
  vi_transliteration: string;
  context?: string;
}

export interface TranslationResult {
  original: string;
  meaning_vi: string;
  ipa: string;
  vi_transliteration: string;
  level_expressions?: LeveledExpression[];
}

export type ThemeMode = 'navy-orange' | 'black-gold';

export interface SyllableFeedback {
  syllable: string;
  ipaSyllable?: string;
  ipa_syllable?: string;
  viApproximation?: string;
  vi_approximation?: string;
  status: 'correct' | 'almost' | 'warning' | 'error';
  tip: string;
  feedback?: string;
  mouthGuide?: string;
  mouth_guide?: string;
}

export interface PronunciationMistake {
  title: string;
  severity: 'high' | 'medium' | 'low';
  whatYouPronounced: string;
  standardNative: string;
  howToFix: string;
  drillText?: string;
}

export interface PronunciationEvaluation {
  score: number;
  accuracyLevel: 'Xuất sắc' | 'Rất tốt' | 'Cần luyện thêm' | 'Chưa chính xác' | string;
  accuracy_level?: string;
  spokenText: string;
  spoken_text?: string;
  feedback: string;
  nativeComparison?: string;
  native_comparison?: string;
  syllables: SyllableFeedback[];
  syllable_breakdown?: SyllableFeedback[];
  mistakesDetected?: PronunciationMistake[];
  mistakes_detected?: PronunciationMistake[];
  mouthAndTongueGuide: string;
  mouth_and_tongue_guide?: string;
  vietnameseTip: string;
  vietnamese_speaker_tip?: string;
  commonVietnameseMistakes: string;
  common_vietnamese_mistakes?: string;
  actionableFixes?: string[];
  actionable_fixes?: string[];
}

export type TargetLanguageCode = 'en' | 'ja' | 'fr' | 'th' | 'zh' | 'de' | 'es' | 'ru' | 'ko' | 'ar';

export interface LanguageConfig {
  id: TargetLanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  voiceLang: string;
  ruleExample: {
    original: string;
    transliteration: string;
  };
  samplePhrases: {
    label: string;
    query: string;
  }[];
}

export interface HistoryItem {
  id: string;
  targetLanguage: string;
  languageId: TargetLanguageCode;
  query: string;
  result: TranslationResult;
  timestamp: number;
  isFavorite?: boolean;
}

export interface ChatSuggestedReply {
  original: string;
  meaning_vi: string;
  vi_transliteration?: string;
}

export interface ChatCorrection {
  has_error: boolean;
  status: 'correct' | 'minor_issue' | 'has_error' | 'vietnamese_input';
  original_user_text?: string;
  corrected_text?: string;
  vi_transliteration?: string;
  explanation_vi?: string;
  praise_or_critique?: string;
}

export interface UserSentenceSuggestion {
  type: 'natural_upgrade' | 'expansion' | 'alternative';
  label: string;
  text: string;
  meaning_vi: string;
  vi_transliteration?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  original?: string;
  meaning_vi?: string;
  vi_transliteration?: string;
  ipa?: string;
  formatted_message?: string;
  suggested_replies?: ChatSuggestedReply[];
  user_correction?: ChatCorrection;
  user_suggestions?: UserSentenceSuggestion[];
  user_tip?: string;
  timestamp: number;
}
