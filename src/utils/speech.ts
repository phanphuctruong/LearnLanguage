let currentAudio: HTMLAudioElement | null = null;

export const stopSpeech = () => {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
};

function fallbackWebSpeech(
  cleanText: string,
  langCode: string,
  rate: number,
  onEnd?: () => void,
  onError?: (err: any) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this environment');
    onError?.('Speech synthesis not supported');
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === langCode.toLowerCase() ||
        v.lang.toLowerCase().startsWith(langCode.split('-')[0].toLowerCase())
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Fallback SpeechSynthesis failed:', err);
    onError?.(err);
    return false;
  }
}

export const speakText = (
  text: string,
  langCode: string,
  rate: number = 1.0,
  onEnd?: () => void,
  onError?: (err: any) => void
): boolean => {
  stopSpeech();

  // Strip romaji / parentheses if needed for clearer TTS, or clean text
  // e.g. "こんにちは (Konnichiwa)" -> read "こんにちは" or pure target text
  let cleanText = text.trim();
  if (cleanText.includes('(') && cleanText.includes(')')) {
    const mainPart = cleanText.split('(')[0].trim();
    if (mainPart.length > 0) {
      cleanText = mainPart;
    }
  }

  if (!cleanText) {
    onEnd?.();
    return false;
  }

  // Priority 1: High-fidelity Server Audio Stream (Native pronunciation for ja, th, zh, fr, en)
  try {
    const audioUrl = `/api/tts?lang=${encodeURIComponent(langCode)}&text=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    audio.playbackRate = Math.max(0.5, Math.min(rate, 2.0));

    audio.onended = () => {
      currentAudio = null;
      onEnd?.();
    };

    audio.onerror = (e) => {
      console.warn('HTML5 Audio failed, falling back to Web Speech API:', e);
      currentAudio = null;
      fallbackWebSpeech(cleanText, langCode, rate, onEnd, onError);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio play() error, trying Web Speech API fallback:', err);
        fallbackWebSpeech(cleanText, langCode, rate, onEnd, onError);
      });
    }

    return true;
  } catch (err) {
    console.warn('Audio element error, falling back:', err);
    return fallbackWebSpeech(cleanText, langCode, rate, onEnd, onError);
  }
};

