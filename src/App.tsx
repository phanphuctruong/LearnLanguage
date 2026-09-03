import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LanguageSelector } from './components/LanguageSelector';
import { InputSection } from './components/InputSection';
import { ResultCard } from './components/ResultCard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { RulesModal } from './components/RulesModal';
import { FlashcardModal } from './components/FlashcardModal';
import { PronunciationModal } from './components/PronunciationModal';
import { LanguageChatModal } from './components/LanguageChatModal';
import { TargetLanguageCode, TranslationResult, HistoryItem } from './types';
import { SUPPORTED_LANGUAGES } from './data/languages';
import { AlertCircle, Sparkles, RotateCw, MessageCircle } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const DEFAULT_SEEDS: Record<TargetLanguageCode, TranslationResult> = {
  en: {
    original: 'Thank you',
    meaning_vi: 'Cảm ơn bạn',
    ipa: 'ˈθæŋk juː',
    vi_transliteration: 'Thẻng kiu',
    level_expressions: [
      {
        level: 'basic',
        level_label: 'Cơ bản (A1 - A2)',
        original: 'Thanks a lot!',
        meaning_vi: 'Cảm ơn nhiều nha!',
        ipa: 'θæŋks ə lɒt',
        vi_transliteration: 'Thẻngks ờ lót!',
        context: 'Nói với bạn bè, người thân quen hàng ngày',
      },
      {
        level: 'intermediate',
        level_label: 'Tự nhiên / Thông dụng (B1 - B2)',
        original: 'I really appreciate your help.',
        meaning_vi: 'Tôi thực sự rất trân trọng sự giúp đỡ của bạn.',
        ipa: 'aɪ ˈrɪəli əˈpriːʃieɪt jɔːr hɛlp',
        vi_transliteration: 'Ai riu-ly ơ-pờ-ri-si-ết do hewp.',
        context: 'Lịch sự, chân thành trong đời sống và giao tiếp',
      },
      {
        level: 'advanced',
        level_label: 'Nâng cao / Lịch sự (C1 - C2)',
        original: 'I am exceedingly grateful for your generous assistance.',
        meaning_vi: 'Tôi vô cùng biết ơn sự hỗ trợ quý báu và tận tình của quý vị.',
        ipa: 'aɪ æm ɪkˈsiːdɪŋli ˈɡreɪtfʊl fɔːr jɔːr ˈdʒɛnərəs əˈsɪstəns',
        vi_transliteration: 'Ai em ích-xí-đinh-ly gờ-rết-phun pho do gien-nơ-rơt ơ-xít-xtần.',
        context: 'Thư tín thương mại, sự kiện trang trọng, gặp đối tác',
      },
    ],
  },
  ja: {
    original: 'こんにちは (Konnichiwa)',
    meaning_vi: 'Xin chào',
    ipa: 'kon.ni.tɕi.wa',
    vi_transliteration: 'Côn-ni-chi-wa',
    level_expressions: [
      {
        level: 'basic',
        level_label: 'Cơ bản (A1 - A2)',
        original: 'やあ、最近どう？ (Yaa, saikin dou?)',
        meaning_vi: 'Chào cậu, dạo này thế nào?',
        ipa: 'jaː sai.kiɴ doː',
        vi_transliteration: 'Yaa, sai-kin đô-u?',
        context: 'Gặp gỡ bạn bè, người bằng tuổi hoặc thân quen',
      },
      {
        level: 'intermediate',
        level_label: 'Tự nhiên / Thông dụng (B1 - B2)',
        original: 'こんにちは、今日もお疲れ様です！ (Konnichiwa, kyou mo otsukaresama desu!)',
        meaning_vi: 'Xin chào, hôm nay bạn cũng đã vất vả nhiều rồi!',
        ipa: 'kon.ni.tɕi.wa kjoː mo o.tsɯ.ka.ɾe.sa.ma de.sɯ',
        vi_transliteration: 'Côn-ni-chi-wa, ki-ô mô ô-tsu-ca-rê-sa-ma đét!',
        context: 'Chào đồng nghiệp, đối tác quen thuộc nơi công sở',
      },
      {
        level: 'advanced',
        level_label: 'Nâng cao / Lịch sự (C1 - C2)',
        original: '平素は格別のご高配を賜り、厚く御礼申し上げます (Heiso wa kakubetsu no gokouhai o tamawari, atsuku onrei moushiagemasu)',
        meaning_vi: 'Kính chào quý vị, chúng tôi xin chân thành cảm tạ sự hỗ trợ đặc biệt mà quý vị đã luôn ưu ái dành cho',
        ipa: 'heː.so wa ka.kɯ.be.tsɯ no ɡo.koː.hai o ta.ma.wa.ɾi a.tsɯ.kɯ oɴ.ɾeː moː.ɕi.a.ɡe.ma.sɯ',
        vi_transliteration: 'Hê-xô qua ca-cư-bét-tsu nô gô-cô-hai ô ta-ma-qua-ri, át-tsu-cư ôn-rê-i mô-u-xi-a-ghê-ma-sự',
        context: 'Keigo kính ngữ tối cao trong thư từ thương mại Nhật Bản',
      },
    ],
  },
  zh: {
    original: '你好 (Nǐ hǎo)',
    meaning_vi: 'Xin chào',
    ipa: 'ni˨˩˦ xɑʊ̯˨˩˦',
    vi_transliteration: 'Ní hảo',
    level_expressions: [
      {
        level: 'basic',
        level_label: 'Cơ bản (A1 - A2)',
        original: '嗨，最近怎么样？ (Hāi, zuìjìn zěnmeyàng?)',
        meaning_vi: 'Chào bồ, dạo này sao rồi?',
        ipa: 'xaɪ tswêɪ.tɕîn tsən.mə.jâŋ',
        vi_transliteration: 'Hai, chuây-chin chẩn-mơ-dang?',
        context: 'Bạn bè, đồng nghiệp quen biết thân thiết',
      },
      {
        level: 'intermediate',
        level_label: 'Tự nhiên / Thông dụng (B1 - B2)',
        original: '你好，很高兴认识你！ (Nǐ hǎo, hěn gāoxìng rènshi nǐ!)',
        meaning_vi: 'Xin chào, rất vui được làm quen với bạn!',
        ipa: 'ni˨˩˦ xɑʊ̯˨˩˦ xən˨˩˦ kɑʊ̯˥˩ ɕiŋ˥˩ ʐən˥˩.ʂʐ̩ ni˨˩˦',
        vi_transliteration: 'Ní hảo, hẩn cao-xing rần-sự nỉ!',
        context: 'Gặp gỡ người mới, giao thiệp thường ngày',
      },
      {
        level: 'advanced',
        level_label: 'Nâng cao / Lịch sự (C1 - C2)',
        original: '您好，久仰大名，今日有幸相会！ (Nín hǎo, jiǔyǎng dàmíng, jīnrì yǒuxìng xiānghuì!)',
        meaning_vi: 'Kính chào ngài, đã ngưỡng mộ đại danh từ lâu, hôm nay thật hữu hạnh được diện kiến!',
        ipa: 'nin˧˥ xɑʊ̯˨˩˦ tɕjoʊ̯˨˩˦ jɑŋ˨˩˦ tâ.mǐŋ tɕin˥ ʐî˥˩ joʊ̯˨˩˦ ɕiŋ˥˩ ɕjɑŋ˥ xweɪ˥˩',
        vi_transliteration: 'Nín hảo, chiểu-dảng ta-mính, chin-rự dẩu-xing xing-huây!',
        context: 'Ngoại giao, đàm phán thương mại và lễ tiết trang trọng',
      },
    ],
  },
  fr: {
    original: 'Bonjour',
    meaning_vi: 'Xin chào / Chúc một ngày tốt lành',
    ipa: 'bɔ̃.ʒuʁ',
    vi_transliteration: 'Bông-giua',
    level_expressions: [
      {
        level: 'basic',
        level_label: 'Cơ bản (A1 - A2)',
        original: 'Salut ! Ça roule ?',
        meaning_vi: 'Chào cậu! Ổn cả chứ?',
        ipa: 'sa.ly sa ʁul',
        vi_transliteration: 'Xa-luy! Xa run?',
        context: 'Nói với bạn thân hoặc đồng lứa',
      },
      {
        level: 'intermediate',
        level_label: 'Tự nhiên / Thông dụng (B1 - B2)',
        original: 'Bonjour, comment allez-vous aujourd\'hui ?',
        meaning_vi: 'Xin chào, hôm nay ông/bà thấy thế nào?',
        ipa: 'bɔ̃.ʒuʁ kɔ.mɑ̃ ta.le vu o.ʒuʁ.dɥi',
        vi_transliteration: 'Bông-giua, cô-măng ta-lê vu ô-giua-đuy?',
        context: 'Lịch sự chuẩn mực trong đời sống hàng ngày',
      },
      {
        level: 'advanced',
        level_label: 'Nâng cao / Lịch sự (C1 - C2)',
        original: 'C\'est un insigne honneur de faire votre éminente connaissance.',
        meaning_vi: 'Quả là một vinh dự đặc biệt to lớn khi được diện kiến quý vị.',
        ipa: 'sɛ tœ̃ nɛ̃.siɲ ɔ.nœʁ də fɛʁ vɔtʁ e.mi.nɑ̃t kɔ.nɛ.sɑ̃s',
        vi_transliteration: 'Xe tanh-xinh-nhơ ô-nơ đơ phe vót-khờ ê-mi-năng cô-ne-xăng.',
        context: 'Văn phong ngoại giao, hội nghị quốc tế và sự kiện trang trọng',
      },
    ],
  },
  th: {
    original: 'สวัสดี (Sawatdee)',
    meaning_vi: 'Xin chào',
    ipa: 'sa˨˩.wat˨˩.diː˧',
    vi_transliteration: 'Xà-goát-đi',
    level_expressions: [
      {
        level: 'basic',
        level_label: 'Cơ bản (A1 - A2)',
        original: 'หวัดดี สบายดีไหม (Wat-dee, sabai dee mai?)',
        meaning_vi: 'Chào nhé, khỏe không nè?',
        ipa: 'wat˨˩ diː˧ sa˨˩ baːj˧ diː˧ maj˩˩˦',
        vi_transliteration: 'Oát-đi, xà-bai-đi-mải?',
        context: 'Bạn bè nói chuyện thân mật',
      },
      {
        level: 'intermediate',
        level_label: 'Tự nhiên / Thông dụng (B1 - B2)',
        original: 'สวัสดีครับ ยินดีที่ได้รู้จักครับ (Sawatdee khrap, yindee tee dai roojak khrap)',
        meaning_vi: 'Xin chào, rất vui vì đã được làm quen với bạn ạ.',
        ipa: 'sa˨˩ wat˨˩ diː˧ kʰrap˦ jin˧ diː˧ tʰiː˥˩ daːj˥˩ ruː˦˨ tɕak˨˩ kʰrap˦',
        vi_transliteration: 'Xà-goát-đi khập, din-đi thì đai ru-chặc khập.',
        context: 'Giao tiếp lịch thiệp với người lớn, khách hàng',
      },
      {
        level: 'advanced',
        level_label: 'Nâng cao / Lịch sự (C1 - C2)',
        original: 'กราบเรียนท่านผู้มีเกียรติทุกท่าน ด้วยความเคารพอย่างยิ่ง (Krap rian than phu mee kiat thuk than, duay khwam khaorop yang ying)',
        meaning_vi: 'Kính thưa toàn thể quý quan khách tôn kính, với lòng ngưỡng vọng và kính trọng sâu sắc nhất.',
        ipa: 'kraːp˨˩ rian˧ tʰaːn˥˩ pʰuː˥˩ miː˧ kiat˨˩ tʰuk˦ tʰaːn˥˩ duaːj˥˩ kʰwaːm˧ kʰaw˧ rop˦ jaːŋ˨˩ jiŋ˥˩',
        vi_transliteration: 'Cờ-rạp riên than phu mi kiệt thúc than, đuôi khoam khao-rốp dàng dình.',
        context: 'Phát biểu hội nghị cao cấp, diễn văn trang trọng',
      },
    ],
  },
  de: {
    original: 'Guten Tag',
    meaning_vi: 'Xin chào / Chúc một ngày tốt lành',
    ipa: 'ˌɡuːtn̩ ˈtaːk',
    vi_transliteration: 'Gu-từn Thác',
    level_expressions: [
      {
        level: 'basic',
        level_label: 'Cơ bản (A1 - A2)',
        original: 'Hi! Wie läuft\'s bei dir?',
        meaning_vi: 'Chào! Dạo này mọi việc sao rồi?',
        ipa: 'haɪ viː lɔɪ̯fts baɪ̯ diːɐ̯',
        vi_transliteration: 'Hai! Vi loif-sự bai đia?',
        context: 'Chào bạn bè, người cùng lứa tuổi',
      },
      {
        level: 'intermediate',
        level_label: 'Tự nhiên / Thông dụng (B1 - B2)',
        original: 'Guten Tag, freut mich sehr, Sie kennenzulernen.',
        meaning_vi: 'Xin chào, tôi rất vui khi được làm quen với ông/bà.',
        ipa: 'ˌɡuːtn̩ ˈtaːk fʁɔɪ̯t mɪç zeːɐ̯ ziː ˈkɛnəntsuːˌlɛʁnən',
        vi_transliteration: 'Gu-từn Thác, phờ-roi-thự mích dê, di ken-nừn-txu-léc-nừn.',
        context: 'Gặp gỡ đối tác, môi trường công sở thông thường',
      },
      {
        level: 'advanced',
        level_label: 'Nâng cao / Lịch sự (C1 - C2)',
        original: 'Es gereicht mir zur außerordentlichen Ehre, Ihre geschätzte Bekanntschaft zu machen.',
        meaning_vi: 'Thật là một niềm vinh hạnh phi thường khi được diện kiến quý ngài tôn kính.',
        ipa: 'ɛs ɡəˈʁaɪ̯çt miːɐ̯ tsuːɐ̯ ˈaʊ̯sɐʔɔʁdn̩tlɪçn̩ ˈeːʁə ˈiːʁə ɡəˈʃɛtstə bəˈkantʃaft tsuː ˈmaxn̩',
        vi_transliteration: 'Ét gơ-rai-hựt mia txua ao-xơ-ooc-đừn-t-li-hừn ê-rơ, Y-rơ gơ-sét-xtơ bơ-can-sáp-thự txu ma-khừn.',
        context: 'Nghi thức ngoại giao, văn thư cao cấp của Đức',
      },
    ],
  },
  es: {
    original: '¡Hola! ¿Cómo estás?',
    meaning_vi: 'Xin chào! Bạn có khỏe không?',
    ipa: 'ˈo.la ˈko.mo esˈtas',
    vi_transliteration: 'Ô-la! Cô-mô ét-tát?',
    level_expressions: [
      {
        level: 'basic',
        level_label: 'Cơ bản (A1 - A2)',
        original: '¡Buenas! ¿Qué tal todo?',
        meaning_vi: 'Chào bạn! Mọi sự ổn cả chứ?',
        ipa: 'ˈbwe.nas ke tal ˈto.ðo',
        vi_transliteration: 'Bu-ê-nát! Kê tan tô-đô?',
        context: 'Chào bạn bè, bạn học thân mật',
      },
      {
        level: 'intermediate',
        level_label: 'Tự nhiên / Thông dụng (B1 - B2)',
        original: 'Hola, es un gran gusto conocerte hoy.',
        meaning_vi: 'Xin chào, rất vui được gặp gỡ bạn hôm nay.',
        ipa: 'ˈo.la es un ɡɾan ˈɡus.to ko.noˈseɾ.te oi̯',
        vi_transliteration: 'Ô-la, ét un gờ-ran gút-xtô cô-nô-xéc-tê oi.',
        context: 'Lịch sự, thân thiện trong giao tiếp cuộc sống',
      },
      {
        level: 'advanced',
        level_label: 'Nâng cao / Lịch sự (C1 - C2)',
        original: 'Constituye para mí un singular honor y distinción tener el privilegio de conocerle.',
        meaning_vi: 'Đây là một niềm vinh hạnh độc nhất vô nhị và là đặc ân lớn lao khi tôi có cơ hội được diện kiến ngài.',
        ipa: 'kons.tiˈtwi.ʝe ˈpa.ɾa mi un siŋ.ɡuˈlaɾ oˈnoɾ i dis.tiŋˈsjon teˈneɾ el pɾi.βiˈle.xjo ðe ko.noˈseɾ.le',
        vi_transliteration: 'Côn-xờ-ti-tuy-dê pa-ra mi un xinh-gu-la ô-no i đít-xtinh-xi-ôn tê-ne en bờ-ri-bi-lê-khi-ô đê cô-nô-xéc-lê.',
        context: 'Nghi lễ ngoại giao, lễ tân cấp nhà nước Tây Ban Nha',
      },
    ],
  },
};

