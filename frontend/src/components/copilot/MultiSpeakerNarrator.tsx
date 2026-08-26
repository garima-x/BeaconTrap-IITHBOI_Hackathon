import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface MultiSpeakerNarratorProps {
  textToRead?: string;
  langCode?: string;
}

const browserLangMap: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  te: "te-IN"
};

const DEFAULT_TTS_TEXTS: Record<string, string> = {
  en: "BeaconTrap AI Threat Intelligence: Monitoring active Android malware campaigns, APK vulnerabilities, and credential interception risks.",
  hi: "बीकनट्रैप एआई थ्रेट इंटेलिजेंस: सक्रिय एंड्रॉइड मैलवेयर अभियानों, एपीके कमजोरियों और क्रेडेंशियल इंटरसेप्शन जोखिमों की निगरानी करना।",
  te: "బీకాన్‌ట్రాప్ AI బెదిరింపు మేధస్సు: సక్రియ Android మాల్వేర్ ప్రచారాలు, APK హానికారకాలు మరియు సమాచార విశ్లేషణను పర్యవేక్షించడం.",
  kn: "ಬೀಕಾನ್‌ಟ್ರಾಪ್ AI ಬೆದರಿಕೆ ಬುದ್ಧಿವಂತಿಕೆ: ಸಕ್ರಿಯ ಆಂಡ್ರಾಯ್ಡ್ ಸಾಫ್ಟ್‌ವೇರ್ ದಾಳಿಗಳು ಮತ್ತು APK ಅಪಾಯಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡುವುದು.",
  ta: "பீகான்ட்ராப் AI அச்சுறுத்தல் நுண்ணறிவு: செயலில் உள்ள ஆண்ட்ராய்டு தீம்பொருள் பிரச்சாரங்கள் மற்றும் ஆபத்துகளைக் கண்காணித்தல்."
};

export const MultiSpeakerNarrator: React.FC<MultiSpeakerNarratorProps> = ({ 
  textToRead = "", 
  langCode = "en" 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleNarrator = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert("Text to speech is not supported in this browser environment.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const fallbackText = DEFAULT_TTS_TEXTS[langCode] || DEFAULT_TTS_TEXTS.en;
    const contentToSpeak = textToRead.trim() || fallbackText;

    // Cancel active synthesis
    window.speechSynthesis.cancel();

    const plainText = contentToSpeak.replace(/[#*`[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utteranceRef.current = utterance; // Retain reference to prevent GC!

    const targetLangTag = browserLangMap[langCode] || "en-US";
    utterance.lang = targetLangTag;
    
    // Match native OS voice for selected language tag
    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    const langPrefix = langCode.toLowerCase();
    const tagPrefix = targetLangTag.toLowerCase();

    const matchedVoice = 
      currentVoices.find(v => v.lang.toLowerCase().replace('_', '-').includes(tagPrefix)) ||
      currentVoices.find(v => v.lang.toLowerCase().startsWith(langPrefix)) ||
      currentVoices.find(v => v.lang.toLowerCase().includes(langPrefix));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (err) => {
      console.warn("TTS Playback issue:", err);
      setIsPlaying(false);
      utteranceRef.current = null;
    };

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };


  return (
    <button
      onClick={toggleNarrator}
      className={`p-2 rounded-full transition-all cursor-pointer ${
        isPlaying
          ? "bg-primary/20 text-primary shadow-[0_0_15px_var(--primary-glow)] animate-pulse"
          : "bg-card border border-card-border text-text-muted hover:text-text-primary hover:border-primary/50"
      }`}
      title={isPlaying ? "Stop Narration" : "Read Summary Aloud (Text to Speech)"}
    >
      {isPlaying ? (
        <VolumeX className="w-5 h-5" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </button>
  );
};

