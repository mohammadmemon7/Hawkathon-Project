/**
 * SMS Telehealth Engine
 * Keyword-based symptom triage — simulates what a real SMS gateway would receive.
 * In production, POST /api/sms/webhook would be the Twilio/MSG91 callback URL.
 */

// Symptom keyword → triage response map
const TRIAGE_RULES = [
  {
    keywords: ['chest pain', 'chest', 'heart', 'breathless', 'breathing'],
    urgency: 'EMERGENCY',
    response: '🚨 EMERGENCY: Chest pain may indicate a heart attack. Call 108 IMMEDIATELY. Do not wait.',
    hi: '🚨 आपातकाल: छाती में दर्द दिल के दौरे का संकेत हो सकता है। तुरंत 108 पर कॉल करें।'
  },
  {
    keywords: ['dengue', 'rash', 'platelet', 'joint pain', 'joint'],
    urgency: 'HIGH',
    response: '⚠️ Possible Dengue. Watch for skin rash, high fever, body pain. Visit nearest clinic today. Drink ORS. Avoid aspirin.',
    hi: '⚠️ संभावित डेंगू। त्वचा पर चकत्ते, तेज बुखार, शरीर दर्द देखें। आज क्लिनिक जाएं। ORS पियें।'
  },
  {
    keywords: ['malaria', 'chills', 'shivering', 'sweating'],
    urgency: 'HIGH',
    response: '⚠️ Possible Malaria. Consult doctor TODAY. Take prescribed anti-malarial. Avoid mosquitoes. Keep hydrated.',
    hi: '⚠️ संभावित मलेरिया। आज डॉक्टर से मिलें। मच्छरों से बचें। पानी पीते रहें।'
  },
  {
    keywords: ['fever', 'temperature', 'bukhar', 'hot'],
    urgency: 'MEDIUM',
    response: 'Fever detected. Take Paracetamol 650mg every 6 hours. Drink water. If fever > 3 days or above 103°F, visit doctor.',
    hi: 'बुखार है। हर 6 घंटे में Paracetamol 650mg लें। पानी पियें। 3 दिन से ज्यादा या 103°F से ऊपर हो तो डॉक्टर जाएं।'
  },
  {
    keywords: ['cough', 'cold', 'sneezing', 'runny nose', 'flu', 'sardi'],
    urgency: 'LOW',
    response: 'Possible cold/flu. Rest, drink warm water, take steam. If cough persists >7 days or with blood, see a doctor.',
    hi: 'सर्दी/फ्लू हो सकता है। आराम करें, गर्म पानी पियें, भाप लें। 7 दिन से ज्यादा या खून आए तो डॉक्टर जाएं।'
  },
  {
    keywords: ['diarrhea', 'loose motion', 'vomiting', 'ulti', 'dast'],
    urgency: 'MEDIUM',
    response: 'Diarrhea/Vomiting detected. Drink ORS every hour. Avoid solid food for 6 hours. If blood in stool or >24hrs, visit clinic.',
    hi: 'दस्त/उल्टी। हर घंटे ORS पियें। 6 घंटे ठोस खाना न खाएं। खून आए या 24 घंटे से ज्यादा हो तो क्लिनिक जाएं।'
  },
  {
    keywords: ['headache', 'sir dard', 'migraine', 'head'],
    urgency: 'LOW',
    response: 'Headache noted. Rest in dark quiet room. Take Paracetamol. Drink water. If severe/sudden/with vomiting, see doctor urgently.',
    hi: 'सिर दर्द। अंधेरे, शांत कमरे में आराम करें। Paracetamol लें। तेज/अचानक/उल्टी के साथ हो तो तुरंत डॉक्टर जाएं।'
  },
  {
    keywords: ['sugar', 'diabetes', 'blood sugar', 'madhumeh'],
    urgency: 'MEDIUM',
    response: 'Diabetes concern noted. Monitor blood sugar. Take prescribed medicines. Avoid sweets. Consult doctor for dosage review.',
    hi: 'मधुमेह संबंधी समस्या। ब्लड शुगर की जांच करें। दवाई लें। डॉक्टर से दवा की समीक्षा कराएं।'
  },
  {
    keywords: ['bp', 'blood pressure', 'dizziness', 'chakkar'],
    urgency: 'MEDIUM',
    response: 'High BP/dizziness noted. Sit down, rest. Take BP medication if prescribed. Avoid salt. Monitor. See doctor if persistent.',
    hi: 'बीपी/चक्कर। बैठें, आराम करें। बीपी दवाई लें। नमक कम खाएं। जारी रहे तो डॉक्टर जाएं।'
  },
  {
    keywords: ['pregnancy', 'pregnant', 'garbhvati', 'baby'],
    urgency: 'HIGH',
    response: '🤰 Pregnancy noted. Please visit ASHA worker or nearest PHC. Regular check-ups essential. Call 104 for maternal advice.',
    hi: '🤰 गर्भावस्था। ASHA कार्यकर्ता या PHC जाएं। नियमित जांच जरूरी। मातृत्व सहायता के लिए 104 पर कॉल करें।'
  },
  {
    keywords: ['snake', 'scorpion', 'bite', 'sting'],
    urgency: 'EMERGENCY',
    response: '🚨 EMERGENCY: Snake/scorpion bite. Call 108 NOW. Keep victim still. Do NOT cut or suck wound. Go to hospital immediately.',
    hi: '🚨 आपातकाल: सांप/बिच्छू काटा। अभी 108 पर कॉल करें। रोगी को न हिलाएं। अस्पताल जाएं।'
  },
];

const DEFAULT_RESPONSE = {
  urgency: 'LOW',
  response: 'SehatSetu AI: Symptoms noted. Consult an ASHA worker or nearest PHC for advice. For emergencies, call 108.',
  hi: 'SehatSetu AI: लक्षण नोट किए गए। ASHA कार्यकर्ता या निकटतम PHC से सलाह लें। आपातकाल में 108 पर कॉल करें।'
};

function matchTriage(text) {
  const lower = text.toLowerCase();
  for (const rule of TRIAGE_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) {
      return rule;
    }
  }
  return DEFAULT_RESPONSE;
}

/**
 * POST /api/sms/receive
 * Simulates incoming SMS from patient.
 * Body: { from, message, lang }
 */
exports.receive = (req, res, next) => {
  try {
    const { from, message, lang } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const rule = matchTriage(message);
    const reply = (lang === 'hi' && rule.hi) ? rule.hi : rule.response;

    res.json({
      from: from || 'unknown',
      received: message,
      urgency: rule.urgency,
      reply,
      timestamp: new Date().toISOString(),
      helpline: '108 (Emergency) | 104 (Health Advice)',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/sms/examples
 * Returns demo prompts for the simulator UI
 */
exports.examples = (req, res) => {
  res.json([
    { label: 'Fever + Cough', text: 'FEVER COUGH' },
    { label: 'Dengue Signs', text: 'HIGH FEVER RASH JOINT PAIN' },
    { label: 'Diarrhea', text: 'LOOSE MOTION VOMITING' },
    { label: 'Chest Pain', text: 'CHEST PAIN BREATHLESS' },
    { label: 'Pregnancy', text: 'PREGNANT 6 MONTHS' },
    { label: 'Snake Bite', text: 'SNAKE BITE HELP' },
  ]);
};
