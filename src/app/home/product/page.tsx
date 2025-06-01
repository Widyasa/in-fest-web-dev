import type { Metadata } from 'next';
import Product from "@/components/pages/product";

export const metadata: Metadata = {
    title: 'Product', // Ini akan menjadi "Product | Avara AI"
    description: 'Jelajahi katalog produk skincare yang direkomendasikan oleh Avara AI. Temukan produk berdasarkan kategori, ingredient, dan brand.',
    keywords: ['katalog produk', 'produk skincare', 'filter produk', 'review produk', 'beli skincare'],
    openGraph: {
        title: 'Avara AI - Katalog Produk Skincare Terkurasi',
        description: 'Jelajahi katalog produk skincare yang direkomendasikan oleh Avara AI. Temukan produk berdasarkan kategori, ingredient, dan brand.',
        url: 'https://avara-five.vercel.app/home/product', // Ganti dengan domain Anda
        images: [
            {
                url: 'https://avara-five.vercel.app/img/logo-icon.svg', // Gambar spesifik untuk daftar produk
                width: 1200,
                height: 630,
                alt: 'Avara AI Product Catalog',
            },
        ],
    },
};

export default function ProductPage() {
    return(
        <>
            <Product />
        </>
    )
}