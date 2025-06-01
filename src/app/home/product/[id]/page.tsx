// app/products/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams, useRouter } from 'next/navigation'; // Untuk App Router
import { Check } from 'lucide-react';
import {Button} from "@/components/ui/button";
import Navbar from "@/components/navbar"; // Untuk ikon centang di fitur
import Footer from '@/components/footer';

// Tipe untuk entitas produk (harus konsisten di seluruh aplikasi)
interface Product {
    id: number;
    name: string;
    ingredients: string[];
    price: number;
    features: string[];
    img_link: string | null;
    shop_link: string | null;
    created_at: string;
    category: string;
    description?: string | null;
    // Tambahkan ini jika Anda punya kolom rating dan reviews di Supabase
    rating?: number | null;
    reviews?: number | null;
}

const supabase = createClientComponentClient();

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProduct = useCallback(async () => {
        if (!productId) {
            setLoading(false);
            setError("ID produk tidak ditemukan.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: dbError } = await supabase
                .from('view_products_with_categories')
                .select('*')
                .eq('id', Number(productId))
                .single();

            if (dbError) {
                throw dbError;
            }

            if (data) {
                // Pastikan ingredients dan features di-parse jika disimpan sebagai string JSON
                const parsedProduct: Product = {
                    ...data,
                    // Pastikan rating dan reviews ada dan dikonversi jika perlu
                    rating: data.rating || null, // Asumsi rating adalah number atau null
                    reviews: data.reviews || null, // Asumsi reviews adalah number atau null
                    ingredients: typeof data.ingredients === 'string' ? JSON.parse(data.ingredients) : data.ingredients,
                    features: typeof data.features === 'string' ? JSON.parse(data.features) : data.features,
                };
                setProduct(parsedProduct);
            } else {
                setError("Produk tidak ditemukan.");
            }
        } catch (err: any) {
            console.error("Error fetching product details:", err);
            setError("Gagal memuat detail produk: " + (err.message || "Terjadi kesalahan"));
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen pt-[100px]">
                <div className="flex flex-1 justify-center items-center">
                    <p className="text-lg text-gray-600">Memuat detail produk...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col min-h-screen pt-[100px]">
                <div className="flex flex-1 flex-col justify-center items-center text-red-600">
                    <p className="text-lg">{error}</p>
                    <Button onClick={() => router.back()} className="mt-4 btn btn-primary">Kembali</Button>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col min-h-screen pt-[100px]">
                <div className="flex flex-1 justify-center items-center">
                    <p className="text-lg text-gray-600">Produk tidak tersedia.</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pt-[100px]">

            <main className="flex-1 container mx-auto px-4">
                {/* Product Overview Section */}
                <div className="bg-white shadow-lg rounded-lg p-8 mb-14 flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Product Image */}
                    {product.img_link && (
                        <div className="w-full md:w-1/3 flex justify-center items-center p-4  rounded-lg">
                            <img
                                src={product.img_link}
                                alt={product.name}
                                className="max-w-full h-auto object-contain max-h-80"
                            />
                        </div>
                    )}

                    {/* Product Details (Right Side) */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl title-font text-gray-900 mb-2">{product.name}</h1>

                        {/* Rating and Reviews (Jika ada) */}

                        <h2 className="text-xl font-bold  mb-2">{product.category}</h2> {/* Contoh tambahan category */}
                        <p className="text-gray-600 text-base mb-4 leading-relaxed">
                            {product.description || "Deskripsi produk belum tersedia."}
                        </p>

                        <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                            <a
                                href={product.shop_link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                            >
                                Beli Produk
                            </a>
                            <span className="text-2xl title-font">
                                Rp{product.price?.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                {product.features && product.features.length > 0 && (
                    <section className="bg-white shadow-lg rounded-lg p-8 mb-14">
                        <h2 className="text-4xl title-font text-gray-900 mb-8 text-center">Features</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {product.features.map((feature, index) => (
                                <div key={index} className="flex items-center text-gray-700">
                                    <Check size={18} className="text-green-500 mr-2 flex-shrink-0" />
                                    <span className={"desc"}>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Ingredients Section */}
                {product.ingredients && product.ingredients.length > 0 && (
                    <section className="bg-white shadow-lg rounded-lg p-8 mb-8">
                        <h2 className="text-4xl title-font text-gray-900 mb-8 text-center">Ingredients</h2>
                        <p className="desc leading-relaxed">
                            {/* Gabungkan ingredients menjadi satu string panjang */}
                            {product.ingredients.join(', ')}
                        </p>
                    </section>
                )}
            </main>

            <Footer /> {/* Integrasi Footer */}
        </div>
    );
}