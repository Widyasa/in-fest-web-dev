import ChatSection from "@/components/section/chat";
import HeroSection from "@/components/section/hero";
import ProblemSection from "@/components/section/problem";
import SolutionSection from "@/components/section/solution";
import FooterSection from "@/components/footer";
import CtaSection from "@/components/section/cta";
import {Metadata} from "next";
import TestimonialsSection from "@/components/section/testimony";



export const metadata: Metadata = {
    title: 'Home', // Ini akan menjadi "Home | Avara AI" karena template di layout.tsx
    description: 'Mulai perjalanan kulit sehat Anda dengan Avara AI. Dapatkan rekomendasi produk, kiat perawatan, dan analisis ingredient yang dipersonalisasi.',
    keywords: ['home', 'beranda', 'skincare AI', 'mulai perawatan'],
    openGraph: {
        title: 'Avara AI - Mulai Perjalanan Kulit Sehat Anda',
        description: 'Mulai perjalanan kulit sehat Anda dengan Avara AI. Dapatkan rekomendasi produk, kiat perawatan, dan analisis ingredient yang dipersonalisasi.',
        url: 'https://avara-five.vercel.app/', // Ganti dengan domain Anda
        images: [
            {
                url: 'https://avara-five.vercel.app/img/logo-icon.svg', // Gambar spesifik untuk Home jika ada
                width: 1200,
                height: 630,
                alt: 'Avara AI Home Page',
            },
        ],
    },
};

export default function Home() {

    return(
        <>
            <div className="pt-[80px]">
                <HeroSection />
                <ProblemSection />
                <SolutionSection />
                <ChatSection />
                <TestimonialsSection />
                <CtaSection />
                <FooterSection />
            </div>
        </>
    );
}