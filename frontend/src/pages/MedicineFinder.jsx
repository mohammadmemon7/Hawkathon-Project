import { useState, useEffect } from 'react';
import { Search, Loader2, Clock, MapPin, Pill, Info } from 'lucide-react';
import { searchMedicines, getMedicineLastUpdated } from '../services/api';

const QUICK_SEARCHES = ['Paracetamol', 'ORS', 'Amoxicillin', 'Metformin', 'Ibuprofen'];

export default function MedicineFinder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    getMedicineLastUpdated().then(res => setLastUpdated(res.last_updated)).catch(console.error);
    
    // Load last search from cache
    const cached = localStorage.getItem('sehatsetu_last_med_search');
    if (cached) {
      const { query: q, results: r } = JSON.parse(cached);
      setQuery(q);
      setResults(r);
    }
  }, []);

  const handleSearch = async (name) => {
    const term = name || query;
    if (!term.trim()) return;
    setLoading(true);
    try {
      const data = await searchMedicines(term.trim());
      setResults(data);
      localStorage.setItem('sehatsetu_last_med_search', JSON.stringify({ query: term.trim(), results: data }));
    } catch {
      // On failure, check if we have data for THIS exact query in cache
      const cached = localStorage.getItem('sehatsetu_last_med_search');
      if (cached) {
        const { query: q, results: r } = JSON.parse(cached);
        if (q.toLowerCase() === term.trim().toLowerCase()) {
           setResults(r);
           return;
        }
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleChip = (name) => {
    setQuery(name);
    handleSearch(name);
  };

  // Group by pharmacy, sorted by distance
  const grouped = results
    ? results.reduce((acc, med) => {
        const key = med.pharmacy_name;
        if (!acc[key]) acc[key] = { pharmacy: key, distance: med.distance_km, items: [] };
        acc[key].items.push(med);
        return acc;
      }, {})
    : null;

  const sortedGroups = grouped
    ? Object.values(grouped).sort((a, b) => a.distance - b.distance)
    : null;

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '...';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
             <Pill size={24} />
          </div>
          <div>
             <h1 className="text-2xl font-black text-gray-800">Dawai Dhundho</h1>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Find Medicines Near You</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl text-emerald-700 border border-emerald-100">
           <Clock size={16} />
           <span className="text-xs font-black uppercase tracking-wider">Update: {getTimeAgo(lastUpdated)}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by medicine name (e.g. Paracetamol)..."
            className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-3xl shadow-sm focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500/40 outline-none text-lg font-medium transition-all"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black transition-all hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            Search
          </button>
        </div>

        {results === null && (
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {QUICK_SEARCHES.map((name) => (
              <button
                key={name}
                onClick={() => handleChip(name)}
                className="px-6 py-2.5 rounded-full text-sm font-bold border border-gray-100 bg-white text-gray-500 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-20 animate-in fade-in zoom-in-95">
          <div className="relative">
            <Loader2 size={48} className="animate-spin text-emerald-600" />
            <div className="absolute inset-0 bg-emerald-100/20 blur-xl rounded-full animate-pulse"></div>
          </div>
          <p className="mt-6 text-sm font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">Searching near your village...</p>
        </div>
      )}

      {/* Results */}
      {!loading && results !== null && (
        results.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100 max-w-xl mx-auto">
             <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Info size={32} className="text-gray-300" />
             </div>
             <h2 className="text-xl font-black text-gray-800 mb-2">Medicine Not Found</h2>
             <p className="text-gray-400 font-medium leading-relaxed">We couldn't find this medicine nearby. Please check the spelling or try a common name.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {sortedGroups.map((group) => (
              <div key={group.pharmacy} className="space-y-4">
                <div className="flex items-center gap-2 px-4">
                    <MapPin className="text-gray-400" size={16} />
                    <h3 className="font-black text-gray-400 text-xs uppercase tracking-widest">
                    Available at {group.pharmacy} 
                    <span className="ml-2 text-emerald-600 font-black">• {group.distance} km away</span>
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map((med) => (
                    <InventoryItem key={med.id} med={med} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function InventoryItem({ med }) {
  const isAvailable = med.available === 1;
  const isLowStock = isAvailable && med.stock_count < 10;
  
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all group overflow-hidden relative">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black group-hover:bg-emerald-600 group-hover:text-white transition-all">
          <Pill size={24} />
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-gray-800 block">₹{med.price}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MRP per unit</span>
        </div>
      </div>

      <h3 className="text-lg font-black text-gray-800 mb-4">{med.name}</h3>

      <div className="space-y-3">
        {isAvailable ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span className="text-sm font-bold text-green-700">Available</span>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${isLowStock ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                Stock: {med.stock_count}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
             <XCircle size={16} className="text-red-400" />
             <span className="text-sm font-bold text-red-500">Out of Stock</span>
          </div>
        )}
      </div>

      {isAvailable && (
        <button className="w-full mt-6 py-3 bg-gray-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-2xl font-black text-sm transition-all border border-gray-100">
           Request Availability
        </button>
      )}
    </div>
  );
}

function XCircle({ size, className }) {
    return <Info size={size} className={className} />; // Fallback for XCircle
}
