import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  CheckCircle, 
  User, 
  ChevronRight,
  ShieldCheck,
  Activity,
  UserPlus,
  WifiOff,
  ChevronLeft
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getDoctorDirectory } from '../services/api';

const SPECIALIZATIONS = [
  'General Physician',
  'Pediatrician',
  'Gynecologist',
  'Orthopedic Surgeon',
  'ENT Specialist',
  'Dermatologist',
  'Ophthalmologist',
  'General Surgeon',
  'Emergency Medical Officer',
  'Anesthetist'
];

export default function DoctorDirectory() {
  const { setSelectedDoctor, lowBw } = useContext(AppContext);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [isOffline, setIsOffline] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    availableNow: false,
    minRating: '',
    status: '',
    page: 1,
    limit: 8
  });

  const [searchInput, setSearchInput] = useState('');
  const debounceTimer = useRef(null);

  const fetchDoctors = async (currentFilters) => {
    setLoading(true);
    setIsOffline(false);
    
    // Create cache key
    const cacheKey = `sehatsetu_docs_cache_${JSON.stringify(currentFilters)}`;
    
    try {
      const res = await getDoctorDirectory(currentFilters);
      setDoctors(res.data);
      setPagination({ page: res.page, totalPages: res.totalPages });
      
      // Save to cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: res.data,
        page: res.page,
        totalPages: res.totalPages,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.warn("Directory API failed, checking cache...", err);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, page, totalPages } = JSON.parse(cached);
        setDoctors(data);
        setPagination({ page, totalPages });
        setIsOffline(true);
      } else {
        setDoctors([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
        setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [searchInput]);

  useEffect(() => {
    fetchDoctors(filters);
  }, [filters]);

  const handleSelect = (doctor) => {
    setSelectedDoctor(doctor);
    navigate('/talk');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-amber-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className={`min-h-screen ${lowBw ? 'bg-white' : 'bg-gray-50/50'} pb-24`}>
      <div className="p-6">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Doctor Directory</h1>
            <p className="text-gray-500 font-bold mt-1">Find and connect with top specialists</p>
          </div>
          {isOffline && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 font-black text-[10px] uppercase tracking-widest animate-pulse">
                <WifiOff size={14} />
                Offline - cached list
            </div>
          )}
        </header>

        {/* SEARCH & FILTERS */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search by name or specialization..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all ${
                lowBw ? 'border-2 border-gray-200' : 'bg-white shadow-sm border border-gray-100 focus:ring-4 focus:ring-purple-500/10'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <select 
              value={filters.specialization}
              onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value, page: 1 }))}
              className={`p-3 rounded-xl outline-none font-bold text-sm ${
                lowBw ? 'border border-gray-200' : 'bg-white border border-gray-100 shadow-sm'
              }`}
            >
              <option value="">All Specializations</option>
              {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              value={filters.minRating}
              onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value, page: 1 }))}
              className={`p-3 rounded-xl outline-none font-bold text-sm ${
                lowBw ? 'border border-gray-200' : 'bg-white border border-gray-100 shadow-sm'
              }`}
            >
              <option value="">Any Rating</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>

            <div className={`p-3 rounded-xl flex items-center gap-3 ${
                lowBw ? 'border border-gray-200' : 'bg-white border border-gray-100 shadow-sm'
            }`}>
                <input 
                    type="checkbox" 
                    id="availableNow"
                    checked={filters.availableNow}
                    onChange={(e) => setFilters(prev => ({ ...prev, availableNow: e.target.checked, page: 1 }))}
                    className="w-5 h-5 accent-purple-600"
                />
                <label htmlFor="availableNow" className="text-sm font-bold text-gray-700 cursor-pointer">Available Now</label>
            </div>

            <div className="flex gap-2">
                {['online', 'busy', 'offline'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilters(prev => ({ ...prev, status: prev.status === s ? '' : s, page: 1 }))}
                        className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            filters.status === s 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'bg-white text-gray-500 border-gray-200 shadow-sm'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>
          </div>
        </div>

        {/* RESULTS */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Finding Doctors...</p>
            </div>
        ) : doctors.length === 0 ? (
            <div className="text-center py-20 px-8 bg-white rounded-[40px] border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <User size={40} />
                </div>
                <h3 className="text-xl font-black text-gray-800">No Doctors Found</h3>
                <p className="text-gray-500 font-bold mt-2">Try adjusting your filters or search terms.</p>
                <button 
                  onClick={() => {
                    setSearchInput('');
                    setFilters({ search: '', specialization: '', availableNow: false, minRating: '', status: '', page: 1, limit: 8 });
                  }}
                  className="mt-6 px-8 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all"
                >
                  Reset Filters
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doctor => (
                    <div 
                        key={doctor.id}
                        className={`p-6 rounded-[40px] border transition-all group ${
                            lowBw ? 'bg-white border-gray-200' : 'bg-white border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-900/5'
                        }`}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-purple-600 font-black text-2xl ${
                                        lowBw ? 'bg-gray-100' : 'bg-purple-50'
                                    }`}>
                                        {doctor.name.split(' ').pop()[0]}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${getStatusColor(doctor.status)}`}></div>
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-800 text-lg leading-tight">{doctor.name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                                        <ShieldCheck size={14} className="text-purple-400" />
                                        {doctor.specialization}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className={`p-4 rounded-3xl ${lowBw ? 'bg-gray-50' : 'bg-gray-50/50'}`}>
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <Clock size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Experience</span>
                                </div>
                                <p className="font-black text-gray-800">{doctor.experience_years} Years</p>
                            </div>
                            <div className={`p-4 rounded-3xl ${lowBw ? 'bg-gray-50' : 'bg-gray-50/50'}`}>
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Rating</span>
                                </div>
                                <p className="font-black text-gray-800">{doctor.rating} / 5.0</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleSelect(doctor)}
                            className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 ${
                                doctor.status === 'online' && doctor.available
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                            <UserPlus size={18} />
                            Select Doctor
                            <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                    </div>
                ))}
            </div>
        )}

        {/* PAGINATION */}
        {!loading && pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
                <button 
                    disabled={filters.page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="p-4 bg-white rounded-2xl border border-gray-100 text-gray-600 disabled:opacity-30 shadow-sm hover:bg-gray-50 transition-all"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                    {[...Array(pagination.totalPages)].map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                            className={`w-12 h-12 rounded-2xl font-black transition-all ${
                                filters.page === i + 1 
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
                                : 'bg-white text-gray-400 border border-gray-100'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <button 
                    disabled={filters.page === pagination.totalPages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="p-4 bg-white rounded-2xl border border-gray-100 text-gray-600 disabled:opacity-30 shadow-sm hover:bg-gray-50 transition-all"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
