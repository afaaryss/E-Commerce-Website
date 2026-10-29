"use client" // Wajib paling atas

import { Search, User, X, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import CartDrawer from "@/components/CartDrawer";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/store";
import { supabase } from "@/lib/supabase"; // Pastikan path ini benar

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  
  // State untuk Autentikasi
  const { user, setUser, isLoginModalOpen, closeLoginModal } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Fungsi Search bawaanmu
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);

    const params = new URLSearchParams(searchParams.toString());
    if (text) {
      params.set("q", text);
    } else {
      params.delete("q");
    }
    
    router.replace(`/?${params.toString()}`);
  };

  // Cek sesi user saat website dimuat
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [setUser]);

  // Fungsi Login Beneran dengan Google
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  // Fungsi Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
  };

  return (
    <>
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          <div className="font-bold text-xl tracking-tighter">MYSTORE</div>

          {/* --- DESKTOP SEARCH --- */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={query}
              onChange={handleSearch}
              placeholder="Cari produk impian..." 
              className="pl-10 rounded-full bg-gray-50 border-none"
            />
          </div>

          {/* --- MOBILE SEARCH & ACTIONS --- */}
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="w-full">
                <SheetHeader>
                  <SheetTitle className="text-left">Cari Produk</SheetTitle>
                </SheetHeader>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={query}
                    onChange={handleSearch}
                    autoFocus
                    placeholder="Ketik nama produk..." 
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* --- CART DRAWER --- */}
            <div id="cart-icon" className="relative flex items-center justify-center">
              <CartDrawer />
            </div>

            {/* --- ICON USER & LOGIKA PROFIL --- */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden sm:flex"
                onClick={() => user ? setIsProfileOpen(!isProfileOpen) : null}
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Popup Info Profil */}
              {isProfileOpen && user && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-10 h-10 rounded-full" />
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm truncate">{user.user_metadata.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button onClick={handleLogout} variant="destructive" className="w-full gap-2">
                    <LogOut className="h-4 w-4" /> Keluar Akun
                  </Button>
                </div>
              )}
            </div>

            {/* --- TOMBOL LOGIN VS AVATAR USER --- */}
            {!user ? (
              <Button onClick={handleGoogleLogin} className="rounded-full px-6 hidden sm:flex bg-black text-white hover:bg-zinc-800">
                Login
              </Button>
            ) : (
              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border-2 border-black overflow-hidden ml-2 shadow-sm">
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- POPUP WAJIB LOGIN GLOBALS --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-in zoom-in-95 text-center">
            <button onClick={closeLoginModal} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <User className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Login Diperlukan</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Kamu harus login terlebih dahulu untuk bisa membeli atau memasukkan barang ke keranjang.
            </p>
            <Button onClick={handleGoogleLogin} className="w-full rounded-xl bg-black hover:bg-zinc-800 text-white h-12">
              Login dengan Google
            </Button>
          </div>
        </div>
      )}
    </>
  );
}