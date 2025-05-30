// app/chat/page.tsx (atau pages/chat.tsx)
'use client'
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";
import { useState, useEffect, useRef, useCallback } from "react"; // Import useCallback
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import ProductCard from "@/components/product-card";

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

interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
    recommendedProductIds?: number[];
}

const supabase = createClientComponentClient();

// Definisi instruksi sistem di luar komponen agar tidak dibuat ulang terus-menerus
const SYSTEM_INSTRUCTION: string = `Anda adalah seorang ahli kecantikan dan skincare profesional dengan pengalaman luas dalam menangani berbagai jenis kulit dan masalah kulit. Saya akan memberikan pertanyaan atau keluhan seputar kondisi kulit saya, dan Anda akan memberikan jawaban **dalam Bahasa Indonesia** yang informatif, terpercaya, dan mudah dipahami.

Tugas Anda:
1. Identifikasi jenis dan masalah kulit berdasarkan deskripsi saya.
2. Berikan penjelasan ringkas namun jelas mengenai penyebab dan solusi yang dapat dilakukan untuk mengatasi masalah tersebut.
3. **Berikan rekomendasi ingredient utama yang paling dibutuhkan beserta alasannya (Mengapa?) dan cara penggunaan (Gunakan:).**
4. Jika relevan, sertakan contoh RUTINITAS (Pagi/Malam) berdasarkan ingredients yang direkomendasikan.
5. **Rekomendasikan produk dari Daftar Produk (format JSON) di bawah yang paling sesuai dengan kebutuhan pengguna. Saat mengevaluasi produk, perhatikan baik kolom 'ingredients' maupun 'features' (yang mungkin merupakan array string di dalam JSON).** Pastikan produk yang direkomendasikan memiliki ingredients dan kategori yang relevan.
6. Jika saya meminta produk berdasarkan ingredient tertentu (contoh: "produk yang mengandung niacinamide"), berikan produk yang cocok dari daftar.
7. Di akhir respons, berikan daftar ID produk yang direkomendasikan dalam format: **Produk Cocok (ID): [ID1], [ID2], [ID3]**. Jika tidak ada produk yang sesuai, tulis: **Produk Cocok (ID): Tidak ada**.
8. **PENTING: Selalu tambahkan disclaimer di akhir respons bahwa informasi ini adalah saran umum dan bukan pengganti konsultasi dengan dermatologis profesional.**
9. Jika pertanyaan tidak relevan dengan topik skincare atau kecantikan kulit, beri respons sopan bahwa Anda tidak bisa membantu dalam hal tersebut.

Format respons yang sangat diharapkan dari Anda (ikuti format ini untuk setiap bagian):
[Penjelasan singkat mengenai masalah atau permintaan pengguna, disertai solusi dan mengapa terjadi]
🌟 Ingredient yang Paling Kamu Butuhkan dan Alasannya
1. [Ingredient 1] – [Konsentrasi/Jenis jika relevan]
   Mengapa?: [Alasan manfaat]
   Gunakan: [Cara penggunaan]
2. [Ingredient 2] – ...
   Mengapa?: ...
   Gunakan: ...
...
✅ Rekomendasi Produk Sesuai Kebutuhanmu
🔹 [Kategori Produk]
   [Nama Produk 1 dari daftar produk]
   [Nama Produk 2 dari daftar produk]
...
🗓️ Contoh Basic Routine (Bisa Disesuaikan)
🌞 Pagi:
   [Langkah 1]
   [Langkah 2]
...
🌙 Malam:
   [Langkah 1]
   [Langkah 2]
...
📝 Tips Tambahan
   [Tips 1]
   [Tips 2]
...
Produk Cocok (ID): [ID Produk 1], [ID Produk 2], ...
[Disclaimer medis]
`;

