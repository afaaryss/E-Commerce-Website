"use client"

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle2, ChevronLeft } from "lucide-react";
import { useCart, useAuth } from "@/lib/store";

export default function CartDrawer() {
  const cart = useCart();
  const { user, openLoginModal } = useAuth();
  
  const [view, setView] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [isOpen, setIsOpen] = useState(false);
  // Tambahan State loading saat memproses transaksi ke Stripe
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItems = cart.items.filter(item => item.selected);
  const totalAmount = selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const isAllSelected = cart.items.length > 0 && selectedItems.length === cart.items.length;

  // UPDATE FUNGSI CHECKOUT: Menggunakan Stripe API Gateway
  const handleProcessCheckout = async () => {
    try {
      setIsSubmitting(true);

      // Kirim daftar barang belanjaan ke endpoint API Checkout kita
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selectedItems }),
      });

      const data = await response.json();

      if (data.url) {
        // Hapus item yang dipilih dari keranjang lokal sebelum dialihkan
        cart.checkoutSelected(); 
        // Alihkan pengguna secara mulus ke portal aman Stripe
        window.location.href = data.url;
      } else {
        alert("Gagal memproses sesi pembayaran ke Stripe.");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Terjadi masalah koneksi jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setView('cart');
    }}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cart.items.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cart.items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full overflow-hidden">
        
        {/* ======================================= */}
        {/* TAMPILAN 1: DAFTAR KERANJANG UTAMA        */}
        {/* ======================================= */}
        {view === 'cart' && (
          <>
            <SheetHeader className="border-b pb-4">
              <SheetTitle>Keranjang Belanja</SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-5">
              {cart.items.length === 0 ? (
                <div className="text-center mt-20 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Keranjang kamu masih kosong.</p>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b pb-5">
                    <input 
                      type="checkbox" 
                      checked={item.selected} 
                      onChange={() => cart.toggleSelect(item.id)} 
                      className="w-5 h-5 accent-black mt-2 cursor-pointer rounded" 
                    />
                    <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-lg border bg-gray-50" />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-sm leading-tight line-clamp-2">{item.name}</h4>
                      <p className="text-sm font-bold">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Ukuran:</span>
                        <select 
                          value={item.size} 
                          onChange={(e) => cart.updateSize(item.id, e.target.value)}
                          className="text-xs border rounded p-1 font-medium bg-gray-50"
                        >
                          {['S', 'M', 'L', 'XL'].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border rounded-md h-8">
                          <button onClick={() => cart.updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-2 hover:bg-gray-100 h-full"><Minus className="h-3 w-3"/></button>
                          <span className="px-3 text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => cart.updateQuantity(item.id, item.quantity + 1)} className="px-2 hover:bg-gray-100 h-full"><Plus className="h-3 w-3"/></button>
                        </div>
                        <button onClick={() => cart.removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Footer Total */}
            {cart.items.length > 0 && (
              <div className="border-t pt-4 mt-auto">
                <div className="flex items-center justify-between mb-5">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected} 
                      onChange={(e) => cart.toggleSelectAll(e.target.checked)} 
                      className="w-4 h-4 accent-black rounded" 
                    />
                    Pilih Semua
                  </label>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total ({selectedItems.length} barang)</p>
                    <p className="text-lg font-bold">Rp {totalAmount.toLocaleString("id-ID")}</p>
                  </div>
                </div>
                
                <Button 
                  disabled={selectedItems.length === 0}
                  onClick={() => {
                    if (!user) {
                      openLoginModal(); 
                    } else {
                      setView('checkout'); 
                    }
                  }} 
                  className="w-full bg-black text-white h-14 text-lg rounded-xl font-bold"
                >
                  Checkout Sekarang
                </Button>
              </div>
            )}
          </>
        )}

        {/* ======================================= */}
        {/* TAMPILAN 2: KONFIRMASI CHECKOUT         */}
        {/* ======================================= */}
        {view === 'checkout' && (
          <>
            <SheetHeader className="border-b pb-4 flex flex-row items-center gap-2 space-y-0">
              <Button variant="ghost" size="icon" disabled={isSubmitting} onClick={() => setView('cart')} className="h-8 w-8 -ml-2 text-muted-foreground hover:text-black">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <SheetTitle>Konfirmasi Pesanan</SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-6">
              <div>
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Barang yang dibeli</h3>
                <div className="space-y-3">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                      <img src={item.image_url} alt={item.name} className="w-14 h-14 object-cover rounded-md border" />
                      <div>
                        <p className="text-sm font-bold line-clamp-1">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Ukuran: {item.size} • Qty: {item.quantity}</p>
                        <p className="text-sm font-bold mt-1">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Rincian Tagihan</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal Produk</span>
                  <span className="font-medium">Rp {totalAmount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongkos Kirim</span>
                  <span className="text-green-600 font-bold">Gratis</span>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-5 mt-auto">
              <div className="flex justify-between items-center mb-5">
                <span className="font-bold">Total Pembayaran</span>
                <span className="font-bold text-2xl text-blue-600">Rp {totalAmount.toLocaleString("id-ID")}</span>
              </div>
              
              {/* UPDATE UTAMA: Mengunci tombol saat sedang loading dialihkan ke Stripe */}
              <Button 
                disabled={isSubmitting}
                onClick={handleProcessCheckout} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg rounded-xl font-bold shadow-lg shadow-blue-200"
              >
                {isSubmitting ? "Membuka Gerbang Stripe..." : "Bayar Sekarang"}
              </Button>
            </div>
          </>
        )}

        {/* Tampilan 3 dialihkan & di-handle langsung oleh halaman eksternal Stripe Checkout */}
      </SheetContent>
    </Sheet>
  );
}