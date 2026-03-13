import { useState, useEffect, useRef, useContext } from 'react';
import {
  MessageSquare, Send, Phone, Signal, Battery, Wifi,
  AlertTriangle, ShieldAlert, CheckCircle2, Info,
  Smartphone, ChevronRight, RefreshCw
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const URGENCY_STYLES = {
  EMERGENCY: {
    bubble: 'bg-red-600 text-white',
    badge:  'bg-red-100 text-red-700 border-red-200',
    icon:   <ShieldAlert size={14} className="text-red-600" />,
    label:  '🚨 EMERGENCY',
  },
  HIGH: {
    bubble: 'bg-amber-500 text-white',
    badge:  'bg-amber-100 text-amber-700 border-amber-200',
    icon:   <AlertTriangle size={14} className="text-amber-600" />,
    label:  '⚠️ Seek care today',
  },
  MEDIUM: {
    bubble: 'bg-blue-600 text-white',
    badge:  'bg-blue-100 text-blue-700 border-blue-200',
    icon:   <Info size={14} className="text-blue-600" />,
    label:  'ℹ️ Monitor closely',
  },
  LOW: {
    bubble: 'bg-emerald-600 text-white',
    badge:  'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon:   <CheckCircle2 size={14} className="text-emerald-600" />,
    label:  '✅ Home care advised',
  },
};

const DEMO_EXAMPLES = [
  { label: 'Fever + Cough', text: 'FEVER COUGH', hi: 'बुखार खांसी' },
  { label: 'Dengue Signs',   text: 'FEVER RASH JOINT PAIN', hi: 'बुखार चकत्ते' },
  { label: 'Diarrhea',       text: 'LOOSE MOTION VOMITING', hi: 'दस्त उल्टी' },
  { label: 'Chest Pain',     text: 'CHEST PAIN BREATHLESS', hi: 'छाती दर्द' },
  { label: 'Pregnant',       text: 'PREGNANT 6 MONTHS', hi: 'गर्भवती' },
  { label: 'Snake Bite',     text: 'SNAKE BITE HELP', hi: 'सांप काटा' },
];

async function fetchTriage(message, lang) {
  const r = await fetch(`${API}/sms/receive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: '+91-DEMO', message, lang }),
  });
  return r.json();
}

export default function SmsSimulator() {
  const { language } = useContext(AppContext);
  const [messages, setMessages] = useState([
    {
      type: 'system',
      text: language === 'hi'
        ? '📱 SehatSetu SMS सेवा से जुड़ें। अपने लक्षण अंग्रेजी या हिंदी में लिखें।'
        : '📱 Connected to SehatSetu SMS Health Service.\nType your symptoms (e.g. FEVER COUGH) and receive free medical guidance.',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;

    setMessages(prev => [...prev, { type: 'sent', text: msg }]);
    setInput('');
    setLoading(true);

    // Simulate SMS network delay
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));

    try {
      const data = await fetchTriage(msg, language);
      setMessages(prev => [...prev, {
        type: 'received',
        text: data.reply,
        urgency: data.urgency,
        helpline: data.helpline,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        type: 'received',
        text: 'Service unavailable. Please call 104 for health advice.',
        urgency: 'LOW',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      type: 'system',
      text: language === 'hi'
        ? '📱 SehatSetu SMS सेवा से जुड़ें।'
        : '📱 New session started. Type your symptoms below.',
    }]);
  };

  const t = {
    title:     language === 'hi' ? 'SMS टेलीहेल्थ सेवा' : 'SMS Telehealth Service',
    subtitle:  language === 'hi' ? 'बिना इंटरनेट, बिना ऐप — सिर्फ SMS' : 'No internet. No app. Just SMS.',
    chipTitle: language === 'hi' ? 'जल्दी भेजें' : 'Quick send',
    inputPH:   language === 'hi' ? 'लक्षण लिखें (जैसे: FEVER COUGH)...' : 'Type symptoms (e.g. FEVER COUGH)...',
    howTitle:  language === 'hi' ? 'यह कैसे काम करता है?' : 'How It Works',
  };

  return (
    <div className="p-4 md:p-8 space-y-8 pb-32">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-teal-600 text-white rounded-[20px] flex items-center justify-center shadow-xl shadow-green-200">
            <MessageSquare size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t.title}</h1>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">SMS Gateway</span>
          <span className="text-xs font-black text-green-600">● LIVE DEMO</span>
        </div>
      </div>

      {/* ── Quick Example Chips ── */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.chipTitle}</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => send(ex.text)}
              disabled={loading}
              className="px-4 py-2 rounded-full bg-white border border-slate-100 text-xs font-black text-slate-500 hover:border-green-500 hover:text-green-700 transition-all shadow-sm active:scale-95 disabled:opacity-40"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Phone Frame ── */}
      <div className="max-w-md mx-auto">
        <div className="bg-slate-900 rounded-[48px] p-3 shadow-2xl shadow-slate-900/30 border-4 border-slate-800">
          
          {/* Status Bar */}
          <div className="flex items-center justify-between px-5 py-2">
            <span className="text-white text-[10px] font-black">9:41 AM</span>
            <div className="flex items-center gap-2 text-white">
              <Signal size={12} />
              <Wifi size={12} />
              <Battery size={12} />
            </div>
          </div>

          {/* Chat Header */}
          <div className="bg-green-600 mx-0 rounded-t-3xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Smartphone size={20} className="text-white" />
              </div>
              <div>
                <p className="font-black text-white text-sm">SehatSetu</p>
                <p className="text-green-100 text-[10px] font-bold">SMS Health • +91-180000-SEHAT</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-white/70" />
              <button onClick={clearChat} className="p-1 rounded-full hover:bg-white/20 transition-all">
                <RefreshCw size={16} className="text-white/70" />
              </button>
            </div>
          </div>

          {/* Message Area */}
          <div className="bg-[#e5ddd5] rounded-b-3xl min-h-[400px] max-h-[480px] overflow-y-auto px-4 py-5 space-y-4 flex flex-col"
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'sent' ? 'justify-end' : msg.type === 'system' ? 'justify-center' : 'justify-start'}`}>
                {msg.type === 'system' && (
                  <p className="text-[10px] font-bold text-slate-500 bg-white/60 rounded-2xl px-4 py-2 text-center max-w-xs">{msg.text}</p>
                )}
                {msg.type === 'sent' && (
                  <div className="max-w-[75%] bg-green-100 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                    <p className="text-sm font-bold text-slate-800">{msg.text}</p>
                    <p className="text-[9px] text-slate-400 text-right mt-1 flex items-center justify-end gap-1">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <CheckCircle2 size={10} className="text-blue-500" />
                    </p>
                  </div>
                )}
                {msg.type === 'received' && (
                  <div className="max-w-[80%] space-y-2">
                    {msg.urgency && (
                      <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest border rounded-lg px-2.5 py-1 w-fit ${URGENCY_STYLES[msg.urgency]?.badge}`}>
                        {URGENCY_STYLES[msg.urgency]?.icon}
                        {URGENCY_STYLES[msg.urgency]?.label}
                      </div>
                    )}
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-line">{msg.text}</p>
                      {msg.helpline && (
                        <p className="text-[9px] font-black text-slate-400 mt-2 border-t border-slate-100 pt-2">
                          📞 {msg.helpline}
                        </p>
                      )}
                      <p className="text-[9px] text-slate-300 text-right mt-1">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Row */}
          <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-b-[44px]">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={t.inputPH}
              className="flex-1 bg-white rounded-full px-5 py-3 text-sm font-bold outline-none text-slate-700 placeholder:text-slate-300"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-40 hover:bg-green-600"
            >
              <Send size={18} className="text-white ml-0.5" />
            </button>
          </div>
        </div>

        {/* Below phone label */}
        <div className="flex items-center justify-center gap-3 mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          SehatSetu Demo Gateway — No real SMS sent
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="max-w-3xl mx-auto bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
        <h2 className="text-xl font-black text-slate-800">{t.howTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', icon: '📲', title: 'Send SMS', desc: 'Patient texts symptoms to SehatSetu shortcode. Works on any phone — no internet, no app.' },
            { step: '2', icon: '🤖', title: 'AI Triage', desc: 'Our engine matches keywords and flags urgency level: Emergency, High, Medium, or Low.' },
            { step: '3', icon: '💬', title: 'Instant Reply', desc: 'Patient receives guidance within seconds: medicine, home care, or "Go to hospital NOW".' },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="w-10 h-10 flex-shrink-0 bg-green-50 rounded-2xl flex items-center justify-center text-green-700 font-black text-lg">
                {item.step}
              </div>
              <div>
                <p className="font-black text-slate-800 text-sm">{item.icon} {item.title}</p>
                <p className="text-xs font-bold text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Urgency legend */}
        <div className="pt-6 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(URGENCY_STYLES).map(([key, val]) => (
            <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${val.badge}`}>
              {val.icon}
              {key}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
