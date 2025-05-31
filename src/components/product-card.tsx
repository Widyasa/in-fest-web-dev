// components/ProductCard.tsx
import React from 'react';
import Link from 'next/link'; // Untuk navigasi di Next.js

// Tipe yang sama dengan Product di atas
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

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        // Link wrapper agar seluruh card bisa di-klik
        <Link href={`/products/${product.id}`} passHref>
            <div className="block cursor-pointer border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
                {product.img_link && (
                    <div className="w-full h-48 mb-4 overflow-hidden rounded-md flex items-center justify-center bg-gray-100">
                        <img
                            src={product.img_link}
                            alt={product.name}
                            className="object-contain h-full w-full"
                        />
                    </div>
                )}
                <h3 className="font-bold text-lg mb-2 text-gray-900">{product.name}</h3>
                <p className="text-md font-semibold text-green-700 mb-2">
                    Harga: Rp{product.price?.toLocaleString('id-ID')}
                </p>

                {product.ingredients && product.ingredients.length > 0 && (
                    <p className="text-sm text-gray-700 mb-1">
                        **Kandungan Utama:** {product.ingredients.slice(0, 2).join(', ')}{product.ingredients.length > 2 ? '...' : ''}
                    </p>
                )}

                {product.features && product.features.length > 0 && (
                    <p className="text-sm text-gray-700 mb-1">
                        **Fitur:** {product.features.slice(0, 2).join(', ')}{product.features.length > 2 ? '...' : ''}
                    </p>
                )}

                {/* Deskripsi singkat jika ada, dipotong agar tidak terlalu panjang di card */}
                {product.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {product.description}
                    </p>
                )}
                <div className="mt-auto pt-2 text-blue-600 text-sm font-medium">
                    Lihat Detail &rarr;
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;