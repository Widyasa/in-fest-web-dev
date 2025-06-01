// components/ProductCard.tsx
import React from 'react';
import Link from 'next/link';

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
    // rating?: number; // Hapus atau jadikan opsional jika ada
    // reviews?: number; // Hapus atau jadikan opsional jika ada
}

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <Link href={`/home/product/${product.id}`} passHref>
            <div className="block cursor-pointer border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
                {product.img_link && (
                    <div className="w-full h-48 mb-4 overflow-hidden rounded-md flex items-center justify-center">
                        <img
                            src={product.img_link}
                            alt={product.name}
                            className="object-contain h-full w-full"
                        />
                    </div>
                )}
                <h3 className="font-semibold mb-2 line-clamp-1 ">{product.name}</h3>
                <p className={"desc"}>{product.category} | Rp{product.price?.toLocaleString('id-ID')}</p>

                {/* Hapus bagian rating bintang ini jika ada */}
                {/* {product.rating && product.reviews && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                        <span className="text-yellow-500 mr-1">&#9733;</span> {product.rating} ({product.reviews})
                    </div>
                )} */}

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