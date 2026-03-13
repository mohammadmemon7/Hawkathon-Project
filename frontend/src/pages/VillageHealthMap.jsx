import { useState, useEffect, useContext } from 'react';
import {
  MapPin, Activity, AlertTriangle, ShieldCheck,
  TrendingUp, Users, Bug, RefreshCw, BarChart2,
  Thermometer, Wind, Droplets, Zap
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import useT from '../i18n/useT';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DISEASE_COLORS = {
  Fever:     { bg: 'bg-red-500',    light: 'bg-red-50',    text: 'text-red-600',    hex: '#ef4444' },
  Flu:       { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', hex: '#f97316' },
  Dengue:    { bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-600', hex: '#eab308' },
  Malaria:   { bg: 'bg-lime-500',   light: 'bg-lime-50',   text: 'text-lime-700',   hex: '#84cc16' },
  Diarrhea:  { bg: 'bg-teal-500',   light: 'bg-teal-50',   text: 'text-teal-700',   hex: '#14b8a6' },
  TB:        { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700', hex: '#a855f7' },
  COVID:     { bg: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-700',   hex: '#3b82f6' },
  Typhoid:   { bg: 'bg-rose-500',   light: 'bg-rose-50',   text: 'text-rose-700',   hex: '#f43f5e' },
};

const RISK_CONFIG = {
  high:   { label: 'High Risk',   color: 'text-red-700',    badge: 'bg-red-100 text-red-700 border-red-200',    cell: '#fef2f2', border: '#ef4444', glow: 'shadow-red-200' },
  medium: { label: 'Moderate',    color: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700 border-amber-200', cell: '#fffbeb', border: '#f59e0b', glow: 'shadow-amber-200' },
  low:    { label: 'Low Risk',    color: 'text-emerald-700',badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', cell: '#f0fdf4', border: '#22c55e', glow: 'shadow-emerald-100' },
};

const DISEASE_ICONS = {
  Fever: <Thermometer size={12} />,
  Flu: <Wind size={12} />,
  Dengue: <Zap size={12} />,
  Malaria: <Bug size={12} />,
  Diarrhea: <Droplets size={12} />,
  TB: <Activity size={12} />,
  COVID: <Bug size={12} />,
  Typhoid: <AlertTriangle size={12} />,
};

async function fetchJson(path) {
  const r = await fetch(`${API}${path}`);
  if (!r.ok) throw new Error('fetch failed');
  return r.json();
}

export default function VillageHealthMap() {
  const { language } = useContext(AppContext);
  const t = useT();
  const [villages, setVillages] = useState([]);
  const [trends, setTrends] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [v, t, s] = await Promise.all([
        fetchJson('/analytics/village-risk'),
        fetchJson('/analytics/disease-trend'),
        fetchJson('/analytics/summary'),
      ]);
      setVillages(v);
      setTrends(t);
      setSummary(s);
      setLastRefresh(new Date());
      if (!selected && v.length > 0) setSelected(v[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const maxTrend = trends[0]?.total_cases || 1;

  return (
    <div className="p-4 md:p-8 space-y-8 pb-32 bg-slate-50/50 min-h-screen">
      {/* ──── Title Bar ──── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-rose-600 to-orange-500 text-white rounded-[20px] flex items-center justify-center shadow-xl shadow-rose-200">
            <MapPin size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {t('villageMapTitle')}
            </h1>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              {t('villageMapSub')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastRefresh && (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {language === 'hi' ? t('updated') : t('updated')}: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={load}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-rose-600 hover:border-rose-100 flex items-center justify-center transition-all"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ──── KPI Cards ──── */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: language === 'hi' ? 'कुल मामले' : 'Total Cases', value: summary.totalCases, icon: <Activity />, color: 'from-slate-700 to-slate-900', shadow: 'shadow-slate-200' },
            { label: language === 'hi' ? 'प्रभावित गाँव' : 'Affected Villages', value: summary.villageCount, icon: <MapPin />, color: 'from-blue-600 to-indigo-700', shadow: 'shadow-blue-200' },
            { label: language === 'hi' ? 'रोग प्रकार' : 'Disease Types', value: summary.diseaseCount, icon: <Bug />, color: 'from-orange-500 to-rose-600', shadow: 'shadow-orange-200' },
            { label: language === 'hi' ? 'उच्च जोखिम क्षेत्र' : 'High Risk Zones', value: summary.highRisk, icon: <AlertTriangle />, color: 'from-red-600 to-rose-700', shadow: 'shadow-red-200' },
          ].map((k, i) => (
            <div key={i} className={`bg-gradient-to-br ${k.color} text-white rounded-[32px] p-6 shadow-xl ${k.shadow} flex flex-col gap-4`}>
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                {k.icon}
              </div>
              <div>
                <p className="text-4xl font-black tracking-tight">{k.value}</p>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-1">{k.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──── Main Layout ──── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Heatmap Grid ── */}
        <div className="xl:col-span-2 bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800">
              {language === 'hi' ? 'गाँव जोखिम ग्रिड' : 'Village Risk Grid'}
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block"></span>{language === 'hi' ? 'उच्च' : 'High'}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block"></span>{language === 'hi' ? 'मध्यम' : 'Med'}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block"></span>{language === 'hi' ? 'कम' : 'Low'}</span>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {villages.map((v) => {
                const rc = RISK_CONFIG[v.risk];
                const isSelected = selected?.village === v.village;
                const topDisease = v.diseases[0];
                const dc = DISEASE_COLORS[topDisease?.disease] || DISEASE_COLORS.Fever;
                return (
                  <button
                    key={v.village}
                    onClick={() => setSelected(v)}
                    style={{ borderColor: isSelected ? rc.border : 'transparent' }}
                    className={`text-left p-4 rounded-3xl border-2 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95 ${isSelected ? `shadow-xl ${rc.glow}` : 'border-slate-50 bg-slate-50 hover:bg-white'}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg font-black"
                        style={{ backgroundColor: isSelected ? rc.border : '#94a3b8' }}
                      >
                        {v.village[0]}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest border rounded-lg px-2 py-1 ${rc.badge}`}>
                        {v.total}
                      </span>
                    </div>
                    <p className="font-black text-slate-800 text-sm leading-tight truncate">{v.village}</p>
                    {topDisease && (
                      <div className={`flex items-center gap-1.5 mt-1.5 text-[9px] font-black uppercase ${dc.text}`}>
                        {DISEASE_ICONS[topDisease.disease]}
                        {topDisease.disease} ({topDisease.cases})
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Village Detail Panel ── */}
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
          <h2 className="text-xl font-black text-slate-800">
            {language === 'hi' ? 'गाँव विवरण' : 'Village Detail'}
          </h2>

          {selected ? (
            <>
              <div className={`p-5 rounded-3xl border-2 ${RISK_CONFIG[selected.risk].badge}`} style={{ borderColor: RISK_CONFIG[selected.risk].border }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-black text-slate-800">{selected.village}</h3>
                  <span className={`text-[9px] font-black border px-3 py-1.5 rounded-2xl uppercase tracking-widest ${RISK_CONFIG[selected.risk].badge}`}>
                    {RISK_CONFIG[selected.risk].label}
                  </span>
                </div>
                <p className={`text-3xl font-black ${RISK_CONFIG[selected.risk].color}`}>{selected.total} <span className="text-sm font-bold">total cases</span></p>
              </div>

              {/* Mini bar chart per disease */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disease Breakdown</p>
                {selected.diseases.map((d) => {
                  const dc = DISEASE_COLORS[d.disease] || DISEASE_COLORS.Fever;
                  const pct = Math.round((d.cases / selected.total) * 100);
                  return (
                    <div key={d.disease}>
                      <div className="flex justify-between mb-1">
                        <div className={`flex items-center gap-2 text-xs font-black ${dc.text}`}>
                          {DISEASE_ICONS[d.disease]}
                          {d.disease}
                        </div>
                        <span className="text-xs font-black text-slate-800">{d.cases} cases</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%`, backgroundColor: dc.hex }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selected.risk === 'high' && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-bold text-red-700">
                    {language === 'hi' ? '⚠️ आपातकालीन प्रतिक्रिया की सिफारिश। स्वास्थ्य टीम को भेजें।' : '⚠️ Emergency response recommended. Deploy health team to this zone.'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-300">
              <div className="text-center space-y-3">
                <MapPin size={48} className="mx-auto opacity-30" />
                <p className="text-xs font-black uppercase tracking-widest">Select a village</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ──── Disease Trend Bar Chart ──── */}
      <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <BarChart2 size={24} className="text-rose-600" />
          <h2 className="text-xl font-black text-slate-800">
            {language === 'hi' ? 'क्षेत्र-व्यापी रोग रुझान' : 'Region-Wide Disease Trend'}
          </h2>
        </div>

        <div className="space-y-5">
          {trends.map((row) => {
            const dc = DISEASE_COLORS[row.disease] || DISEASE_COLORS.Fever;
            const pct = Math.round((row.total_cases / maxTrend) * 100);
            return (
              <div key={row.disease} className="flex items-center gap-5">
                <div className={`w-28 flex-shrink-0 flex items-center gap-2 text-xs font-black ${dc.text}`}>
                  <span>{DISEASE_ICONS[row.disease]}</span>
                  {row.disease}
                </div>
                <div className="flex-1 h-8 bg-slate-50 rounded-2xl overflow-hidden relative">
                  <div
                    className="h-full rounded-2xl flex items-center justify-end pr-3 transition-all duration-700"
                    style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: dc.hex + 'cc' }}
                  >
                    <span className="text-[10px] font-black text-white">{row.total_cases}</span>
                  </div>
                </div>
                <span className="w-16 text-right text-xs font-black text-slate-400">{row.total_cases} cases</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──── Risk Legend ──── */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[40px] p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck size={24} className="text-emerald-400" />
          <h3 className="font-black text-lg">{language === 'hi' ? 'जोखिम स्तर व्याख्या' : 'Risk Threshold Guide'}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'High Risk Zone',   range: '≥ 40 total cases',  desc: 'Deploy emergency health team. Mass screening recommended.', color: '#ef4444' },
            { label: 'Moderate Zone',    range: '20–39 total cases',  desc: 'Increase ASHA visits. Preventive medicine distribution.', color: '#f59e0b' },
            { label: 'Low Risk Zone',    range: '< 20 total cases',   desc: 'Routine monitoring. Maintain vaccination schedules.', color: '#22c55e' },
          ].map((z) => (
            <div key={z.label} className="bg-white/10 rounded-3xl p-5 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: z.color }}></div>
                <p className="font-black text-sm">{z.label}</p>
              </div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">{z.range}</p>
              <p className="text-white/80 text-xs font-bold">{z.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
