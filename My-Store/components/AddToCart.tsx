"use client"

// ---> TAMBAHAN: Jangan lupa import useEffect
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, X, CheckCircle2 } from "lucide-react";
import { useCart, useAuth } from "@/lib/store";

export default function AddToCart({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  
  const addItem = useCart((state) => state.addItem);
  const { user, openLoginModal } = useAuth(); 

  // ---> TAMBAHAN: Deteksi klik 'Back' di browser untuk mereset loading <---
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // Jika halaman dipanggil dari cache browser (user klik tombol kembali)
      if (event.persisted) {
        setIsLoadingCheckout(false);
        setIsCheckoutOpen(false); // Tutup modal supaya layarnya gak stuck
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);
  // -------------------------------------------------------------------------

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!user) {
      openLoginModal();
      return; 
    }

    addItem({
      originalId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: quantity,
      size: selectedSize,
    });
    
    const button = e.currentTarget;
    const cartIcon = document.getElementById("cart-icon");

    if (button && cartIcon) {
      const btnRect = button.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      const flyingDot = document.createElement("div");
      flyingDot.style.position = "fixed";
      flyingDot.style.left = `${btnRect.left + btnRect.width / 2}px`;
      flyingDot.style.top = `${btnRect.top + btnRect.height / 2}px`;
      flyingDot.style.width = "20px";
      flyingDot.style.height = "20px";
      flyingDot.style.backgroundColor = "#2563eb"; 
      flyingDot.style.borderRadius = "50%";
      flyingDot.style.zIndex = "9999";
      flyingDot.style.pointerEvents = "none";
      flyingDot.style.transition = "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
      
      document.body.appendChild(flyingDot);

      requestAnimationFrame(() => {
        flyingDot.style.left = `${cartRect.left + cartRect.width / 2}px`;
        flyingDot.style.top = `${cartRect.top + cartRect.height / 2}px`;
        flyingDot.style.transform = "scale(0.1)";
        flyingDot.style.opacity = "0.2";
      });

      setTimeout(() => {
        document.body.removeChild(flyingDot);
      }, 800);
    }
  };

  const handleBuyNowClick = () => {
    if (!user) {
      openLoginModal();
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setIsLoadingCheckout(true);
      
      const payload = {
        items: [{
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: quantity,
          size: selectedSize
        }]
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Gagal memproses pembayaran ke Stripe: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Pilih Ukuran</label>
        <div className="flex gap-3">
          {['S', 'M', 'L', 'XL'].map((size) => (
            <button 
              key={size} 
              onClick={() => setSelectedSize(size)}
              className={`w-12 h-12 rounded-md border-2 flex items-center justify-center font-medium transition-all ${
                selectedSize === size 
                  ? 'border-black bg-black text-white' 
                  : 'hover:border-black'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t">
        <div className="flex items-center gap-4 mb-4">
           <div className="flex items-center border rounded-full px-4 py-2">
             <button onClick={handleDecrease} className="p-1 hover:text-blue-600"><Minus className="h-4 w-4" /></button>
             <span className="px-4 font-bold">{quantity}</span>
             <button onClick={handleIncrease} className="p-1 hover:text-blue-600"><Plus className="h-4 w-4" /></button>
           </div>
           <p className="text-sm text-muted-foreground">Stok tersedia: {product.stock || 12}</p>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleBuyNowClick} 
            className="flex-[2] h-14 rounded-full bg-black hover:bg-zinc-800 text-lg font-semibold"
          >
            Beli Sekarang
          </Button>
          
          <Button 
            onClick={handleAddToCart} 
            variant="outline" 
            className="flex-1 h-14 rounded-full border-2 border-black hover:bg-black hover:text-white transition-all"
          >
            <ShoppingCart className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => {
                setIsCheckoutOpen(false);
                setIsSuccess(false);
              }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X className="h-6 w-6" />
            </button>

            {!isSuccess ? (
              <>
                <h2 className="text-2xl font-bold mb-5">Ringkasan Checkout</h2>
                
                <div className="flex gap-4 border-b pb-5 mb-5">
                  <img src={product.image_url} alt={product.name} className="w-20 h-20 rounded-lg object-cover border" />
                  <div>
                    <h3 className="font-bold leading-tight line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Ukuran: <span className="font-bold text-black">{selectedSize}</span></p>
                    <p className="text-sm text-muted-foreground">Jumlah: <span className="font-bold text-black">{quantity}</span> pcs</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Harga Satuan</span>
                    <span>Rp {product.price.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ongkos Kirim</span>
                    <span className="text-green-600 font-bold">Gratis</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t">
                    <span>Total Tagihan</span>
                    <span>Rp {(product.price * quantity).toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleConfirmPayment} 
                  disabled={isLoadingCheckout}
                  className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg"
                >
                  {isLoadingCheckout ? "Membuka Stripe..." : "Bayar Sekarang"}
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                <CheckCircle2 className="h-20 w-20 text-green-500 animate-bounce" />
                <h2 className="text-3xl font-bold text-green-600">Berhasil!</h2>
                <p className="text-muted-foreground">
                  Pesanan kamu sedang diproses.<br/>Terima kasih telah berbelanja!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}