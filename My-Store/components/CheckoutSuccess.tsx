"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/store";
import { CheckCircle2, X } from "lucide-react";

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const clearCart = useCart((state) => state.clearCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Cek apakah di URL ada param checkout=success
    if (searchParams.get("checkout") === "success") {
      // 1. Kosongkan keranjang belanja
      if (clearCart) clearCart();
      
      // 2. Tampilkan Popup
      setIsOpen(true);

      // 3. Bersihkan URL tanpa me-refresh halaman/komponen Next.js
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [searchParams, clearCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center relative zoom-in-95 animate-in duration-300">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-5">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h3>
        <p className="text-gray-500 mb-8 text-sm">
          Terima kasih telah berbelanja. Pesanan kamu sedang diproses dan akan segera dikirim.
        </p>
        
        <button
          onClick={() => setIsOpen(false)}
          className="w-full bg-black text-white rounded-xl py-3.5 font-semibold hover:bg-zinc-800 transition-colors"
        >
          Lanjut Belanja
        </button>
      </div>
    </div>
  );
}