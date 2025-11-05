import { Plane } from "lucide-react";

export default function ClerkLogo() {
  return (
    <div className="flex items-center justify-center">
      {/* Jet icon logo only - no text */}
      <div className="relative flex-shrink-0 w-[60px] h-[60px]">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red-500 to-brand-red-600 rounded-xl shadow-lg flex items-center justify-center">
          <Plane className="text-white w-8 h-8" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-gold-500 rounded-full border-2 border-white"></div>
      </div>
    </div>
  );
}
