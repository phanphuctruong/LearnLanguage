import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  X,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Award,
  Layers,
  Globe,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Edit3,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ChatMessage,
  ChatSuggestedReply,
  ChatCorrection,
  UserSentenceSuggestion,
  TargetLanguageCode,
  LanguageConfig,
  TranslationResult,
} from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { speakText, stopSpeech } from '../utils/speech';
import { useTheme } from '../context/ThemeContext';

interface LanguageChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLangCode: TargetLanguageCode;
  onSelectLangCode?: (code: TargetLanguageCode) => void;
  onPracticeSentence?: (result: TranslationResult) => void;
}

const TOPICS = [
  'Giao tiếp hàng ngày',
  'Chào hỏi & Làm quen',
  'Gọi món & Quán Cafe',
  'Du lịch & Khách sạn',
  'Mua sắm & Trả giá',
  'Công việc & Phỏng vấn',
];

const STARTER_MESSAGES: Record<TargetLanguageCode, ChatMessage> = {
  en: {
    id: 'starter-en',
    role: 'assistant',
    content: 'Hi! How are you? (Xin chào! Bạn khoẻ không)',
    original: 'Hi! How are you?',
    meaning_vi: 'Xin chào! Bạn khoẻ không?',
    vi_transliteration: 'Hai! Hao a diu?',
    ipa: '/haɪ haʊ ɑːr juː/',
    formatted_message: 'Hi! How are you? (Xin chào! Bạn khoẻ không)',
    suggested_replies: [
      {
        original: "I'm doing great, thank you! And you?",
        meaning_vi: 'Tôi rất khỏe, cảm ơn bạn! Còn bạn?',
        vi_transliteration: 'Aim đu-ing gờ-rết, thẻng kiu! Èn diu?',
      },
      {
        original: 'Nice to meet you! Where are you from?',
        meaning_vi: 'Rất vui được gặp bạn! Bạn đến từ đâu?',
        vi_transliteration: 'Nai-xừ tu mít diu! Oe a diu phờ-rom?',
      },
      {
        original: 'I am learning English today.',
        meaning_vi: 'Hôm nay tôi đang học tiếng Anh.',
        vi_transliteration: 'Ai am lơn-ninh Íng-lít tu-đây.',
      },
    ],
    timestamp: Date.now(),
  },
  ja: {
    id: 'starter-ja',
    role: 'assistant',
    content: 'こんにちは！お元気ですか？ (Xin chào! Bạn có khỏe không?)',
    original: 'こんにちは！お元気ですか？',
    meaning_vi: 'Xin chào! Bạn có khỏe không?',
    vi_transliteration: 'Côn-ni-chi-wa! Ô-ghen-ki đề-sừ ca?',
    ipa: '/kon.ni.tɕi.wa o.ɡeŋ.ki de.sɯ.ka/',
    formatted_message: 'こんにちは！お元気ですか？ (Xin chào! Bạn có khỏe không?)',
    suggested_replies: [
      {
        original: 'はい、元気です！ありがとうございます。',
        meaning_vi: 'Vâng, tôi khỏe! Cảm ơn bạn rất nhiều.',
        vi_transliteration: 'Hai, ghen-ki đề-sừ! A-ri-ga-tô gô-zai-mát.',
      },
      {
        original: '初めまして、よろしくお願いします！',
        meaning_vi: 'Rất vui được gặp bạn, mong bạn giúp đỡ!',
        vi_transliteration: 'Ha-gi-mê-ma-si-tê, dô-rô-si-ku ô-nê-gai-xi-mát!',
      },
      {
        original: '今、日本語を勉強しています。',
        meaning_vi: 'Bây giờ tôi đang học tiếng Nhật.',
        vi_transliteration: 'I-ma, ni-hông-gô ô bên-ki-ô xi-tê-i-mát.',
      },
    ],
    timestamp: Date.now(),
  },
  zh: {
    id: 'starter-zh',
    role: 'assistant',
    content: '你好！今天过得怎么样？ (Xin chào! Hôm nay của bạn thế nào?)',
    original: '你好！今天过得怎么样？',
    meaning_vi: 'Xin chào! Hôm nay của bạn thế nào?',
    vi_transliteration: 'Ní hảo! Chin thiên cua tơ chẩn mơ giang?',
    ipa: '/nǐ xǎo tɕin tjɛn kwɔ tɤ tʂən mə jaŋ/',
    formatted_message: '你好！今天过得怎么样？ (Xin chào! Hôm nay của bạn thế nào?)',
    suggested_replies: [
      {
        original: '我很好，谢谢你！你呢？',
        meaning_vi: 'Tôi rất khỏe, cảm ơn bạn! Còn bạn?',
        vi_transliteration: 'Oả hẩn hảo, xiê-xiệ nỉ! Nỉ nơ?',
      },
      {
        original: '很高兴认识你！',
        meaning_vi: 'Rất vui được làm quen với bạn!',
        vi_transliteration: 'Hẩn cao xing rân sơ nỉ!',
      },
      {
        original: '我想练习说中文。',
        meaning_vi: 'Tôi muốn luyện nói tiếng Trung.',
        vi_transliteration: 'Oả xẻng li-en xi sua trung-uấn.',
      },
    ],
    timestamp: Date.now(),
  },
  fr: {
    id: 'starter-fr',
    role: 'assistant',
    content: 'Bonjour ! Comment allez-vous ? (Xin chào! Bạn có khỏe không?)',
    original: 'Bonjour ! Comment allez-vous ?',
    meaning_vi: 'Xin chào! Bạn có khỏe không?',
    vi_transliteration: 'Bông-giua! Co-măng ta-lê vu?',
    ipa: '/bɔ̃.ʒuʁ kɔ.mɑ̃.t‿a.le.vu/',
    formatted_message: 'Bonjour ! Comment allez-vous ? (Xin chào! Bạn có khỏe không?)',
    suggested_replies: [
      {
        original: 'Très bien, merci ! Et vous ?',
        meaning_vi: 'Rất tốt, cảm ơn bạn! Còn bạn?',
        vi_transliteration: 'Tơ-rê bi-ăng, me-xì! Ê vu?',
      },
      {
        original: 'Enchanté de faire votre connaissance !',
        meaning_vi: 'Rất vui được làm quen với bạn!',
        vi_transliteration: 'Ăng-săng-tê đơ phe vô-tơ-rơ cô-ne-xăng-sơ!',
      },
      {
        original: "J'apprends le français avec plaisir.",
        meaning_vi: 'Tôi đang học tiếng Pháp với niềm vui.',
        vi_transliteration: 'Giáp-phơ-răng lơ phơ-răng-xe a-véc pơ-le-di-ơ.',
      },
    ],
    timestamp: Date.now(),
  },
  th: {
    id: 'starter-th',
    role: 'assistant',
    content: 'สวัสดีครับ สบายดีไหมครับ (Xin chào! Bạn có khỏe không?)',
    original: 'สวัสดีครับ สบายดีไหมครับ',
    meaning_vi: 'Xin chào! Bạn có khỏe không?',
    vi_transliteration: 'Xà-goát-đi khơ-rắp, xà-bai-đi mảy khơ-rắp?',
    ipa: '/sa˨˩.wat˨˩.diː˧ kʰrap̚˦˥ sa˨˩.baːj˧ diː˧ maj˩˩˦ kʰrap̚˦˥/',
    formatted_message: 'สวัสดีครับ สบายดีไหมครับ (Xin chào! Bạn có khỏe không?)',
    suggested_replies: [
      {
        original: 'สบายดี ขอบคุณครับ แล้วคุณล่ะ',
        meaning_vi: 'Tôi khỏe, cảm ơn bạn! Còn bạn thì sao?',
        vi_transliteration: 'Xà-bai-đi, khọp-khun khơ-rắp! Léo khun lả?',
      },
      {
        original: 'ยินดีที่ได้รู้จักครับ',
        meaning_vi: 'Rất vui được biết bạn!',
        vi_transliteration: 'Dinh-đi thì đai rú-chặc khơ-rắp!',
      },
      {
        original: 'ผมกำลังฝึกพูดภาษาไทย',
        meaning_vi: 'Tôi đang luyện nói tiếng Thái.',
        vi_transliteration: 'Phổm căm-lăng phực phuốt pha-sả Thay.',
      },
    ],
    timestamp: Date.now(),
  },
  de: {
    id: 'starter-de',
    role: 'assistant',
    content: 'Hallo! Wie geht es dir? (Xin chào! Bạn có khỏe không?)',
    original: 'Hallo! Wie geht es dir?',
    meaning_vi: 'Xin chào! Bạn có khỏe không?',
    vi_transliteration: 'Ha-lô! Vi ghê-th ét đi-a?',
    ipa: '/ˈha.loː viː ɡeːt ɛs diːɐ̯/',
    formatted_message: 'Hallo! Wie geht es dir? (Xin chào! Bạn có khỏe không?)',
    suggested_replies: [
      {
        original: 'Mir geht es gut, danke! Und dir?',
        meaning_vi: 'Tôi khỏe, cảm ơn bạn! Còn bạn?',
        vi_transliteration: 'Mia ghê-th ét gút, đăng-kơ! Un đi-a?',
      },
      {
        original: 'Freut mich, dich kennenzulernen!',
        meaning_vi: 'Rất vui được làm quen với bạn!',
        vi_transliteration: 'Phơ-roi-th mích, đí-ch ken-nơn-xu-le-nơn!',
      },
      {
        original: 'Ich lerne Deutsch.',
        meaning_vi: 'Tôi đang học tiếng Đức.',
        vi_transliteration: 'Ích léc-nơ Đoi-ch.',
      },
    ],
    timestamp: Date.now(),
  },
  es: {
    id: 'starter-es',
    role: 'assistant',
    content: '¡Hola! ¿Cómo estás? (Xin chào! Bạn khoẻ không?)',
    original: '¡Hola! ¿Cómo estás?',
    meaning_vi: 'Xin chào! Bạn khoẻ không?',
    vi_transliteration: 'Ô-la! Cô-mô ét-tát?',
    ipa: '/ˈo.la ˈko.mo esˈtas/',
    formatted_message: '¡Hola! ¿Cómo estás? (Xin chào! Bạn khoẻ không?)',
    suggested_replies: [
      {
        original: '¡Muy bien, gracias! ¿Y tú?',
        meaning_vi: 'Rất tốt, cảm ơn bạn! Còn bạn?',
        vi_transliteration: 'Mui bi-ên, gờ-ra-xi-át! Y tu?',
      },
      {
        original: '¡Mucho gusto en conocerte!',
        meaning_vi: 'Rất vui được gặp bạn!',
        vi_transliteration: 'Mu-chô gút-tô en cô-nô-xe-rơ-tê!',
      },
      {
        original: 'Estoy practicando español.',
        meaning_vi: 'Tôi đang luyện tiếng Tây Ban Nha.',
        vi_transliteration: 'Ét-tôi pờ-rắc-ti-can-đô ét-pa-nhôn.',
      },
    ],
    timestamp: Date.now(),
  },
  ru: {
    id: 'starter-ru',
    role: 'assistant',
    content: 'Здравствуйте! Как ваши дела? (Xin chào! Dạo này công việc bạn thế nào?)',
    original: 'Здравствуйте! Как ваши дела?',
    meaning_vi: 'Xin chào! Dạo này công việc của bạn thế nào?',
    vi_transliteration: 'Xờ-đơ-rát-xtvuy-tê! Cắc va-si đi-la?',
    ipa: '/ˈzdrastvʊjtʲe kak ˈvaʂɨ dʲɪˈla/',
    formatted_message: 'Здравствуйте! Как ваши дела? (Xin chào! Dạo này công việc bạn thế nào?)',
    suggested_replies: [
      {
        original: 'Спасибо, всё отлично! А у вас?',
        meaning_vi: 'Cảm ơn, mọi chuyện rất tuyệt! Còn bạn thì sao?',
        vi_transliteration: 'X-pa-xi-ba, v-xô át-lít-x-nơ! A u va-xơ?',
      },
      {
        original: 'Очень приятно познакомиться!',
        meaning_vi: 'Rất vui được làm quen với bạn!',
        vi_transliteration: 'Ô-chin pờ-ri-dát-nơ pơ-dơ-na-cô-mít-xa!',
      },
      {
        original: 'Я учу русский язык каждый день.',
        meaning_vi: 'Tôi học tiếng Nga mỗi ngày.',
        vi_transliteration: 'Da u-chu rút-x-ki da-dức ca-gi-đưi đen.',
      },
    ],
    timestamp: Date.now(),
  },
  ko: {
    id: 'starter-ko',
    role: 'assistant',
    content: '안녕하세요! 오늘 기분이 어떠세요? (Xin chào! Hôm nay tâm trạng bạn thế nào?)',
    original: '안녕하세요! 오늘 기분이 어떠세요?',
    meaning_vi: 'Xin chào! Hôm nay tâm trạng bạn thế nào?',
    vi_transliteration: 'An-ni-ơng-ha-sê-dô! Ô-nưl ki-bu-ni ơ-tơ-sê-dô?',
    ipa: '/an.ɲʌŋ.ɦa.se.jo o.nɯl ki.bu.ni ʌ.t͈ʌ.se.jo/',
    formatted_message: '안녕하세요! 오늘 기분이 어떠세요? (Xin chào! Hôm nay tâm trạng bạn thế nào?)',
    suggested_replies: [
      {
        original: '네, 아주 좋아요! 감사합니다.',
        meaning_vi: 'Vâng, rất tốt! Cảm ơn bạn.',
        vi_transliteration: 'Nê, a-chu cho-a-dô! Cam-sa-ham-ni-đa.',
      },
      {
        original: '만나서 정말 반갑습니다!',
        meaning_vi: 'Rất vui được gặp bạn!',
        vi_transliteration: 'Man-na-xơ châng-man ban-gắp-xừm-ni-đa!',
      },
      {
        original: '저는 한국어를 배우고 있어요.',
        meaning_vi: 'Tôi đang học tiếng Hàn Quốc.',
        vi_transliteration: 'Chơ-nưn han-gúc-ơ-rưl pe-u-gô ít-xơ-dô.',
      },
    ],
    timestamp: Date.now(),
  },
  ar: {
    id: 'starter-ar',
    role: 'assistant',
    content: 'أهلاً وسهلاً! كيف حالك اليوم؟ (Xin chào mừng bạn! Hôm nay bạn khỏe không?)',
    original: 'أهلاً وسهلاً! كيف حالك اليوم؟',
    meaning_vi: 'Xin chào mừng bạn! Hôm nay bạn khỏe không?',
    vi_transliteration: 'Áh-lan oa xáh-lan! Cay-pha ha-lu-ca an-dao-mừ?',
    ipa: '/ʔahlan wa sahlan kajfa ħaːluka aljawm/',
    formatted_message: 'أهلاً وسهلاً! كيف حالك اليوم؟ (Xin chào mừng bạn! Hôm nay bạn khỏe không?)',
    suggested_replies: [
      {
        original: 'أنا بخير والحمد لله! وأنت؟',
        meaning_vi: 'Tôi khỏe, tạ ơn Thượng Đế! Còn bạn?',
        vi_transliteration: 'A-na bi-khayr oan ham-đu lin-la! Oa ân-ta?',
      },
      {
        original: 'فرصة سعيدة جدًا بلقائك!',
        meaning_vi: 'Thật là một dịp may mắn và vui mừng khi gặp bạn!',
        vi_transliteration: 'Phuốc-xa xa-i-đa chít-đan bi-li-ca-ích!',
      },
      {
        original: 'أنا أتعلم اللغة العربية الآن.',
        meaning_vi: 'Bây giờ tôi đang học tiếng Ả Rập.',
        vi_transliteration: 'A-na a-ta-an-lam an-lu-ga-ta an-a-ra-bi-da an-an.',
      },
    ],
    timestamp: Date.now(),
  },
};

