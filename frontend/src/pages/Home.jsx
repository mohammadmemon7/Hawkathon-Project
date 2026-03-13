import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Stethoscope, Video, ClipboardList, Pill, ArrowRight, HeartPulse } from 'lucide-react';
import useT from '../i18n/useT';

export default function Home() {
  const navigate = useNavigate();
  const { currentPatient } = useContext(AppContext);
  const t = useT();

  const patientName = currentPatient?.name || 'Ramesh Kumar';

  return (
    <div className="p-6 md:p-8 space-y-8 pb-20 md:pb-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 to-[var(--primary)] text-white p-8 md:p-12 shadow-xl shadow-teal-900/10">
        <div className="absolute top-0 right-0 h-full w-1/2 md:w-1/3 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="w-full h-full text-white" stroke="currentColor" fill="none" strokeWidth="4">
            <path d="M0 100 L50 100 L75 50 L100 150 L125 75 L150 120 L175 100 L400 100 M400 120 L175 120 L150 140 L125 95 L100 170 L75 70 L50 120 L0 120" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M200 40 L220 160 L240 60 L260 140 L280 80 L300 120" strokeWidth="2" strokeOpacity="0.5" />
          </svg>
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
            <HeartPulse size={16} className="text-teal-200" />
            <span className="text-teal-50">{t('healthStatus')}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
            {t('greetingPrefix')} {patientName} {t('greetingSuffix')} <span className="inline-block animate-wave origin-bottom-right">🙏</span>
          </h1>
          <p className="text-teal-100/90 text-lg md:text-xl font-medium mb-8 max-w-xl">{t('homeSubtitle')}</p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/symptoms')}
              className="group bg-white text-[var(--primary)] px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <span>{t('checkSymptomsBtn')}</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/talk')}
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-6 py-3.5 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Video size={20} />
              <span>{t('talkToDoctorBtn')}</span>
            </button>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-400 rounded-full blur-[80px] opacity-30 pointer-events-none"></div>
        <div className="absolute -bottom-24 right-32 w-48 h-48 bg-teal-300 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
      </div>

      {/* Quick Actions Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold text-gray-800">{t('quickActions')}</h2>
        <span className="text-sm font-medium text-gray-400 hover:text-[var(--primary)] cursor-pointer transition-colors">{t('seeAll')}</span>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <button onClick={() => navigate('/symptoms')} className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all text-left flex flex-col justify-between min-h-[160px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform origin-top-right"></div>
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform shadow-sm"><Stethoscope size={24} /></div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-green-600 transition-colors">{t('symptomCheckTitle')}</h3>
            <p className="text-gray-500 text-sm font-medium">{t('symptomCheckSub')}</p>
          </div>
        </button>

        <button onClick={() => navigate('/talk')} className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all text-left flex flex-col justify-between min-h-[160px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform origin-top-right"></div>
          <div className="w-12 h-12 bg-teal-100 text-[var(--primary)] rounded-xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform shadow-sm"><Video size={24} /></div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-[var(--primary)] transition-colors">{t('talkToDoctorTitle')}</h3>
            <p className="text-gray-500 text-sm font-medium">{t('talkToDoctorSub')}</p>
          </div>
        </button>

        <button onClick={() => navigate('/records')} className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left flex flex-col justify-between min-h-[160px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform origin-top-right"></div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform shadow-sm"><ClipboardList size={24} /></div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">{t('myRecordsTitle')}</h3>
            <p className="text-gray-500 text-sm font-medium">{t('myRecordsSub')}</p>
          </div>
        </button>

        <button onClick={() => navigate('/medicines')} className="group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all text-left flex flex-col justify-between min-h-[160px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform origin-top-right"></div>
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform shadow-sm"><Pill size={24} /></div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-orange-600 transition-colors">{t('orderMedicinesTitle')}</h3>
            <p className="text-gray-500 text-sm font-medium">{t('orderMedicinesSub')}</p>
          </div>
        </button>
      </div>
    </div>
  );
}
