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
  ipaSyllable: string;
  status: 'correct' | 'warning' | 'error';
  tip: string;
}

export interface PronunciationEvaluation {
  score: number;
  accuracyLevel: 'Xuất sắc' | 'Rất tốt' | 'Cần luyện thêm' | 'Chưa chính xác';
  spokenText: string;
  feedback: string;
  syllables: SyllableFeedback[];
  mouthAndTongueGuide: string;
  vietnameseTip: string;
  commonVietnameseMistakes: string;
}

export type TargetLanguageCode = 'en' | 'ja' | 'fr' | 'th' | 'zh' | 'de' | 'es';

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
