/**
 * Lightweight Symptom Checker Engine for SehatSetu
 * Designed for offline/low-bandwidth rural healthcare scenarios.
 * Uses rule-based keyword mapping and scoring.
 */

const CONDITIONS_DATA = [
  {
    id: 'malaria',
    name: { en: 'Possible Malaria', hi: 'मलेरिया की संभावना' },
    symptoms: [
      { keywords: ['chills', 'thand', 'kapkapi'], weight: 3 },
      { keywords: ['high fever', 'tej bukhar', 'bukhaar'], weight: 2 },
      { keywords: ['sweating', 'pasing', 'pasina'], weight: 1 },
      { keywords: ['headache', 'sir dard', 'sar dard'], weight: 1 },
      { keywords: ['body ache', 'badan dard', 'sharir dard'], weight: 1 }
    ],
    explanation: {
      en: 'Your symptoms match patterns of Malaria, which is common in rural areas. It is caused by mosquito bites.',
      hi: 'आपके लक्षण मलेरिया से मिलते-जुलते हैं, जो ग्रामीण इलाकों में आम है। यह मच्छरों के काटने से होता है।'
    },
    recommendation: {
      en: 'Get a blood test (MP test) immediately. Use mosquito nets and stay hydrated.',
      hi: 'तुरंत खून की जांच (MP टेस्ट) कराएं। मच्छरदानी का प्रयोग करें और खूब पानी पिएं।'
    }
  },
  {
    id: 'dengue',
    name: { en: 'Possible Dengue', hi: 'डेंगू की संभावना' },
    symptoms: [
      { keywords: ['joint pain', 'jodon mein dard', 'haddi dard'], weight: 3 },
      { keywords: ['behind eyes', 'aankhon ke peeche dard'], weight: 2 },
      { keywords: ['rash', 'daane', 'laal nishan'], weight: 2 },
      { keywords: ['high fever', 'tej bukhar'], weight: 2 },
      { keywords: ['nausea', 'ulte', 'ji ghabrana'], weight: 1 }
    ],
    explanation: {
      en: 'Dengue often causes severe joint and muscle pain, sometimes called "breakbone fever".',
      hi: 'डेंगू में अक्सर जोड़ों और मांसपेशियों में बहुत तेज़ दर्द होता है, जिसे "हड्डी तोड़ बुखार" भी कहा जाता है।'
    },
    recommendation: {
      en: 'Monitor platelet count. Drink plenty of fluids like coconut water. Do not take Aspirin.',
      hi: 'प्लेटलेट काउंट पर नज़र रखें। नारियल पानी जैसे तरल पदार्थ पिएं। एस्पिरिन (Aspirin) न लें।'
    }
  },
  {
    id: 'typhoid',
    name: { en: 'Possible Typhoid', hi: 'टाइफाइड की संभावना' },
    symptoms: [
      { keywords: ['step-ladder fever', 'stomach pain', 'pet dard'], weight: 3 },
      { keywords: ['weakness', 'kamzori'], weight: 2 },
      { keywords: ['constipation', 'kabz', 'diarrhea', 'dast'], weight: 1 },
      { keywords: ['loss of appetite', 'bhook na lagna'], weight: 1 }
    ],
    explanation: {
      en: 'Typhoid is a bacterial infection often spread through contaminated food or water.',
      hi: 'टाइफाइड एक बैक्टीरिया से होने वाला इन्फेक्शन है जो अक्सर दूषित खाने या पानी से फैलता है।'
    },
    recommendation: {
      en: 'Consult a doctor for antibiotics. Drink only boiled water and eat simple food.',
      hi: 'एंटीबायोटिक्स के लिए डॉक्टर से मिलें। केवल उबला हुआ पानी पिएं और हल्का खाना खाएं।'
    }
  },
  {
    id: 'dehydration',
    name: { en: 'Severe Dehydration', hi: 'पानी की भारी कमी (डिहाइड्रेशन)' },
    symptoms: [
      { keywords: ['loose motion', 'dast', 'diarrhea'], weight: 3 },
      { keywords: ['vomiting', 'ulte', 'ultiya'], weight: 3 },
      { keywords: ['dry mouth', 'muh sookhna', 'pyaas'], weight: 2 },
      { keywords: ['dizziness', 'chakkar'], weight: 1 }
    ],
    explanation: {
      en: 'Severe loss of body fluids due to diarrhea or heat can be dangerous.',
      hi: 'दस्त या गर्मी के कारण शरीर में पानी की कमी होना खतरनाक हो सकता है।'
    },
    recommendation: {
      en: 'Start ORS (Jal-Jeevan) immediately. If pulse is high, go to the clinic for IV fluids.',
      hi: 'तुरंत ORS (जीवन-रक्षक घोल) शुरू करें। अगर चक्कर बढ़ें तो ग्लूकोज चढ़वाने के लिए क्लिनिक जाएं।'
    }
  },
  {
    id: 'anemia',
    name: { en: 'Possible Anemia', hi: 'खून की कमी (एनीमिया)' },
    symptoms: [
      { keywords: ['pale skin', 'pila rang', 'safed'], weight: 2 },
      { keywords: ['fatigue', 'thakan', 'thakawat'], weight: 3 },
      { keywords: ['breathless', 'saans phulna'], weight: 2 },
      { keywords: ['pica', 'geeli mitti khana', 'khariya'], weight: 1 }
    ],
    explanation: {
      en: 'Anemia is very common in rural India, often due to lack of iron in the diet.',
      hi: 'भारत के ग्रामीण इलाकों में एनीमिया बहुत आम है, जो अक्सर भोजन में आयरन की कमी के कारण होता है।'
    },
    recommendation: {
      en: 'Increase intake of green leafy vegetables and jaggery (gur). Take iron supplements.',
      hi: 'हरी पत्तेदार सब्जियां और गुड़ का सेवन बढ़ाएं। आयरन की गोलियां लें।'
    }
  },
  {
    id: 'heat_stroke',
    name: { en: 'Heat Exhaustion', hi: 'लू लगना' },
    symptoms: [
      { keywords: ['hot sun', 'dhoop', 'loo'], weight: 2 },
      { keywords: ['confusion', 'ghabrahat'], weight: 2 },
      { keywords: ['no sweat', 'pasina na ana'], weight: 3 },
      { keywords: ['high temp', 'sharir garm'], weight: 2 }
    ],
    explanation: {
      en: 'Extreme heat can cause the body to overheat. This is common during harvest season.',
      hi: 'कड़ी धूप शरीर के तापमान को बढ़ा सकती है। यह कटाई के मौसम में बहुत आम है।'
    },
    recommendation: {
      en: 'Move to a cool shade. Apply wet cloth to the skin. Sip cool water slowly.',
      hi: 'किसी ठंडी छाया में जाएं। शरीर पर गीला कपड़ा लगाएं और धीरे-धीरे ठंडा पानी पिएं।'
    }
  },
  {
    id: 'flu',
    name: { en: 'Common Flu / Viral', hi: 'नॉर्मल वायरल या फ्लू' },
    symptoms: [
      { keywords: ['runny nose', 'naak behna', 'jukham'], weight: 2 },
      { keywords: ['cough', 'khansi'], weight: 2 },
      { keywords: ['sore throat', 'gale mein kharash', 'dard'], weight: 2 },
      { keywords: ['mild fever', 'halka bukhar'], weight: 1 }
    ],
    explanation: {
      en: 'Standard seasonal infection. Usually resolves on its own with rest.',
      hi: 'यह मौसम बदलने वाला इन्फेक्शन है। आमतौर पर आराम करने से ठीक हो जाता है।'
    },
    recommendation: {
      en: 'Steam inhalation, warm fluids, and rest. Take Paracetamol if fever rises.',
      hi: 'भाप लें, गरम पानी पिएं और आराम करें। बुखार बढ़ने पर पैरासिटामोल लें।'
    }
  },
  {
    id: 'skin_infection',
    name: { en: 'Skin Infection / Fungal', hi: 'त्वचा का संक्रमण (दाद-खुजली)' },
    symptoms: [
      { keywords: ['itching', 'khujli'], weight: 3 },
      { keywords: ['redness', 'laal'], weight: 1 },
      { keywords: ['patches', 'daag', 'ring', 'daad'], weight: 2 }
    ],
    explanation: {
      en: 'Fungal infections occur in humid weather or due to shared clothing.',
      hi: 'नमी वाले मौसम या कपड़ों की वजह से फंगल इन्फेक्शन हो सकता है।'
    },
    recommendation: {
      en: 'Keep the area dry. Use antifungal cream. Wash clothes in hot water.',
      hi: 'प्रभावित जगह को सूखा रखें। फंगस वाली क्रीम लगाएं। कपड़ों को गरम पानी में धोएं।'
    }
  }
];

