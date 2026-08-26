import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "system_connected": "SYSTEM CONNECTED // ONLINE",
      "node_ind": "NODE IND: LEAP-205_BOI // THREAT INTELLIGENCE OPERATIONS // LIVE TELEMETRY",
      "beacontrap_ai": "BEACONTRAP AI INTELLIGENCE BRIEFING",
      "copilot_active": "COPILOT ACTIVE",
      "confidence": "CONFIDENCE",
      "potential_exposure": "POTENTIAL EXPOSURE",
      "recommended_priority": "RECOMMENDED PRIORITY",
      "telemetry_ok": "TELEMETRY OK",
      "immediate_action": "IMMEDIATE ACTION",
      "watchlist": "WATCHLIST",
      "critical_80": "CRITICAL: 80+",
      "intel_feed": "INTEL FEED",
      "vulnerability": "VULNERABILITY",
      "operations": "Operations",
      "soc_dashboard": "SOC Dashboard",
      "upload_apk": "Upload APK",
      "analysis_lab": "Analysis Lab",
      "threat_intel": "Threat Intel",
      "mitre_coverage": "MITRE Coverage",
      "c2_database": "C2 Database",
      "signatures": "Signatures",
      "active": "Active",
      
      "soc_command_center": "SOC Command Center",
      "security_analyst": "Security Analyst",
      "bank_officer": "Bank Officer",
      "citizen_impact": "Citizen Impact",
      "campaign_dna": "Campaign DNA",
      "timeline": "Timeline",
      "evidence_ledger": "Evidence Ledger",
      "executive_summary": "Executive Summary",
      
      "threat_classification": "Threat Classification Matrix",
      "technical_analysis": "Technical Malware Analysis",
      "mitre_mapping": "MITRE ATT&CK Mapping",
      "network_analysis": "Network Infrastructure Analysis",
      "iocs": "Indicators of Compromise",
      "risk_attribution": "Risk Attribution Breakdown",
      "campaign_relationships": "Campaign DNA & Threat Relationships",
      "bank_mitigation": "Bank Officer Mitigation Plan",
      "strategic_recommendations": "Strategic Recommendations",
      "evidence_integrity": "Evidence Integrity",
      "appendix": "Appendix",
      
      "lang_en": "English",
      "lang_hi": "हिंदी (Hindi)",
      "lang_kn": "ಕನ್ನಡ (Kannada)",
      "lang_ta": "தமிழ் (Tamil)",
      "lang_te": "తెలుగు (Telugu)",
      "lang_bn": "বাংলা (Bengali)",
      "lang_mr": "मराठी (Marathi)",
      "lang_gu": "ગુજરાતી (Gujarati)",
      "lang_ml": "മലയാളം (Malayalam)",
      "lang_pa": "ਪੰਜਾਬੀ (Punjabi)",
      "lang_or": "ଓଡ଼ିଆ (Odia)",
      "confidential": "CONFIDENTIAL",
      "composite_risk_score": "Composite Risk Score",
      "primary_classification": "Primary Classification",
      "cmd_active": "Command Center Active",
      "all_analytics": "All Analytics",
      "global_map": "Global Intel Map",
      "tactical": "Tactical Matrices",
      "upload_new": "UPLOAD NEW APK",
      "lab_metrics": "LAB METRICS",
      "threat_index": "THREAT RISK INDEX",
      "malware_type": "MALWARE TYPE",
      "export_dossier": "EXPORT AUDIT DOSSIER",
      "cases": "CASES",
      "avg_risk": "AVG RISK",
      "last_seen": "LAST SEEN",
      "ioc_table": "IOC INTELLIGENCE TABLE",
      "type": "TYPE",
      "indicator": "INDICATOR",
      "severity": "SEVERITY"
    }
  },
  hi: {
    translation: {
      "system_connected": "सिस्टम कनेक्टेड // ऑनलाइन",
      "node_ind": "नोड IND: LEAP-205_BOI // खतरा खुफिया संचालन // लाइव टेलीमेट्री",
      "beacontrap_ai": "BEACONTRAP AI इंटेलिजेंस ब्रीफिंग",
      "copilot_active": "कोपायलट सक्रिय",
      "operations": "संचालन",
      "soc_dashboard": "SOC डैशबोर्ड",
      "upload_apk": "APK अपलोड करें",
      "analysis_lab": "विश्लेषण लैब",
      "soc_command_center": "SOC कमांड सेंटर",
      "security_analyst": "सुरक्षा विश्लेषक",
      "bank_officer": "बैंक अधिकारी",
      "citizen_impact": "नागरिक प्रभाव",
      "campaign_dna": "अभियान DNA",
      "timeline": "समयरेखा",
      "evidence_ledger": "साक्ष्य खाता",
      "executive_summary": "कार्यकारी सारांश",
      "threat_classification": "खतरा वर्गीकरण मैट्रिक्स",
      "technical_analysis": "तकनीकी मैलवेयर विश्लेषण",
      "mitre_mapping": "MITRE ATT&CK मैपिंग",
      "network_analysis": "नेटवर्क इन्फ्रास्ट्रक्चर विश्लेषण",
      "iocs": "समझौते के संकेतक",
      "risk_attribution": "जोखिम एट्रिब्यूशन ब्रेकडाउन",
      "campaign_relationships": "अभियान DNA और खतरे के संबंध",
      "bank_mitigation": "बैंक अधिकारी शमन योजना",
      "strategic_recommendations": "रणनीतिक सिफारिशें",
      "evidence_integrity": "साक्ष्य अखंडता",
      "appendix": "परिशिष्ट"
    }
  },
  kn: {
    translation: {
      "operations": "ಕಾರ್ಯಾಚರಣೆಗಳು",
      "soc_dashboard": "SOC ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      "upload_apk": "APK ಅಪ್ಲೋಡ್",
      "analysis_lab": "ವಿಶ್ಲೇಷಣಾ ಲ್ಯಾಬ್",
      "executive_summary": "ಕಾರ್ಯನಿರ್ವಾಹಕ ಸಾರಾಂಶ",
      "technical_analysis": "ತಾಂತ್ರಿಕ ಮಾಲ್‌ವೇರ್ ವಿಶ್ಲೇಷಣೆ",
      "mitre_mapping": "MITRE ATT&CK ಮ್ಯಾಪಿಂಗ್",
      "network_analysis": "ನೆಟ್‌ವರ್ಕ್ ಮೂಲಸೌಕರ್ಯ ವಿಶ್ಲೇಷಣೆ"
    }
  },
  ta: {
    translation: {
      "operations": "செயல்பாடுகள்",
      "soc_dashboard": "SOC கட்டுப்பாட்டு பலகம்",
      "upload_apk": "APK பதிவேற்றுக",
      "analysis_lab": "பகுப்பாய்வு ஆய்வகம்",
      "executive_summary": "நிர்வாக சுருக்கம்",
      "technical_analysis": "தொழில்நுட்ப மால்வேர் பகுப்பாய்வு"
    }
  },
  te: {
    translation: {
      "operations": "కార్యకలాపాలు",
      "soc_dashboard": "SOC డాష్‌బోర్డ్",
      "upload_apk": "APK అప్‌లోడ్",
      "analysis_lab": "విశ్లేషణ ల్యాబ్",
      "executive_summary": "ఎగ్జిక్యూటివ్ సారాంశం",
      "technical_analysis": "సాంకేతిక మాల్వేర్ విశ్లేషణ"
    }
  },
  bn: {
    translation: {
      "operations": "অপারেশনস",
      "soc_dashboard": "SOC ড্যাশবোর্ড",
      "upload_apk": "APK আপলোড",
      "analysis_lab": "বিশ্লেষণ ল্যাব",
      "executive_summary": "নির্বাহী সারসংক্ষেপ"
    }
  },
  mr: {
    translation: {
      "operations": "संचालन",
      "soc_dashboard": "SOC डॅशबोर्ड",
      "upload_apk": "APK अपलोड करा",
      "analysis_lab": "विश्लेषण प्रयोगशाळा",
      "executive_summary": "कार्यकारी सारांश"
    }
  },
  gu: {
    translation: {
      "operations": "ઓપરેશન્સ",
      "soc_dashboard": "SOC ડેશબોર્ડ",
      "upload_apk": "APK અપલોડ કરો",
      "analysis_lab": "વિશ્લેષણ લેબ",
      "executive_summary": "કાર્યકારી સારાંશ"
    }
  },
  ml: {
    translation: {
      "operations": "പ്രവർത്തനങ്ങൾ",
      "soc_dashboard": "SOC ഡാഷ്‌ബോർഡ്",
      "upload_apk": "APK അപ്‌ലോഡ് ചെയ്യുക",
      "analysis_lab": "വിശകലന ലാബ്",
      "executive_summary": "എക്സിക്യൂട്ടീവ് സംഗ്രഹം"
    }
  },
  pa: {
    translation: {
      "operations": "ਕਾਰਜ",
      "soc_dashboard": "SOC ਡੈਸ਼ਬੋਰਡ",
      "upload_apk": "APK ਅਪਲੋਡ ਕਰੋ",
      "analysis_lab": "ਵਿਸ਼ਲੇਸ਼ਣ ਲੈਬ",
      "executive_summary": "ਕਾਰਜਕਾਰੀ ਸੰਖੇਪ"
    }
  },
  or: {
    translation: {
      "operations": "କାର୍ଯ୍ୟାବଳୀ",
      "soc_dashboard": "SOC ଡ୍ୟାସବୋର୍ଡ",
      "upload_apk": "APK ଅପଲୋଡ୍ କରନ୍ତୁ",
      "analysis_lab": "ବିଶ୍ଳେଷଣ ଲାବ୍",
      "executive_summary": "କାର୍ଯ୍ୟକାରୀ ସାରାଂଶ"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
