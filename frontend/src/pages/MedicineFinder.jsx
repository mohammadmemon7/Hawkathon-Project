import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchMedicines } from '../services/api';
import MedicineCard from '../components/MedicineCard';

const QUICK_SEARCHES = ['Paracetamol', 'ORS', 'Amoxicillin', 'Metformin', 'Ibuprofen'];

export default function MedicineFinder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (name) => {
    const term = name || query;
    if (!term.trim()) return;
    setLoading(true);
    try {
      const data = await searchMedicines(term.trim());
      setResults(data);
    } catch {
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

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 px-4 py-6">
      <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--primary)' }}>
        Dawai Dhundho \uD83D\uDC8A
      </h1>

      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Dawai ka naam likhein..."
          className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="px-4 rounded-xl text-white"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Search size={20} />
        </button>
      </div>

      {/* Quick Chips (before search) */}
      {results === null && (
        <div className="mb-6">
          <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>Jaldi dhundhein:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map((name) => (
              <button
                key={name}
                onClick={() => handleChip(name)}
                className="px-3 py-1.5 rounded-full text-sm border hover:bg-teal-50 transition-colors"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-12">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>Dhundh rahe hain...</p>
        </div>
      )}

      {/* Results */}
      {!loading && results !== null && (
        results.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: 'var(--muted)' }}>Yeh dawai nahi mili — doosri spelling try karein</p>
          </div>
        ) : (
          <div>
            {sortedGroups.map((group) => (
              <div key={group.pharmacy} className="mb-5">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  {group.pharmacy}
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-gray-100" style={{ color: 'var(--muted)' }}>
                    {group.distance} km
                  </span>
                </h3>
                {group.items.map((med) => (
                  <MedicineCard key={med.id} medicine={med} />
                ))}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
