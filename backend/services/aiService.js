const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

const EMERGENCY_KEYWORDS = [
  'chest pain', 'seene mein dard', 'breathing problem',
  'saans nahi aa raha', 'unconscious', 'behosh', 'stroke',
  'paralysis', 'heart attack', 'dil ka daura', 'severe bleeding',
  'bahut zyada khoon',
];

const EMERGENCY_RESPONSE = {
  triage_level: 'EMERGENCY',
  priority_score: 3,
  simple_explanation: 'Aapke symptoms bahut serious hain. Turant Nabha Civil Hospital jayein ya ambulance bulayein.',
  immediate_action: 'Abhi turant najdiki hospital jayein. Ek minute bhi mat rukhein.',
  home_remedies: null,
  warning_signs: 'Yeh symptoms life-threatening ho sakte hain.',
  is_emergency: true,
  disclaimer: 'Yeh AI suggestion hai. Turant medical help lein.',
};

const FALLBACK_RESPONSE = {
  triage_level: 'CONSULT_SOON',
  priority_score: 2,
  simple_explanation: 'Aapke symptoms ke bare mein poori jaankari nahi mili. Kripya doctor se milein.',
  immediate_action: 'Najdiki doctor se aaj milne ki koshish karein.',
  home_remedies: null,
  warning_signs: 'Agar symptoms badh jayein toh turant hospital jayein.',
  is_emergency: false,
  disclaimer: 'Yeh AI suggestion hai, doctor ki jagah nahi.',
};

const symptomEngine = require('./symptomEngine');

async function analyzeSymptoms(symptoms) {
  try {
    const lower = symptoms.toLowerCase();
    
    // 1. Check for Critical Emergency First
    const isEmergency = EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
    if (isEmergency) return { ...EMERGENCY_RESPONSE };

    // 2. Local Rule-based Matching (Fast & Free)
    const liteResult = symptomEngine.analyzeSymptomsLite(symptoms, 'hi');
    if (liteResult && liteResult.score > 0) {
      return {
        triage_level: liteResult.risk_level === 'HIGH' ? 'EMERGENCY' : (liteResult.risk_level === 'MEDIUM' ? 'CONSULT_SOON' : 'HOME_REMEDY'),
        priority_score: liteResult.score >= 6 ? 3 : (liteResult.score >= 3 ? 2 : 1),
        simple_explanation: liteResult.explanation,
        immediate_action: liteResult.recommendation,
        home_remedies: null, // Recommendations contain these now
        warning_signs: liteResult.explanation, // Using explanation as warning for lite mode
        is_emergency: liteResult.risk_level === 'HIGH',
        disclaimer: 'Rule-based lite analysis.'
      };
    }

    // 3. Attempt Live AI if API key looks valid
    if (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'your_claude_api_key_here') {
      try {
        const message = await client.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          system: 'You are a rural health triage assistant for villages near Nabha, Punjab, India. Patients are mostly farmers and daily-wage workers with limited health literacy. Always respond in simple Hindi. Be caring and clear. Never replace actual medical advice.',
          messages: [
            {
              role: 'user',
              content: `Patient symptoms: ${symptoms}
    
    Respond ONLY with a valid JSON object, no other text:
    {
      "triage_level": "EMERGENCY" or "CONSULT_SOON" or "HOME_REMEDY",
      "priority_score": 3 or 2 or 1,
      "simple_explanation": "2 lines simple Hindi",
      "immediate_action": "abhi kya karo Hindi mein",
      "home_remedies": ["array of strings"] or null,
      "warning_signs": "warning in Hindi",
      "is_emergency": true or false,
      "disclaimer": "short Hindi disclaimer"
    }`,
            },
          ],
        });

        const text = message.content[0].text.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            triage_level: parsed.triage_level || FALLBACK_RESPONSE.triage_level,
            priority_score: parsed.priority_score || FALLBACK_RESPONSE.priority_score,
            simple_explanation: parsed.simple_explanation || FALLBACK_RESPONSE.simple_explanation,
            immediate_action: parsed.immediate_action || FALLBACK_RESPONSE.immediate_action,
            home_remedies: parsed.home_remedies || null,
            warning_signs: parsed.warning_signs || FALLBACK_RESPONSE.warning_signs,
            is_emergency: parsed.is_emergency || false,
            disclaimer: parsed.disclaimer || FALLBACK_RESPONSE.disclaimer,
          };
        }
      } catch (aiErr) {
        // Log the actual error but don't crash
        if (aiErr.message.includes('x-api-key')) {
           console.warn('AI Triage: API Key invalid, falling back to rule-based logic.');
        } else {
           console.error('AI Service Error:', aiErr.message);
        }
      }
    }

    // 4. Ultimate Fallback
    return { ...FALLBACK_RESPONSE };
  } catch (err) {
    console.error('Triage Logic Error:', err.message);
    return { ...FALLBACK_RESPONSE };
  }
}

module.exports = { analyzeSymptoms };