export default function Chat() {
    const [products, setProducts] = useState<Product[]>([]);
    const [userProblem, setUserProblem] = useState<string>("");
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_AI_API_KEY });

    const scrollToBottom = useCallback(() => { // Gunakan useCallback
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isThinking, scrollToBottom]); // Tambahkan scrollToBottom ke dependencies

    const getProducts = useCallback(async (): Promise<void> => { // Gunakan useCallback
        try {
            const { data, error } = await supabase
                .from('products')
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
            console.log("Fetched products:", typedProducts);
        } catch (error) {
            console.error('Error fetching products:', error instanceof Error ? error.message : error);
        }
    }, []); // Dependencies kosong karena hanya perlu dijalankan sekali

    useEffect(() => {
        getProducts();
    }, [getProducts]); // Panggil getProducts

    const getSkincareRecommendations = useCallback(async (): Promise<void> => { // Gunakan useCallback
        if (!userProblem.trim()) {
            setChatHistory(prev => [...prev, { role: 'ai', text: "Mohon masukkan masalah kulit Anda terlebih dahulu." }]);
            return;
        }

        setIsThinking(true);
        const currentUserMessage: ChatMessage = { role: 'user', text: userProblem };
        setChatHistory(prev => [...prev, currentUserMessage]);
        setUserProblem("");

        setRecommendedProducts([]);

        // Data produk untuk AI
        const productDataForAI = products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            ingredients: JSON.stringify(product.ingredients),
            features: JSON.stringify(product.features),
            img_link: product.img_link,
            shop_link: product.shop_link,
            description: product.description,
        }));
        const productJsonString = JSON.stringify(productDataForAI, null, 2);

        // --- PEMBARUAN KRUSIAL UNTUK MEMORI CHAT ---
        // Kita akan mengirim seluruh history sebagai `contents`, dan instruksi serta data produk
        // akan disematkan di awal prompt dari pesan pengguna pertama.
        // Jika ini bukan pesan pertama, hanya kirim riwayat dan pesan pengguna baru.

        const aiHistoryFormatted = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        let currentPromptText: string;
        // Jika ini adalah pesan pertama, tambahkan instruksi sistem dan daftar produk
        if (chatHistory.length === 0) { // Atau bisa juga `aiHistoryFormatted.length === 0`
            currentPromptText = `
${SYSTEM_INSTRUCTION}

--- Daftar Produk (format JSON) ---
${productJsonString}
--- Akhir Daftar Produk ---

Masalah atau permintaan saya: ${currentUserMessage.text}
            `;
        } else {
            // Jika bukan pesan pertama, cukup kirim pertanyaan pengguna saat ini
            currentPromptText = currentUserMessage.text;
        }

        const contents = [
            ...aiHistoryFormatted,
            { role: "user", parts: [{ text: currentPromptText }] }
        ];

        try {
            const response = await ai.models.generateContent({
                model: "gemma-3n-e4b-it",
                contents: contents,
            });

            const aiRawText: string = response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0] && response.candidates[0].content.parts[0].text
                ? response.candidates[0].content.parts[0].text
                : "Tidak ada respons teks yang valid dari AI.";

            let recommendedProductIds: number[] = [];

            const productIdExtractRegex = /Produk Cocok \(ID\):\s*(.*?)(?:\n|$)/i;
            const matchProductIds = aiRawText.match(productIdExtractRegex);

            let cleanAiResponse = aiRawText;

            if (matchProductIds && matchProductIds[1]) {
                const idsString = matchProductIds[1].trim();
                if (idsString.toLowerCase() !== "tidak ada") {
                    recommendedProductIds = idsString.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                }
                cleanAiResponse = aiRawText.replace(productIdExtractRegex, '').trim();
            }

            const newAiMessage: ChatMessage = {
                role: 'ai',
                text: cleanAiResponse,
                recommendedProductIds: recommendedProductIds.length > 0 ? recommendedProductIds : undefined
            };
            setChatHistory(prev => [...prev, newAiMessage]);

            if (products.length > 0 && recommendedProductIds.length > 0) {
                const filteredById = products.filter(product => recommendedProductIds.includes(product.id));
                setRecommendedProducts(filteredById);
            } else {
                setRecommendedProducts([]);
            }

        } catch (error: any) {
            console.error("Terjadi kesalahan saat membuat konten atau memproses respons AI:", error);
            const errorMessage = `Terjadi kesalahan saat mendapatkan rekomendasi: ${error.message || "Mohon coba lagi."}`;
            setChatHistory(prev => [...prev, { role: 'ai', text: errorMessage }]);
            setRecommendedProducts([]);
        } finally {
            setIsThinking(false);
        }
    }, [products, userProblem, chatHistory, scrollToBottom]); // Tambahkan dependencies

    // ... (rest of the component remains largely the same for rendering)
    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="w-full bg-white shadow-md p-4 flex justify-center items-center">
                <h1 className="text-2xl font-bold text-gray-800">Ahli Skincare AI</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
                {chatHistory.length === 0 && (
                    <div className="flex justify-center items-center h-full text-gray-500 text-center px-4">
                        Selamat datang di Chatbot Perawatan Wajah! Ceritakan masalah kulit Anda dan saya akan bantu dengan kiat, rekomendasi produk, dan info ingredient.
                    </div>
                )}
                {chatHistory.map((message, index) => (
                    <div key={index}>
                        {message.role === 'user' ? (
                            <div className="flex justify-end">
                                <div className="bg-blue-600 text-white p-3 rounded-t-xl rounded-bl-xl shadow max-w-[75%]">
                                    <ReactMarkdown>{message.text}</ReactMarkdown>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-start">
                                <div className="bg-white p-3 rounded-t-xl rounded-br-xl shadow max-w-[75%] text-gray-800">
                                    <ReactMarkdown>{message.text}</ReactMarkdown>
                                </div>
                                {message.recommendedProductIds && message.recommendedProductIds.length > 0 && (
                                    <div className="mt-4 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {products.filter(p => message.recommendedProductIds?.includes(p.id)).map(product => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-700 p-3 rounded-t-xl rounded-br-xl shadow animate-pulse">
                            AI sedang mengetik...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="w-full bg-white p-4 shadow-md flex justify-center sticky bottom-0 z-10">
                <div className="max-w-2xl w-full flex items-center gap-2">
                    <Textarea
                        placeholder="Ketik pesan Anda..."
                        className="flex-1 h-12 resize-none p-3 border rounded-full focus:ring-blue-500 focus:border-blue-500 pr-10"
                        value={userProblem}
                        onChange={(e) => setUserProblem(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                getSkincareRecommendations();
                            }
                        }}
                    />
                    <Button
                        onClick={getSkincareRecommendations}
                        className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isThinking || !userProblem.trim()}
                    >
                        {isThinking ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}