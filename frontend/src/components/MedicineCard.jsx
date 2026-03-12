import { MapPin } from 'lucide-react';

export default function MedicineCard({ medicine }) {
  const isAvailable = medicine.available === 1;
  const isLowStock = isAvailable && medicine.stock_count < 5;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-base">{medicine.name}</h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{medicine.pharmacy_name}</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          <MapPin size={12} />
          {medicine.distance_km} km
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAvailable ? (
            <span className="text-sm font-medium text-green-600">\u2705 Available</span>
          ) : (
            <span className="text-sm font-medium text-red-600">\u274C Out of Stock</span>
          )}
          {isLowStock && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              Low Stock
            </span>
          )}
        </div>
        <span className="font-semibold" style={{ color: 'var(--primary)' }}>
          \u20B9{medicine.price}
        </span>
      </div>

      {isAvailable && (
        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
          Stock: {medicine.stock_count} units
        </p>
      )}
    </div>
  );
}