function AppContent() {
  const { theme, styles } = useTheme();
  const [selectedLang, setSelectedLang] = useState<TargetLanguageCode>('ja');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<TranslationResult>(DEFAULT_SEEDS.ja);
  const [activeQuery, setActiveQuery] = useState('Konnichiwa');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isPronunciationOpen, setIsPronunciationOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pronunciationTarget, setPronunciationTarget] = useState<{
    result: TranslationResult;
    langId: TargetLanguageCode;
  }>({
    result: DEFAULT_SEEDS.ja,
    langId: 'ja',
  });

  // History & Favorites state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lang_assistant_history');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'seed-ja',
        targetLanguage: 'Tiếng Nhật',
        languageId: 'ja',
        query: 'Konnichiwa',
        result: DEFAULT_SEEDS.ja,
        timestamp: Date.now(),
        isFavorite: true,
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('lang_assistant_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  // When language switches and user hasn't typed an ongoing search, update default card
  const handleSelectLanguage = (langId: TargetLanguageCode) => {
    setSelectedLang(langId);
    setErrorMessage(null);
    if (!query) {
      setResult(DEFAULT_SEEDS[langId]);
      setActiveQuery(SUPPORTED_LANGUAGES.find((l) => l.id === langId)?.samplePhrases[0]?.query || '');
    }
  };

  const handleTranslate = async (textToTranslate?: string) => {
    const text = (textToTranslate || query).trim();
    if (!text) return;

    setIsLoading(true);
    setErrorMessage(null);

    const langObj = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLang);
    const targetLanguageName = langObj ? langObj.name : 'Tiếng Anh';

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage: targetLanguageName,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        let msg = json.error || 'Có lỗi xảy ra khi xử lý yêu cầu.';
        if (typeof msg === 'string' && msg.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(msg);
            if (parsed?.error?.message) {
              msg = parsed.error.message;
            }
          } catch {
            // ignore
          }
        }
        if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
          msg = 'Hệ thống AI đang quá tải đột biến. Vui lòng bấm "Thử lại ngay"!';
        }
        throw new Error(msg);
      }

      const translationData: TranslationResult = json.data;
      setResult(translationData);
      setActiveQuery(text);

      // Add to history
      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        targetLanguage: targetLanguageName,
        languageId: selectedLang,
        query: text,
        result: translationData,
        timestamp: Date.now(),
        isFavorite: false,
      };

      setHistory((prev) => [newItem, ...prev.filter((item) => item.query !== text)]);
    } catch (err: any) {
      console.error('Translation error:', err);
      setErrorMessage(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (samplePhrase: string) => {
    setQuery(samplePhrase);
    handleTranslate(samplePhrase);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSelectedLang(item.languageId);
    setQuery(item.query);
    setActiveQuery(item.query);
    setResult(item.result);
  };

  const handleToggleFavorite = (id?: string) => {
    if (!id) {
      const existing = history.find((h) => h.result.original === result.original);
      if (existing) {
        setHistory((prev) =>
          prev.map((h) => (h.id === existing.id ? { ...h, isFavorite: !h.isFavorite } : h))
        );
      } else {
        const langObj = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLang);
        const newItem: HistoryItem = {
          id: `${Date.now()}`,
          targetLanguage: langObj?.name || 'Tiếng Anh',
          languageId: selectedLang,
          query: activeQuery,
          result: result,
          timestamp: Date.now(),
          isFavorite: true,
        };
        setHistory((prev) => [newItem, ...prev]);
      }
    } else {
      setHistory((prev) =>
        prev.map((h) => (h.id === id ? { ...h, isFavorite: !h.isFavorite } : h))
      );
    }
  };

  const isCurrentFavorite = history.some(
    (h) => h.result.original === result.original && h.isFavorite
  );

  const openPronunciationForCurrent = (targetOverride?: TranslationResult) => {
    const target = targetOverride || result;
    setPronunciationTarget({
      result: target,
      langId: selectedLang,
    });
    setIsPronunciationOpen(true);
  };

  const handleTranslateAndPractice = async (textToTranslate?: string) => {
    const text = (textToTranslate || query).trim();
    if (!text) return;
    setIsLoading(true);
    setErrorMessage(null);

    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLang);
    const targetLanguageName = langConfig?.name || 'Tiếng Anh';

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage: targetLanguageName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Dịch thuật thất bại. Vui lòng thử lại.');
      }

      setResult(data.data);
      setActiveQuery(text);

      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        targetLanguage: targetLanguageName,
        languageId: selectedLang,
        query: text,
        result: data.data,
        timestamp: Date.now(),
        isFavorite: false,
      };

      setHistory((prev) => [newItem, ...prev.filter((item) => item.query !== text)]);

      // Open pronunciation lab directly for this result!
      setPronunciationTarget({
        result: data.data,
        langId: selectedLang,
      });
      setIsPronunciationOpen(true);
    } catch (err: any) {
      console.error('Translation error:', err);
      setErrorMessage(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  const openPronunciationForItem = (item: HistoryItem) => {
    setPronunciationTarget({
      result: item.result,
      langId: item.languageId,
    });
    setIsPronunciationOpen(true);
  };

  const currentPronunciationLangConfig = SUPPORTED_LANGUAGES.find(
    (l) => l.id === pronunciationTarget.langId
  );

  return (
    <div className={`min-h-screen flex flex-col ${styles.bgApp} ${styles.textPrimary} font-sans transition-colors duration-200`}>
      {/* Top Navigation */}
      <Header
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(true)}
        onOpenPronunciation={openPronunciationForCurrent}
        onOpenChat={() => setIsChatOpen(true)}
        historyCount={history.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Language selector tabs */}
        <LanguageSelector
          selectedLang={selectedLang}
          onSelectLang={handleSelectLanguage}
        />

        {/* Search input & suggestions */}
        <InputSection
          query={query}
          onChangeQuery={setQuery}
          onSubmit={() => handleTranslate()}
          onPracticeNow={() => handleTranslateAndPractice()}
          isLoading={isLoading}
          selectedLang={selectedLang}
          onSelectSample={handleSelectSample}
        />

        {/* Tip banner */}
        <div className={`${styles.bgCardSubtle} p-6 rounded-[28px] sm:rounded-[32px] border-2 ${styles.border} shadow-lg flex items-center justify-between flex-wrap gap-4`}>
          <div>
            <p className={`${styles.textPrimary} text-xs sm:text-sm font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5`}>
              <Sparkles className="w-4 h-4" />
              Mẹo học hôm nay
            </p>
            <p className={`${styles.textLight} text-sm sm:text-base leading-relaxed font-medium`}>
              Hãy chú ý vào phần <strong className={`${styles.translitText} font-black`}>Tiếng Việt bồi</strong> và trò chuyện cùng <span className="text-amber-400 font-bold">Trợ Lý Ngôn Ngữ AI</span> (kèm dịch nghĩa) để tăng tương tác thực tế!
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-banner-chat"
              onClick={() => setIsChatOpen(true)}
              className={`px-4 py-2 ${
                theme === 'black-gold'
                  ? 'bg-[#F59E0B] hover:bg-[#FBBF24] text-[#090A0F]'
                  : 'bg-[#F97316] hover:bg-[#FB923C] text-[#0B132B]'
              } rounded-full text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat Trợ Lý AI 💬</span>
            </button>
            <button
              type="button"
              onClick={openPronunciationForCurrent}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>Luyện phát âm 🎙️</span>
            </button>
            <button
              type="button"
              onClick={() => setIsRulesOpen(true)}
              className={`px-4 py-2 ${theme === 'black-gold' ? 'bg-[#06070A]' : 'bg-[#0B132B]'} ${styles.textPrimary} hover:${styles.bgElevated} border ${styles.border} rounded-full text-xs font-bold transition-colors cursor-pointer`}
            >
              Quy tắc bồi âm →
            </button>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="p-5 rounded-2xl bg-rose-950/80 border-2 border-rose-600 text-rose-200 text-sm flex items-center justify-between gap-4 shadow-lg flex-wrap">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-0.5 text-white">Không thể tra cứu:</div>
                <div className="text-xs sm:text-sm text-rose-200 font-medium">{errorMessage}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleTranslate()}
              disabled={isLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Thử lại ngay</span>
            </button>
          </div>
        )}

        {/* Result Card Presentation */}
        {result && (
          <ResultCard
            result={result}
            selectedLang={selectedLang}
            query={activeQuery}
            isFavorite={isCurrentFavorite}
            onToggleFavorite={() => handleToggleFavorite()}
            onOpenPronunciation={openPronunciationForCurrent}
            onOpenChat={() => setIsChatOpen(true)}
          />
        )}
      </main>

      {/* Floating AI Chat Button */}
      <button
        type="button"
        id="btn-floating-chat"
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 z-40 px-4 sm:px-5 py-3 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2 font-black text-xs sm:text-sm tracking-wide transition-all transform hover:scale-105 active:scale-95 cursor-pointer border-2 ${
          theme === 'black-gold'
            ? 'bg-[#F59E0B] text-[#090A0F] border-[#FDE68A] hover:bg-[#FBBF24]'
            : 'bg-[#F97316] text-[#0B132B] border-[#FFEDD5] hover:bg-[#FB923C]'
        }`}
        title="Chat tương tác với Trợ lý ngôn ngữ (có dịch nghĩa tiếng Việt)"
      >
        <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5 animate-bounce" />
        <span>Chat Trợ Lý AI</span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
      </button>

      {/* Footer */}
      <footer className={`mt-12 px-6 sm:px-12 py-6 ${theme === 'black-gold' ? 'bg-[#06070A]' : 'bg-[#080E1E]'} border-t-2 ${styles.border} flex flex-wrap justify-between items-center gap-6`}>
        <div className="flex gap-8 sm:gap-12 flex-wrap">
          <div className="flex flex-col">
            <span className={`text-xs font-bold ${styles.textSecondary} uppercase tracking-wider`}>Chuỗi học tập</span>
            <span className={`text-lg font-black ${styles.textPrimary}`}>🔥 12 Ngày</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-xs font-bold ${styles.textSecondary} uppercase tracking-wider`}>Từ vựng đã lưu</span>
            <span className={`text-lg font-black ${styles.textPrimary}`}>📚 {history.length} Từ</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-xs font-bold ${styles.textSecondary} uppercase tracking-wider`}>Giao diện hiện tại</span>
            <span className={`text-sm font-bold ${styles.textHeading}`}>{styles.icon} {styles.name}</span>
          </div>
        </div>
        <div className={`flex items-center gap-4 text-xs sm:text-sm ${styles.textSecondary} italic`}>
          <span>Vừa tra cứu: {history.slice(0, 3).map((h) => h.result.original).join(', ') || 'Guten Tag, ¡Hola!, Bonjour...'}</span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={handleSelectHistoryItem}
        onToggleFavorite={handleToggleFavorite}
        onClearHistory={() => setHistory([])}
        onPracticeItem={openPronunciationForItem}
      />

      <FlashcardModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        cards={history}
      />

      <PronunciationModal
        isOpen={isPronunciationOpen}
        onClose={() => setIsPronunciationOpen(false)}
        result={pronunciationTarget.result}
        targetLanguage={currentPronunciationLangConfig?.name || 'Tiếng Anh'}
        langConfig={currentPronunciationLangConfig}
        onUpdateGlobalResult={(newResult) => {
          setResult(newResult);
          setPronunciationTarget({
            result: newResult,
            langId: selectedLang,
          });
        }}
      />

      <LanguageChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        targetLangCode={selectedLang}
        onSelectLangCode={(code) => setSelectedLang(code)}
        onPracticeSentence={(customResult) => {
          openPronunciationForCurrent(customResult);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
