import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Truck, Star } from "lucide-react";
import Link from "next/link";
import AddToCart from "@/components/AddToCart";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { data: product } = await supabase.from("products").select("*").eq("id", Number(resolvedParams.id)).single();

  if (!product) return <div className="p-20 text-center">Produk tidak ditemukan.</div>;

  return (
    <main className="max-w-6xl mx-auto py-10 px-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-black transition-colors">Katalog</Link>
        <span>/</span>
        <span className="text-black font-medium">{product.category}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-8 hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-lg border bg-gray-50 opacity-50 hover:opacity-100 cursor-pointer transition-opacity" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none">{product.category}</Badge>
            <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
              <Star className="h-4 w-4 fill-current" /> 4.9 <span className="text-muted-foreground">(120+ Review)</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">{product.name}</h1>
          <p className="text-3xl font-bold text-black mb-8">
            Rp {product.price.toLocaleString("id-ID")}
          </p>

          <div className="space-y-6">
            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-2">Informasi Produk</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* --- MEMANGGIL KOMPONEN CLIENT --- */}
            <AddToCart product={product} />

            <div className="grid grid-cols-2 gap-4 pt-8 border-t">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <Truck className="h-5 w-5 text-blue-600" />
                <span className="text-[10px] font-medium leading-tight">Pengiriman Cepat Seluruh Indonesia</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span className="text-[10px] font-medium leading-tight">Jaminan Produk Original 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}