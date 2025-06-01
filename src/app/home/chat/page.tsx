import {Metadata} from "next";
import Chat from "@/components/pages/chat";

export const metadata: Metadata = {
    title: 'Chat AI', // Ini akan menjadi "Chat AI | Avara AI"
    description: 'Ajukan pertanyaan tentang masalah kulit Anda dan dapatkan rekomendasi skincare personal langsung dari Avara AI bertenaga Gemini.',
    keywords: ['chat', 'AI chat', 'konsultan skincare', 'tanya AI', 'masalah kulit'],
    openGraph: {
        title: 'Avara AI - Konsultasi Skincare Personal dengan AI',
        description: 'Ajukan pertanyaan tentang masalah kulit Anda dan dapatkan rekomendasi skincare personal langsung dari Avara AI bertenaga Gemini.',
        url: 'https://avara-five.vercel.app/home/chat', // Ganti dengan domain Anda
        images: [
            {
                url: 'https://avara-five.vercel.app/img/logo-icon.svg', // Gambar spesifik untuk Chat jika ada
                width: 1200,
                height: 630,
                alt: 'Avara AI Chat Interface',
            },
        ],
    },
};
export default function ChatPage() {
    return(
        <>
            <div>
                <Chat />
            </div>
        </>
    );
}