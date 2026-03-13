import { useState, useEffect, useContext, useMemo } from 'react';
import { 
  Search, 
  Loader2, 
  Clock, 
  MapPin, 
  Pill, 
  Info, 
  Filter, 
  ChevronRight, 
  AlertCircle,
  Truck,
  Store,
  CheckCircle,
  XCircle,
  TrendingDown,
  Navigation,
  RefreshCw,
  WifiOff,
  MessageSquare,
  X
} from 'lucide-react';
import { getMedicinePharmacies, getMedicineLastUpdated, reportMedicineFeedback } from '../services/api';
import { AppContext } from '../context/AppContext';

const QUICK_SEARCHES = ['Paracetamol', 'ORS', 'Amoxicillin', 'Metformin', 'Ibuprofen'];

export default function MedicineFinder() {
  const { lowBw, language, currentPatient } = useContext(AppContext);
  const [query, setQuery] = useState('');
  const [pharmacies, setPharmacies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  
  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [activeMed, setActiveMed] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ reported_available: 0, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Filters
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance'); 
  const [maxDistance, setMaxDistance] = useState('20');

  const t = {
    title: language === 'hi' ? 'दवाई ढूँढें' : 'Medicine Finder',
    subtitle: language === 'hi' ? 'अपने पास की दवाइयाँ खोजें' : 'Search nearby pharmacies',
    placeholder: language === 'hi' ? 'दवाई का नाम लिखें (जैसे Paracetamol)...' : 'Search medicine name...',
    searchBtn: language === 'hi' ? 'खोजें' : 'Search',
    lastUpdated: language === 'hi' ? 'अंतिम अपडेट' : 'Last Updated',
    filters: language === 'hi' ? 'फिल्टर' : 'Filters',
    available: language === 'hi' ? 'केवल उपलब्ध' : 'Available only',
    sortBy: language === 'hi' ? 'क्रम' : 'Sort by',
    distance: language === 'hi' ? 'दूरी' : 'Distance',
    price: language === 'hi' ? 'कीमत' : 'Price',
    stock: language === 'hi' ? 'स्टॉक' : 'Stock',
    radius: language === 'hi' ? 'दायरा' : 'Radius',
    noResults: language === 'hi' ? 'इस दवाई का रिजल्ट नहीं मिला' : 'No results found for this medicine',
    tryAgain: language === 'hi' ? 'अलग स्पेलिंग टाइप करके देखें' : 'Try checking the spelling or use a generic name.',
    nearest: language === 'hi' ? 'सबसे पास' : 'Nearest Pharmacy',
    fetching: language === 'hi' ? 'खोज रहे हैं...' : 'Searching your village...',
    inStock: language === 'hi' ? 'स्टॉक में है' : 'In Stock',
    outStock: language === 'hi' ? 'स्टॉक खत्म' : 'Out of Stock',
    feedbackBtn: language === 'hi' ? 'स्टॉक गलत है?' : 'Stock incorrect?',
    feedbackTitle: language === 'hi' ? 'फीडबैक दें' : 'Submit Feedback',
    feedbackAvailable: language === 'hi' ? 'दवाई उपलब्ध है' : 'Medicine is available',
    feedbackUnavailable: language === 'hi' ? 'दवाई उपलब्ध नहीं है' : 'Medicine is out of stock',
    feedbackPlaceholder: language === 'hi' ? 'कुछ और लिखना चाहते हैं?' : 'Any other comments?',
    submitFeedback: language === 'hi' ? 'सबमिट करें' : 'Submit feedback',
  };

  useEffect(() => {
    refreshLastUpdated();
    
    const cached = localStorage.getItem('sehatsetu_last_query');
    if (cached) {
      const { name, availableOnly: ao, maxDistance: md, sortBy: sb, results } = JSON.parse(cached);
      setQuery(name || '');
      setAvailableOnly(!!ao);
      setMaxDistance(md || '20');
      setSortBy(sb || 'distance');
      setPharmacies(results);
    }
  }, []);

  const refreshLastUpdated = async () => {
    try {
        const res = await getMedicineLastUpdated();
        setLastUpdated(res.last_updated);
    } catch(e) {}
  };

  const handleSearch = async (overrideName = null) => {
    const term = (overrideName !== null ? overrideName : query).trim();
    if (!term) return;

    setLoading(true);
    setIsOffline(false);
    const cacheKey = `medicineSearch:${term}:${availableOnly}:${maxDistance}:${sortBy}`;

    try {
      const params = {
        name: term,
        availableOnly: availableOnly ? '1' : '0',
        maxDistanceKm: maxDistance,
        sort: sortBy
      };
      const data = await getMedicinePharmacies(params);
      setPharmacies(data);
      
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem('sehatsetu_last_query', JSON.stringify({
          name: term,
          availableOnly,
          maxDistance,
          sortBy,
          results: data
      }));

      refreshLastUpdated();
    } catch (err) {
      console.error("Search failed:", err);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setPharmacies(JSON.parse(cached));
        setIsOffline(true);
      } else {
        setPharmacies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (name) => {
    setQuery(name);
    handleSearch(name);
  };

  const openFeedback = (med) => {
    setActiveMed(med);
    setFeedbackData({ reported_available: med.available === 1 ? 0 : 1, comment: '' });
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!activeMed) return;
    setSubmittingFeedback(true);
    try {
        await reportMedicineFeedback(activeMed.id, {
            patient_id: currentPatient?.id,
            ...feedbackData
        });
        alert(language === 'hi' ? 'आपका फीडबैक सबमिट हो गया है!' : 'Thank you for your feedback!');
        setShowFeedbackModal(false);
    } catch (err) {
        console.error("Feedback error:", err);
    } finally {
        setSubmittingFeedback(false);
    }
  };

  return (
    <div className={`p-4 md:p-8 space-y-8 pb-32 ${lowBw ? 'no-animations' : ''}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-[20px] flex items-center justify-center shadow-xl shadow-emerald-100">
             <Pill size={32} />
          </div>
          <div>
             <h1 className="text-3xl font-black text-gray-800 tracking-tight">{t.title}</h1>
             <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{t.subtitle}</p>
          </div>
        </div>

        {lastUpdated && (
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.lastUpdated}</span>
                    <span className="text-xs font-bold text-gray-700">{new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <RefreshCw 
                    size={16} 
                    className="ml-2 text-emerald-600 cursor-pointer hover:rotate-180 transition-transform" 
                    onClick={refreshLastUpdated}
                />
            </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-600 transition-colors" size={24} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t.placeholder}
            className="w-full pl-16 pr-32 py-6 bg-white border border-gray-100 rounded-[32px] shadow-sm focus:shadow-2xl focus:shadow-emerald-900/5 focus:border-emerald-500/30 outline-none text-xl font-bold text-gray-700 transition-all placeholder:text-gray-200"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="absolute right-3 top-3 bottom-3 px-8 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : t.searchBtn}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_SEARCHES.map((name) => (
            <button
              key={name}
              onClick={() => handleChipClick(name)}
              className="px-5 py-2 rounded-full text-xs font-black border border-gray-100 bg-white text-gray-400 hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center gap-2 group shadow-sm active:scale-95"
            >
              <TrendingDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Offline Banner */}
      {isOffline && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-center justify-center gap-3 text-amber-800">
              <WifiOff size={20} className="text-amber-600" />
              <p className="text-sm font-black uppercase tracking-widest">
                  {language === 'hi' ? 'ऑफलाइन - पुराना डेटा दिखाया जा रहा है' : 'Offline - Showing cached records'}
              </p>
          </div>
      )}

      {/* Filters Row */}
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-4 bg-gray-50/50 p-6 rounded-[32px] border border-white/50 border-gray-100">
        <label className="flex items-center gap-3 cursor-pointer group">
            <div 
                onClick={() => setAvailableOnly(!availableOnly)}
                className={`w-12 h-6 rounded-full p-1 transition-all ${availableOnly ? 'bg-emerald-600' : 'bg-gray-200'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full transition-all ${availableOnly ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-emerald-600">{t.available}</span>
        </label>

        <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

        <div className="flex items-center gap-3">
            <Filter size={16} className="text-gray-400" />
            <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-black text-gray-700 uppercase tracking-widest outline-none cursor-pointer hover:text-emerald-600"
            >
                <option value="distance">{t.sortBy}: {t.distance}</option>
                <option value="price">{t.sortBy}: {t.price}</option>
                <option value="stock">{t.sortBy}: {t.stock}</option>
            </select>
        </div>

        <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

        <div className="flex items-center gap-3">
            <Navigation size={16} className="text-gray-400" />
            <select 
                value={maxDistance} 
                onChange={(e) => setMaxDistance(e.target.value)}
                className="bg-transparent text-xs font-black text-gray-700 uppercase tracking-widest outline-none cursor-pointer hover:text-emerald-600"
            >
                <option value="2">{t.radius}: 2km</option>
                <option value="5">{t.radius}: 5km</option>
                <option value="10">{t.radius}: 10km</option>
                <option value="20">{t.radius}: 20km</option>
                <option value="50">{t.radius}: 50km</option>
            </select>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto space-y-10">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                    <Pill size={24} className="absolute inset-0 m-auto text-emerald-600/30" />
                </div>
                <p className="font-black text-gray-400 uppercase tracking-[0.3em] text-xs">{t.fetching}</p>
          </div>
        ) : pharmacies === null ? (
            <div className="py-20 text-center space-y-6 flex flex-col items-center">
                 <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center text-gray-200">
                    <Store size={48} />
                 </div>
                 <p className="text-gray-400 font-bold max-w-xs">{language === 'hi' ? 'दवाई का नाम ढूंढें और आपके गाँव के पास उपलब्ध फार्मेसी देखें' : 'Enter a medicine name to find pharmacies near your village.'}</p>
            </div>
        ) : pharmacies.length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-gray-100 max-w-2xl mx-auto flex flex-col items-center">
             <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mb-8">
                <AlertCircle size={40} />
             </div>
             <h2 className="text-2xl font-black text-gray-800 mb-3">{t.noResults}</h2>
             <p className="text-gray-400 font-bold max-w-sm">{t.tryAgain}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pharmacies.map((pharmacy, idx) => (
              <PharmacyCard key={idx} pharmacy={pharmacy} t={t} onFeedback={openFeedback} />
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[40px] w-full max-w-md p-8 relative shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                <button onClick={() => setShowFeedbackModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-800 transition-colors">
                    <X size={24} />
                </button>

                <div className="relative space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                            <MessageSquare size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800">{t.feedbackTitle}</h2>
                    </div>

                    <p className="text-sm font-bold text-gray-500">
                        {language === 'hi' ? `क्या ${activeMed?.name} का स्टॉक सही है?` : `Is the stock information for ${activeMed?.name} correct?`}
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                        <button 
                            onClick={() => setFeedbackData({ ...feedbackData, reported_available: 1 })}
                            className={`p-4 rounded-3xl border-2 transition-all flex items-center justify-between group ${feedbackData.reported_available === 1 ? 'border-emerald-600 bg-emerald-50' : 'border-gray-50 bg-gray-50'}`}
                        >
                            <span className={`font-black uppercase tracking-widest text-xs ${feedbackData.reported_available === 1 ? 'text-emerald-700' : 'text-gray-400'}`}>{t.feedbackAvailable}</span>
                            <CheckCircle size={20} className={feedbackData.reported_available === 1 ? 'text-emerald-600' : 'text-gray-200'} />
                        </button>
                        <button 
                            onClick={() => setFeedbackData({ ...feedbackData, reported_available: 0 })}
                            className={`p-4 rounded-3xl border-2 transition-all flex items-center justify-between group ${feedbackData.reported_available === 0 ? 'border-red-600 bg-red-50' : 'border-gray-50 bg-gray-50'}`}
                        >
                            <span className={`font-black uppercase tracking-widest text-xs ${feedbackData.reported_available === 0 ? 'text-red-700' : 'text-gray-400'}`}>{t.feedbackUnavailable}</span>
                            <XCircle size={20} className={feedbackData.reported_available === 0 ? 'text-red-600' : 'text-gray-200'} />
                        </button>
                    </div>

                    <textarea 
                        value={feedbackData.comment}
                        onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                        placeholder={t.feedbackPlaceholder}
                        className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl h-32 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 font-bold text-gray-700 transition-all"
                    />

                    <button 
                        onClick={handleSubmitFeedback}
                        disabled={submittingFeedback}
                        className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-emerald-700 active:scale-95 disabled:opacity-50 shadow-xl shadow-emerald-500/20"
                    >
                        {submittingFeedback ? <RefreshCw className="animate-spin" size={20} /> : t.submitFeedback}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function PharmacyCard({ pharmacy, t, onFeedback }) {
    return (
        <div className="bg-white rounded-[44px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all group">
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                        <Store size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">{pharmacy.pharmacy_name}</h3>
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold mt-1">
                            <MapPin size={12} className="text-emerald-500" />
                            <span>{pharmacy.village}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="px-5 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-black flex items-center gap-2 border border-emerald-100">
                        <Navigation size={14} />
                        {pharmacy.distance_km} km
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mr-2">{t.radius}</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="h-px bg-gray-50 w-full mb-6"></div>
                
                <div className="space-y-3">
                    {pharmacy.items.map((med) => (
                        <div key={med.id} className="flex flex-col p-4 bg-gray-50/50 rounded-3xl border border-transparent hover:border-emerald-100 transition-all hover:bg-white hover:shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${med.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400'}`}>
                                        <Pill size={16} />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-800 text-sm">{med.name}</p>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${med.available ? 'text-green-500' : 'text-red-400'}`}>
                                                {med.available ? t.inStock : t.outStock}
                                            </span>
                                            {med.available && (
                                                <span className="text-[9px] font-bold text-gray-400">Qty: {med.stock_count}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-gray-800 tracking-tight">₹{med.price}</p>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase">{t.price}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => onFeedback(med)}
                                className="mt-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 hover:text-emerald-800 transition-colors w-max"
                            >
                                <AlertCircle size={10} />
                                {t.feedbackBtn}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                         <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-blue-600">
                                <Truck size={12} />
                            </div>
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-purple-600">
                                <CheckCircle size={12} />
                            </div>
                         </div>
                         <p className="text-[10px] font-bold text-gray-400 max-w-[120px] leading-tight">Verified by SehatSetu Supply Network</p>
                    </div>
                    <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-emerald-600 active:scale-95 shadow-lg shadow-gray-200">
                        Select Store
                    </button>
                </div>
            </div>
        </div>
    );
}