export const LanguageChatModal: React.FC<LanguageChatModalProps> = ({
  isOpen,
  onClose,
  targetLangCode,
  onSelectLangCode,
  onPracticeSentence,
}) => {
  const { theme, styles } = useTheme();

  const [currentLang, setCurrentLang] = useState<TargetLanguageCode>(targetLangCode);
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS[0]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const currentLangConfig = SUPPORTED_LANGUAGES.find((l) => l.id === currentLang);

  // Messages per language
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`lingoviet_chat_${targetLangCode}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Ignore
    }
    return [STARTER_MESSAGES[targetLangCode] || STARTER_MESSAGES.en];
  });

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync currentLang with prop
  useEffect(() => {
    setCurrentLang(targetLangCode);
  }, [targetLangCode]);

  // Load chat for chosen language
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`lingoviet_chat_${currentLang}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([STARTER_MESSAGES[currentLang] || STARTER_MESSAGES.en]);
      }
    } catch (e) {
      setMessages([STARTER_MESSAGES[currentLang] || STARTER_MESSAGES.en]);
    }
  }, [currentLang]);

  // Save messages
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(`lingoviet_chat_${currentLang}`, JSON.stringify(messages));
      } catch (e) {
        // Ignore
      }
    }
  }, [messages, currentLang]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Clean up speech on close
  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
    }
  }, [isOpen]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content || m.original || '',
            original: m.original,
            meaning_vi: m.meaning_vi,
          })),
          targetLanguage: currentLangConfig?.name || 'Tiếng Anh',
          topic: selectedTopic,
        }),
      });

      const rawText = await response.text();
      let resJson: any = null;

      try {
        resJson = JSON.parse(rawText);
      } catch (parseErr) {
        console.error('Failed to parse API response as JSON:', rawText);
        throw new Error(
          'Hệ thống đang cập nhật kết nối đến Trợ lý AI. Bạn hãy thử lại sau vài giây nhé!'
        );
      }

      if (!response.ok || !resJson?.success) {
        throw new Error(resJson?.error || 'Trợ lý AI chưa thể phản hồi lúc này.');
      }

      const data = resJson.data;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.formatted_message || `${data.original} (${data.meaning_vi})`,
        original: data.original,
        meaning_vi: data.meaning_vi,
        vi_transliteration: data.vi_transliteration,
        ipa: data.ipa,
        formatted_message: data.formatted_message,
        suggested_replies: data.suggested_replies || [],
        user_correction: data.user_correction,
        user_suggestions: data.user_suggestions || [],
        user_tip: data.user_tip,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Rất tiếc: ${err?.message || 'Không thể kết nối với Trợ lý AI. Vui lòng thử lại!'}`,
        meaning_vi: 'Lỗi kết nối mạng hoặc quá tải.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    const starter = STARTER_MESSAGES[currentLang] || STARTER_MESSAGES.en;
    setMessages([starter]);
    try {
      localStorage.removeItem(`lingoviet_chat_${currentLang}`);
    } catch (e) {}
  };

  // Quick helper to fill input
  const handleApplySentenceToInput = (text: string) => {
    setInputMessage(text);
  };

  // Quick helper to directly send a suggestion
  const handleSendSpecificSentence = (text: string) => {
    handleSendMessage(text);
  };

  // Quick helper to practice pronunciation for arbitrary item
  const handlePracticeCustomSentence = (item: {
    original: string;
    meaning_vi: string;
    vi_transliteration?: string;
    ipa?: string;
  }) => {
    if (!item.original) return;
    if (onPracticeSentence) {
      onPracticeSentence({
        original: item.original,
        meaning_vi: item.meaning_vi || '',
        ipa: item.ipa || '',
        vi_transliteration: item.vi_transliteration || '',
      });
      onClose();
    }
  };

  // Voice Speech to Text
  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech API.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      // Default to target voice or Vietnamese
      recognition.lang = currentLangConfig?.voiceLang || 'vi-VN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Voice recognition error:', err);
      setIsListening(false);
    }
  };

  // Trigger pronunciation practice for a message
  const handlePracticeThisSentence = (msg: ChatMessage) => {
    if (!msg.original) return;
    if (onPracticeSentence) {
      onPracticeSentence({
        original: msg.original,
        meaning_vi: msg.meaning_vi || '',
        ipa: msg.ipa || '',
        vi_transliteration: msg.vi_transliteration || '',
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  const latestAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');
  const availableSuggestions = latestAiMessage?.suggested_replies || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-3xl ${styles.bgCard} rounded-[28px] sm:rounded-[36px] shadow-2xl border-2 ${styles.borderAccent} overflow-hidden my-auto h-[92vh] sm:h-[88vh] flex flex-col`}
      >
        {/* Header */}
        <div
          className={`px-5 py-3.5 border-b-2 ${styles.border} flex items-center justify-between gap-3 ${
            theme === 'black-gold' ? 'bg-[#0E1017]' : 'bg-[#0D1B36]'
          } shrink-0`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${
                theme === 'black-gold'
                  ? 'bg-[#181B27] border-[#F59E0B] text-[#F59E0B]'
                  : 'bg-[#152549] border-[#F97316] text-[#F97316]'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className={`text-sm sm:text-base font-black ${styles.textHeading} truncate`}>
                  Trợ Lý Giao Tiếp AI
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Kèm dịch nghĩa tiếng Việt
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                {/* Language Picker in Chat */}
                <div className="relative inline-flex items-center">
                  <select
                    value={currentLang}
                    onChange={(e) => {
                      const code = e.target.value as TargetLanguageCode;
                      setCurrentLang(code);
                      onSelectLangCode?.(code);
                    }}
                    className={`text-xs font-bold ${styles.textPrimary} bg-transparent border-none outline-none cursor-pointer pr-4 appearance-none`}
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option
                        key={lang.id}
                        value={lang.id}
                        className={theme === 'black-gold' ? 'bg-[#12141D] text-white' : 'bg-[#0F1D38] text-white'}
                      >
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 -ml-3 pointer-events-none text-gray-400" />
                </div>

                <span className="text-gray-500 text-xs">•</span>

                {/* Topic Picker */}
                <div className="relative inline-flex items-center">
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className={`text-xs font-semibold ${styles.textSecondary} bg-transparent border-none outline-none cursor-pointer pr-4 appearance-none`}
                  >
                    {TOPICS.map((topic) => (
                      <option
                        key={topic}
                        value={topic}
                        className={theme === 'black-gold' ? 'bg-[#12141D] text-white' : 'bg-[#0F1D38] text-white'}
                      >
                        🏷️ {topic}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 -ml-3 pointer-events-none text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-chat-reset"
              onClick={handleResetChat}
              className={`p-2 rounded-xl border ${styles.border} ${styles.textSecondary} hover:${styles.textPrimary} hover:${styles.bgCardSubtle} transition-all cursor-pointer`}
              title="Khởi động lại cuộc trò chuyện từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="btn-chat-close"
              onClick={onClose}
              className={`p-2 rounded-xl border ${styles.border} ${styles.textSecondary} hover:${styles.textPrimary} hover:${styles.bgCardSubtle} transition-all cursor-pointer`}
              title="Đóng cửa sổ chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Scroll Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-sm"
        >
          {/* Welcome Info Banner */}
          <div
            className={`p-3.5 rounded-2xl border ${styles.border} ${styles.bgCardSubtle} flex items-start gap-3 text-xs`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className={`font-bold ${styles.textPrimary}`}>
                Luyện nói & giao tiếp phản xạ với AI:
              </span>
              <p className={styles.textSecondary}>
                Mọi câu nói của Trợ lý AI đều có <strong>dịch nghĩa tiếng Việt</strong> ngay bên cạnh (ví dụ:{' '}
                <em>Hi! How are you? (Xin chào! Bạn khoẻ không)</em>) kèm <strong>phiên âm bồi</strong> và nút nghe audio chuẩn. Bạn có thể gõ tiếng Việt hoặc ngoại ngữ tùy thích!
              </p>
            </div>
          </div>

          {/* Message List */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            if (isUser) {
              return (
                <div key={msg.id} className="flex justify-end gap-2.5 items-end">
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl rounded-br-xs ${
                      theme === 'black-gold'
                        ? 'bg-[#F59E0B] text-[#090A0F]'
                        : 'bg-[#F97316] text-[#0B132B]'
                    } font-bold text-sm shadow-md space-y-1`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-[10px] opacity-75 block text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      theme === 'black-gold' ? 'bg-[#F59E0B] text-[#090A0F]' : 'bg-[#F97316] text-[#0B132B]'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            }

            // Assistant Message
            return (
              <div key={msg.id} className="flex gap-2.5 items-start">
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                    theme === 'black-gold'
                      ? 'bg-[#1A1D2B] border-[#F59E0B] text-[#F59E0B]'
                      : 'bg-[#152549] border-[#F97316] text-[#F97316]'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                </div>

                <div
                  className={`max-w-[90%] sm:max-w-[85%] p-4 rounded-2xl sm:rounded-3xl rounded-tl-xs border-2 ${styles.border} ${styles.bgCardSubtle} shadow-md space-y-3.5`}
                >
                  {/* PHẦN 1: SỬA LỖI KHI NGƯỜI DÙNG TRẢ LỜI SAI */}
                  {msg.user_correction && (
                    <div className="space-y-2">
                      {msg.user_correction.status === 'has_error' || msg.user_correction.status === 'minor_issue' ? (
                        <div
                          className={`p-3.5 sm:p-4 rounded-2xl border-2 ${
                            theme === 'black-gold'
                              ? 'bg-[#1C1312] border-rose-500/60 text-rose-100'
                              : 'bg-[#22141A] border-rose-500/60 text-rose-100'
                          } space-y-3 shadow-inner`}
                        >
                          {/* Title & Badge */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs font-black text-rose-400">
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                              <span>SỬA LỖI CÂU TRẢ LỜI CỦA BẠN</span>
                            </div>
                            {msg.user_correction.praise_or_critique && (
                              <span className="text-[11px] font-medium text-amber-300 italic">
                                {msg.user_correction.praise_or_critique}
                              </span>
                            )}
                          </div>

                          {/* Error vs Correct Comparison Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            {/* Original with strike */}
                            <div className="p-2.5 rounded-xl bg-black/40 border border-rose-500/30 space-y-1">
                              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1">
                                <span>❌</span> Câu bạn vừa nói:
                              </span>
                              <p className="font-semibold text-rose-200 line-through decoration-rose-400 decoration-2 break-words">
                                {msg.user_correction.original_user_text}
                              </p>
                            </div>

                            {/* Corrected version */}
                            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                                <span>✅</span> Câu chuẩn xác:
                              </span>
                              <p className="font-bold text-emerald-300 text-sm break-words">
                                {msg.user_correction.corrected_text}
                              </p>
                              {msg.user_correction.vi_transliteration && (
                                <span className="text-[11px] text-amber-300 font-black block">
                                  Bồi: {msg.user_correction.vi_transliteration}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Explanation */}
                          {msg.user_correction.explanation_vi && (
                            <div className="p-2.5 rounded-xl bg-black/30 border border-gray-700/50 flex items-start gap-2 text-xs leading-relaxed text-gray-200">
                              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-amber-300">Giải thích lỗi sai: </strong>
                                <span>{msg.user_correction.explanation_vi}</span>
                              </div>
                            </div>
                          )}

                          {/* Action buttons on corrected text */}
                          {msg.user_correction.corrected_text && (
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  speakText(
                                    msg.user_correction!.corrected_text!,
                                    currentLangConfig?.voiceLang || 'en-US',
                                    1.0
                                  )
                                }
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Nghe phát âm chuẩn câu đã sửa"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Nghe câu chuẩn</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handlePracticeCustomSentence({
                                    original: msg.user_correction!.corrected_text!,
                                    meaning_vi: msg.user_correction!.explanation_vi || '',
                                    vi_transliteration: msg.user_correction!.vi_transliteration || '',
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Luyện phát âm câu đã sửa trong phòng AI"
                              >
                                <Mic className="w-3.5 h-3.5" />
                                <span>Luyện phát âm câu này</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleApplySentenceToInput(msg.user_correction!.corrected_text!)
                                }
                                className="px-2.5 py-1 rounded-lg bg-gray-700/40 text-gray-200 hover:bg-gray-700 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                                title="Điền câu đã sửa vào khung chat để gửi lại"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Thử nói lại</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : msg.user_correction.status === 'vietnamese_input' ? (
                        <div
                          className={`p-3.5 sm:p-4 rounded-2xl border-2 ${
                            theme === 'black-gold'
                              ? 'bg-[#151824] border-cyan-500/40 text-cyan-100'
                              : 'bg-[#13223C] border-cyan-500/40 text-cyan-100'
                          } space-y-2.5 shadow-inner`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-black text-cyan-400">
                            <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>CHUYỂN CÂU TIẾNG VIỆT SANG {currentLangConfig?.name?.toUpperCase()}</span>
                          </div>
                          <div className="text-xs space-y-1">
                            <p className="text-gray-300">
                              Ý bạn vừa viết: <em className="text-white font-medium">"{msg.user_correction.original_user_text}"</em>
                            </p>
                            <p className="font-bold text-base text-cyan-300">
                              👉 {msg.user_correction.corrected_text}
                            </p>
                            {msg.user_correction.vi_transliteration && (
                              <p className="text-xs text-amber-300 font-black">
                                Bồi: {msg.user_correction.vi_transliteration}
                              </p>
                            )}
                            {msg.user_correction.explanation_vi && (
                              <p className="text-xs text-gray-300 pt-1">
                                💡 {msg.user_correction.explanation_vi}
                              </p>
                            )}
                          </div>
                          {msg.user_correction.corrected_text && (
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  speakText(
                                    msg.user_correction!.corrected_text!,
                                    currentLangConfig?.voiceLang || 'en-US',
                                    1.0
                                  )
                                }
                                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Nghe đọc</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handlePracticeCustomSentence({
                                    original: msg.user_correction!.corrected_text!,
                                    meaning_vi: msg.user_correction!.original_user_text || '',
                                    vi_transliteration: msg.user_correction!.vi_transliteration || '',
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Mic className="w-3.5 h-3.5" />
                                <span>Luyện phát âm</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : msg.user_correction.status === 'correct' ? (
                        <div className="p-2.5 sm:p-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-200 text-xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div>
                              <span className="font-bold text-emerald-300">Câu trả lời của bạn rất chuẩn xác! 👏</span>
                              {msg.user_correction.explanation_vi && (
                                <span className="block text-[11px] text-emerald-400/80 mt-0.5">
                                  {msg.user_correction.explanation_vi}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/40 uppercase shrink-0">
                            100% Chuẩn
                          </span>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* PHẦN 2: ĐƯA RA GỢI Ý TỪ CHÍNH CÂU TRẢ LỜI CỦA NGƯỜI DÙNG */}
                  {msg.user_suggestions && msg.user_suggestions.length > 0 && (
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 ${styles.border} ${
                        theme === 'black-gold' ? 'bg-[#141622]/90' : 'bg-[#111D38]/90'
                      } space-y-3 shadow-inner`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>GỢI Ý TỪ CÂU TRẢ LỜI CỦA BẠN</span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          Nâng cấp & mở rộng câu
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {msg.user_suggestions.map((sug, sIdx) => (
                          <div
                            key={sIdx}
                            className={`p-3 rounded-xl border ${styles.border} ${
                              theme === 'black-gold' ? 'bg-[#0E1018]' : 'bg-[#0B152B]'
                            } space-y-2`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                  sug.type === 'natural_upgrade'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : sug.type === 'expansion'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                }`}
                              >
                                {sug.label ||
                                  (sug.type === 'natural_upgrade'
                                    ? 'Cách nói tự nhiên hơn'
                                    : sug.type === 'expansion'
                                    ? 'Mở rộng ý câu nói'
                                    : 'Cách diễn đạt khác')}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    speakText(sug.text, currentLangConfig?.voiceLang || 'en-US', 1.0)
                                  }
                                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/40 cursor-pointer"
                                  title="Nghe câu này"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePracticeCustomSentence({
                                      original: sug.text,
                                      meaning_vi: sug.meaning_vi,
                                      vi_transliteration: sug.vi_transliteration,
                                    })
                                  }
                                  className="p-1 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 cursor-pointer"
                                  title="Luyện phát âm câu này"
                                >
                                  <Mic className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(sug.text, `sug-${sIdx}`)}
                                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/40 cursor-pointer"
                                  title="Sao chép"
                                >
                                  {copiedId === `sug-${sIdx}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div>
                              <div className="font-bold text-sm text-amber-200">
                                {sug.text}
                              </div>
                              <div className="text-xs text-gray-300 font-medium mt-0.5">
                                ({sug.meaning_vi})
                              </div>
                              {sug.vi_transliteration && (
                                <div className="text-[11px] text-amber-400/90 font-black mt-1">
                                  Bồi: {sug.vi_transliteration}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 pt-1 border-t border-gray-800/60">
                              <button
                                type="button"
                                onClick={() => handleApplySentenceToInput(sug.text)}
                                className="text-[11px] text-gray-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Điền vào ô nhập</span>
                              </button>
                              <span className="text-gray-600 text-[10px]">•</span>
                              <button
                                type="button"
                                onClick={() => handleSendSpecificSentence(sug.text)}
                                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Send className="w-3 h-3" />
                                <span>Gửi câu này ngay</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PHẦN 3: CÂU ĐÁP HỘI THOẠI TIẾP THEO CỦA TRỢ LÝ AI */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      <span>Trợ lý AI đáp lời:</span>
                    </div>

                    {msg.original ? (
                      <div>
                        <div className={`text-base sm:text-lg font-black ${styles.textHeading} tracking-tight`}>
                          {msg.original}
                        </div>

                        {/* Vietnamese Translation Highlight */}
                        {msg.meaning_vi && (
                          <div className={`text-sm font-semibold ${styles.textPrimary} mt-1 flex items-center gap-1.5`}>
                            <span>({msg.meaning_vi})</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className={`text-sm font-semibold ${styles.textLight} leading-relaxed`}>
                        {msg.content}
                      </p>
                    )}

                    {/* Bồi Transliteration & IPA */}
                    {(msg.vi_transliteration || msg.ipa) && (
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {msg.vi_transliteration && (
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-black border ${
                              theme === 'black-gold'
                                ? 'border-[#F59E0B] bg-[#1F1905] text-[#FBBF24]'
                                : 'border-[#F97316] bg-[#1E253E] text-[#FF7A00]'
                            }`}
                          >
                            Bồi: {msg.vi_transliteration}
                          </span>
                        )}

                        {msg.ipa && (
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono border ${styles.border} ${styles.textSecondary}`}
                          >
                            {msg.ipa.startsWith('/') ? msg.ipa : `/${msg.ipa}/`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Guidance/Tip if user wrote Vietnamese or needed correction */}
                  {msg.user_tip && (
                    <div
                      className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
                        theme === 'black-gold'
                          ? 'border-[#F59E0B]/30 bg-[#16140B] text-amber-300'
                          : 'border-orange-500/30 bg-[#172036] text-orange-200'
                      }`}
                    >
                      {msg.user_tip}
                    </div>
                  )}

                  {/* Message Action Bar: Audio, Copy, Practice Pronunciation */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-700/20">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {msg.original && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              speakText(msg.original!, currentLangConfig?.voiceLang || 'en-US', 1.0)
                            }
                            className={`p-1.5 rounded-lg border ${styles.border} ${styles.textSecondary} hover:${styles.textPrimary} transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold`}
                            title="Nghe phát âm chuẩn tốc độ 1.0x"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>1.0x</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              speakText(msg.original!, currentLangConfig?.voiceLang || 'en-US', 0.7)
                            }
                            className={`p-1.5 rounded-lg border ${styles.border} ${styles.textSecondary} hover:${styles.textPrimary} transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold`}
                            title="Nghe chậm tốc độ 0.7x"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>0.7x</span>
                          </button>

                          {onPracticeSentence && (
                            <button
                              type="button"
                              onClick={() => handlePracticeThisSentence(msg)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/40 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                              title="Mở phòng luyện phát âm AI cho câu này"
                            >
                              <Mic className="w-3 h-3" />
                              <span>Luyện phát âm câu này</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(msg.original || msg.content, msg.id)}
                      className={`p-1.5 rounded-lg border ${styles.border} ${styles.textSecondary} hover:${styles.textPrimary} transition-all cursor-pointer`}
                      title="Sao chép câu"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 items-center">
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 border animate-pulse ${
                  theme === 'black-gold'
                    ? 'bg-[#1A1D2B] border-[#F59E0B] text-[#F59E0B]'
                    : 'bg-[#152549] border-[#F97316] text-[#F97316]'
                }`}
              >
                <Bot className="w-4 h-4" />
              </div>

              <div
                className={`p-3.5 rounded-2xl border ${styles.border} ${styles.bgCardSubtle} text-xs font-semibold ${styles.textSecondary} flex items-center gap-2 shadow-xs`}
              >
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Trợ lý AI đang phản hồi & dịch tiếng Việt...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggested Reply Chips */}
        {availableSuggestions.length > 0 && (
          <div className={`px-4 sm:px-6 py-2.5 border-t border-b ${styles.border} ${styles.bgCardSubtle} flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${styles.textSecondary} shrink-0 flex items-center gap-1`}>
              <Sparkles className="w-3 h-3 text-amber-400" />
              Gợi ý trả lời nhanh:
            </span>
            {availableSuggestions.map((reply, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(reply.original)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 flex items-center gap-1.5 ${
                  theme === 'black-gold'
                    ? 'border-[#F59E0B]/40 bg-[#16140A] text-[#FBBF24] hover:bg-[#25200E]'
                    : 'border-orange-500/40 bg-[#162038] text-orange-300 hover:bg-[#1C2C4E]'
                } disabled:opacity-40`}
                title={`Nhấn để gửi: "${reply.original}" (${reply.meaning_vi})`}
              >
                <span>{reply.original}</span>
                <span className="text-[10px] opacity-75 font-normal">({reply.meaning_vi})</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Controls Footer */}
        <div
          className={`p-3.5 sm:p-5 border-t-2 ${styles.border} ${
            theme === 'black-gold' ? 'bg-[#0E1017]' : 'bg-[#0D1B36]'
          } shrink-0`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            {/* Mic Speech-to-Text Button */}
            <button
              type="button"
              id="btn-chat-mic"
              onClick={toggleVoiceInput}
              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                  : `${styles.btnSecondary} hover:${styles.borderAccent}`
              }`}
              title={isListening ? 'Đang lắng nghe... Nhấn để dừng' : 'Nói để nhập tin nhắn'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input Field */}
            <div className="relative flex-1">
              <input
                id="input-chat-message"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isListening
                    ? 'Đang lắng nghe giọng nói của bạn...'
                    : `Nhắn bằng tiếng Việt hoặc ${currentLangConfig?.name}... (VD: Bạn tên là gì?)`
                }
                className={`w-full p-3.5 sm:p-4 pr-10 ${styles.bgInput} ${styles.textLight} text-sm font-semibold rounded-2xl border-2 ${styles.border} ${styles.borderFocus} outline-none transition-all shadow-inner`}
              />
              {inputMessage && (
                <button
                  type="button"
                  onClick={() => setInputMessage('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Send Button */}
            <button
              type="submit"
              id="btn-chat-send"
              disabled={!inputMessage.trim() || isLoading}
              className={`p-3.5 sm:p-4 ${styles.btnPrimary} disabled:opacity-40 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center shrink-0 disabled:cursor-not-allowed`}
              title="Gửi tin nhắn"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
