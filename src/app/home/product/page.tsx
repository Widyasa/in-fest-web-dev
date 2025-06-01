'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Search } from 'lucide-react';
import Navbar from "@/components/navbar";
import ProductCard from "@/components/product-card";
import FooterSection from "@/components/footer"; // Untuk ikon search

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
}

const supabase = createClientComponentClient();

export default function ProductPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // State untuk filter kategori
    const [searchTerm, setSearchTerm] = useState<string>(''); // State untuk search input
    const [categories, setCategories] = useState<string[]>([]); // State untuk daftar kategori unik

    // 1. Fetch Produk dan Kategori dari Supabase
    const fetchProductsAndCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('view_products_with_categories')
                .select('*');

            if (error) {
                throw error;
            }

            const typedProducts: Product[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                category: item.category,
                img_link: item.img_link,
                shop_link: item.shop_link,
                created_at: item.created_at,
                description: item.description,
                ingredients: typeof item.ingredients === 'string' ? JSON.parse(item.ingredients) : item.ingredients,
                features: typeof item.features === 'string' ? JSON.parse(item.features) : item.features,
            }));

            setProducts(typedProducts);

            // Ekstrak kategori unik
            const uniqueCategories = Array.from(new Set(typedProducts.map(p => p.category))).sort();
            setCategories(['All', ...uniqueCategories]); // Tambahkan 'All' sebagai opsi filter

        } catch (err: any) {
            console.error("Error fetching products or categories:", err);
            setError("Gagal memuat produk atau kategori: " + (err.message || "Terjadi kesalahan"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProductsAndCategories();
    }, [fetchProductsAndCategories]);

    // 2. Logika Filter dan Search
    const filteredProducts = products.filter(product => {
        // Filter berdasarkan kategori
        const categoryMatch = selectedCategory === 'All' || !selectedCategory || product.category === selectedCategory;

        // Filter berdasarkan search term (nama atau brand)
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(searchLower);
        // Jika ada kolom 'brand' di DB, tambahkan brandMatch
        // const brandMatch = product.brand.toLowerCase().includes(searchLower);

        return categoryMatch && nameMatch; // Atau categoryMatch && (nameMatch || brandMatch);
    });

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar /> {/* Integrasi Navbar */}

            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10">
                    Discover Our Products
                </h1>

                {/* Filter Kategori */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedCategory === category
                                    ? 'bg-main text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                            }`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full max-w-xl mx-auto mb-10">
                    <input
                        type="text"
                        placeholder="Find Product & Brand"
                        className="w-full p-3 pl-10 pr-4 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>

                {loading && (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-gray-600 text-lg">Memuat produk...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-600 mt-4">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && filteredProducts.length === 0 && (
                    <div className="text-center text-gray-600 mt-4">
                        <p>Tidak ada produk yang ditemukan sesuai kriteria Anda.</p>
                    </div>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </main>

            <FooterSection /> {/* Integrasi Footer */}
        </div>
    );
}