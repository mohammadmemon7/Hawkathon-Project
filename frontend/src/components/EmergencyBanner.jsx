export default function EmergencyBanner({ isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="w-full bg-red-600 text-white px-4 py-3 animate-pulse">
      <p className="text-center font-bold text-lg">
        \uD83D\uDEA8 EMERGENCY — Turant Nabha Civil Hospital jayein
      </p>
      <p className="text-center text-sm opacity-90">Phone: 01765-XXXXXX</p>
    </div>
  );
}