/**
 * Analyzes symptoms using a weighted keyword scoring system.
 * @param {string} symptomsText - User input text
 * @param {string} language - 'en' or 'hi'
 */
function analyzeSymptomsLite(symptomsText, language = 'hi') {
  if (!symptomsText) return null;
  
  const text = symptomsText.toLowerCase();
  const results = [];

  CONDITIONS_DATA.forEach(condition => {
    let score = 0;
    const matched = [];
    condition.symptoms.forEach(sym => {
      const found = sym.keywords.find(kw => text.includes(kw));
      if (found) {
        score += sym.weight;
        matched.push(found);
      }
    });

    if (score > 0) {
      results.push({ ...condition, score, matched });
    }
  });

  // Sort by highest score
  results.sort((a, b) => b.score - a.score);

  if (results.length === 0) {
    return {
      condition: language === 'hi' ? 'अस्पष्ट लक्षण' : 'Unclear Symptoms',
      risk_level: 'LOW',
      recommendation: language === 'hi' ? 'कृपया अपनी समस्या के बारे में और बताएं या डॉक्टर से मिलें।' : 'Please describe your symptoms in more detail or visit a doctor.',
      explanation: language === 'hi' ? 'आपके द्वारा दी गई जानकारी किसी खास बीमारी की ओर इशारा नहीं कर रही।' : 'The information provided does not point to a specific condition yet.',
      matched_symptoms: [],
      score: 0
    };
  }

  const topMatch = results[0];
  let risk_level = 'LOW';
  if (topMatch.score >= 6) risk_level = 'HIGH';
  else if (topMatch.score >= 3) risk_level = 'MEDIUM';

  return {
    condition: topMatch.name[language] || topMatch.name.en,
    risk_level,
    recommendation: topMatch.recommendation[language] || topMatch.recommendation.en,
    explanation: topMatch.explanation[language] || topMatch.explanation.en,
    matched_symptoms: topMatch.matched,
    score: topMatch.score
  };
}

module.exports = { analyzeSymptomsLite };
