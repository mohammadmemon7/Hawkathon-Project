import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getAllMedicines, updateMedicine } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Pill, 
  Search, 
  Package, 
  CheckCircle2, 
  XSquare, 
  Save,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  MapPin
} from 'lucide-react';

export default function MedicineAdmin() {
  const { language } = useContext(AppContext);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await getAllMedicines(1, 100);
      setMedicines(Array.isArray(res) ? res : (res.data || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, stock_count, price, available) => {
    setUpdatingId(id);
    try {
      await updateMedicine(id, {
        stock_count: parseInt(stock_count),
        price: parseFloat(price),
        available: available ? 1 : 0
      });
      // Refresh local state without full reload
      setMedicines(prev => prev.map(m => m.id === id ? { ...m, stock_count, price, available: available ? 1 : 0 } : m));
    } catch (err) {
      alert("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.pharmacy_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-200">
             <Package size={24} />
          </div>
          <div>
             <h1 className="text-2xl font-black text-gray-800">Inventory Management</h1>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Update Medicine Stock</p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search medicine or pharmacy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/40 transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((med) => (
          <InventoryCard 
            key={med.id} 
            medicine={med} 
            isUpdating={updatingId === med.id}
            onUpdate={handleUpdate} 
          />
        ))}
        {filtered.length === 0 && (
            <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
                <Search size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="font-bold text-gray-400">No medicines found matching your search</p>
            </div>
        )}
      </div>
    </div>
  );
}

function InventoryCard({ medicine, isUpdating, onUpdate }) {
  const [stock, setStock] = useState(medicine.stock_count);
  const [price, setPrice] = useState(medicine.price);
  const [available, setAvailable] = useState(medicine.available === 1);

  const hasChanges = stock !== medicine.stock_count || price !== medicine.price || (available ? 1 : 0) !== medicine.available;

  return (
    <div className={`bg-white rounded-3xl border transition-all p-6 ${hasChanges ? 'border-teal-500 shadow-xl shadow-teal-500/10' : 'border-gray-50 shadow-sm'}`}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-8">
        <div className="flex-1 flex items-center gap-4">
           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${available ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-400'}`}>
              <Pill size={24} />
           </div>
           <div>
              <h3 className="text-lg font-black text-gray-800">{medicine.name}</h3>
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                 <MapPin size={12} />
                 {medicine.pharmacy_name}
              </div>
           </div>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-6">
           <div className="space-y-1.5 min-w-[120px]">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Stock Count</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl font-black text-gray-700 outline-none focus:bg-white focus:border-teal-500 transition-all text-sm"
                />
              </div>
           </div>

           <div className="space-y-1.5 min-w-[120px]">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Price (₹)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl font-black text-gray-700 outline-none focus:bg-white focus:border-teal-500 transition-all text-sm"
                />
              </div>
           </div>

           <div className="flex items-center gap-3">
              <button 
                onClick={() => setAvailable(!available)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                    available 
                    ? 'bg-green-50 text-green-600 border-green-200' 
                    : 'bg-red-50 text-red-500 border-red-200'
                }`}
              >
                {available ? 'In Stock' : 'Out of Stock'}
              </button>

              <button 
                onClick={() => onUpdate(medicine.id, stock, price, available)}
                disabled={!hasChanges || isUpdating}
                className={`p-2.5 rounded-xl transition-all ${
                    hasChanges 
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-95' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isUpdating ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
