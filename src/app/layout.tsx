import type { Metadata } from "next";
import { Gloock } from "next/font/google"; 
import { Poppins } from "next/font/google"; 
import "./globals.css";

const gloock = Gloock({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-gloock',
});
const poppins = Poppins({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-poppins',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://avara.vercel.app'), // Ganti dengan domain Anda
    title: {
        default: 'Avara AI - Asisten Skincare Bertenaga AI',
        template: '%s | Avara AI', // Ini akan menjadi template untuk judul halaman spesifik
    },
    description: 'Avara AI adalah asisten skincare bertenaga Gemini AI yang memberikan rekomendasi produk personal, kiat perawatan wajah, dan analisis ingredients.',
    keywords: ['skincare', 'perawatan wajah', 'AI skincare', 'rekomendasi produk', 'ingredients', 'kulit sehat', 'chatbot skincare', 'Gemini AI'],
    authors: [{ name: 'Avara Team' }], // Ganti dengan nama tim/perusahaan Anda
    creator: 'Avara Team',
    publisher: 'Avara',
    openGraph: {
        title: 'Avara AI - Asisten Skincare Bertenaga AI',
        description: 'Avara AI adalah asisten skincare bertenaga Gemini AI yang memberikan rekomendasi produk personal, kiat perawatan wajah, dan analisis ingredients.',
        url: 'https://avara.vercel.app', // Ganti dengan domain Anda
        siteName: 'Avara AI',
        images: [
            {
                url: 'https://avara.vercel.app/img/logo-icon.svg', // Ganti dengan URL gambar OG Anda (misal logo atau hero image)
                width: 1200,
                height: 630,
                alt: 'Avara AI Skincare Assistant',
            },
        ],
        locale: 'id_ID', // Lokalisasi Bahasa Indonesia
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Avara AI - Asisten Skincare Bertenaga AI',
        description: 'Avara AI adalah asisten skincare bertenaga Gemini AI yang memberikan rekomendasi produk personal, kiat perawatan wajah, dan analisis ingredients.',
        images: ['https://avara.vercel.app/img/logo-icon.svg'], // Ganti dengan URL gambar OG Anda
        creator: '@weedyisay', // Ganti dengan Twitter handle Anda jika ada
    },
    // robots: {
    //   index: true,
    //   follow: true,
    //   googleBot: {
    //     index: true,
    //     follow: true,
    //     'noimageindex': true,
    //     '@type': 'WebPage',
    //   },
    // },
    // viewport: 'width=device-width, initial-scale=1, maximum-scale=1', // Sudah default di Next.js
};

export default function RootLayout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${gloock.variable} ${poppins.variable} antialiased overflow-x-hidden`}
        >
        {children}
        </body>
        </html>
    );
}