import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// Import komponen Toast yang baru kita pisah
import CheckoutSuccessToast from "@/components/CheckoutSuccess";

type Props = {
  searchParams: Promise<{ q?: string; checkout?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const searchQuery = params?.q || "";
  const isCheckoutSuccess = params?.checkout === "success";

  // Siapkan query builder ke Supabase
  let queryBuilder = supabase.from("products").select("*");

  // Filter berdasarkan pencarian
  if (searchQuery) {
    queryBuilder = queryBuilder.ilike("name", `%${searchQuery}%`);
  }

  // Eksekusi query
  const { data: products } = await queryBuilder;

  return (
    <main className="min-h-screen">
      {/* Jika pembayaran sukses, panggil komponen toast client di sini */}
      {isCheckoutSuccess && <CheckoutSuccessToast />}

      {/* HERO SECTION */}
      <section className="relative bg-muted py-20 px-4 overflow-hidden border-b">
        <div className="container mx-auto flex flex-col items-center text-center relative z-10">
          <Badge className="mb-4 px-3 py-1 bg-blue-600 hover:bg-blue-700">Koleksi Terbaru 2026</Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-3xl">
            Tampil Beda dengan <span className="text-blue-600 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Gaya Minimalis</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl">
            Temukan berbagai pilihan pakaian berkualitas tinggi dengan desain yang simple namun elegan.
          </p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-50 -z-10" />
      </section>

      {/* KATALOG PRODUK */}
      <section className="container mx-auto py-20 px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {searchQuery ? `Hasil pencarian untuk "${searchQuery}"` : "Katalog Produk"}
            </h2>
            <p className="text-muted-foreground text-sm italic">
              Menampilkan {products?.length || 0} produk
            </p>
          </div>
        </div>

        {/* LOGIKA JIKA TIDAK DITEMUKAN */}
        {products?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Maaf, tidak ada produk yang cocok dengan "{searchQuery}".</p>
            <Button variant="link" asChild className="mt-4">
              <Link href="/">Reset Pencarian</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products?.map((product) => (
              <Card key={product.id} className="group overflow-hidden border-none shadow-none bg-transparent">
                <Link href={`/product/${product.id}`}>
                  <div className="aspect-[3/4] relative overflow-hidden rounded-2xl bg-muted">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                    <Badge className="absolute top-4 left-4 bg-white/80 backdrop-blur text-black hover:bg-white/90">
                      {product.category}
                    </Badge>
                  </div>
                </Link>
                <div className="pt-6">
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{product.description}</p>
                  <p className="text-xl font-bold">Rp {product.price.toLocaleString("id-ID")}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}