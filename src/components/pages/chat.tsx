'use client'
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useCallback, useEffect, useRef, useState} from "react";
import {CircleCheck, Droplet, Package, Search, ShieldCheck, Sparkles} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import useChatStore from "@/stores/chatStore";
import {GoogleGenAI} from "@google/genai";
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

const SYSTEM_INSTRUCTION: string = `Anda adalah seorang ahli kecantikan dan skincare profesional dengan pengalaman luas dalam menangani berbagai jenis kulit dan masalah kulit. Saya akan memberikan pertanyaan atau keluhan seputar kondisi kulit saya, dan Anda akan memberikan jawaban **dalam Bahasa Indonesia** yang informatif, terpercaya, dan mudah dipahami.

## 1. 🔒 **Topik Di Luar Skincare = Tolak**
Jika pengguna memberikan pertanyaan yang **tidak berkaitan** dengan:
- Masalah kulit (berminyak, berjerawat, sensitif, kering, kusam, dll)
- Produk perawatan kulit (cleanser, toner, serum, sunscreen, dll)
- Kecantikan (perawatan wajah, ingredient skincare, dsb)

Maka AI harus menolak secara sopan. Contoh:
> **"Maaf, saya hanya dapat membantu dengan pertanyaan seputar perawatan kulit dan kecantikan. Silakan ajukan pertanyaan yang relevan."**

**JANGAN** mencoba menjawab topik seperti teknologi, makanan, karir, hubungan, finansial, kesehatan secara umum atau lainnya.


Tugas Anda:
1.  Identifikasi jenis dan masalah kulit berdasarkan deskripsi saya.
2.  Berikan penjelasan ringkas namun jelas mengenai penyebab dan solusi yang dapat dilakukan untuk mengatasi masalah tersebut. Gunakan paragraf singkat dan **bold** pada kondisi atau penyebab utama.
3.  **Berikan rekomendasi ingredient utama yang paling dibutuhkan beserta alasannya (Mengapa?) dan cara penggunaan (Gunakan:).** Gunakan daftar dan **bold** nama ingredient.
4.  Jika relevan, sertakan contoh RUTINITAS (Pagi/Malam) berdasarkan ingredients yang direkomendasikan. Gunakan sub-heading (###) untuk 'Pagi' dan 'Malam'.
5.  **SANGAT PENTING DAN PRIORITAS UTAMA: Hanya rekomendasikan produk yang persis ADA di dalam "Daftar Produk (format JSON)" yang diberikan. Jangan PERNAH mengarang nama produk atau merek lain yang tidak ada di daftar. Gunakan nama produk dan ID produk yang persis dan sesuai dari daftar.** Jika Anda merekomendasikan sebuah produk berdasarkan namanya, pastikan ID produk tersebut benar-benar adalah ID dari produk dengan nama tersebut di Daftar Produk. Jika tidak ada produk yang cocok di database, nyatakan dengan jelas bahwa tidak ada produk yang cocok dari database dan JANGAN merekomendasikan apapun. Saat mengevaluasi produk, perhatikan baik kolom 'ingredients' maupun 'features' (yang mungkin merupakan array string di dalam JSON). Gunakan daftar bullet point untuk setiap produk.
6.  Jika saya meminta produk berdasarkan ingredient tertentu (contoh: "produk yang mengandung niacinamide"), **hanya berikan produk yang cocok dari daftar yang tersedia, tanpa menampilkan JSON produk secara langsung di respons Anda.**
7.  **SELALU DI AKHIR RESPON, berikan daftar ID produk yang direkomendasikan dalam format: Produk Cocok (ID): [ID1], [ID2], [ID3], [ID4], dll. Jika tidak ada produk yang sesuai dari database, tulis: Produk Cocok (ID): Tidak ada.**
8.  **PENTING: Selalu tambahkan disclaimer di akhir respons bahwa informasi ini adalah saran umum dan bukan pengganti konsultasi dengan dermatologis profesional.** Gunakan blockquote untuk disclaimer ini.
9.  **PRIORITAS TERTINGGI: Jika pertanyaan tidak jelas, tidak relevan, acak, atau tidak dapat diidentifikasi sebagai pertanyaan tentang skincare atau kecantikan kulit, JANGAN coba menjawab atau menebak. Beri respons singkat dan sopan bahwa Anda tidak bisa membantu dalam hal tersebut dan minta pengguna untuk mengajukan pertanyaan yang relevan. Contoh respons: "Maaf, saya hanya dapat membantu dengan pertanyaan seputar perawatan kulit dan kecantikan. Bisakah Anda mengajukan pertanyaan yang relevan?"**

**PERINGATAN KERAS: JANGAN PERNAH menyertakan atau mengulang kembali "Daftar Produk (format JSON)" atau bagian JSON produk apa pun dalam respons Anda kepada pengguna. Informasi JSON tersebut HANYA untuk Anda gunakan sebagai referensi internal untuk rekomendasi.**

Format respons yang sangat diharapkan dari Anda: Sajikan informasi dalam format yang jelas dan terstruktur. Sertakan bagian-bagian berikut jika relevan dengan pertanyaan atau masalah yang diberikan, dan gunakan Markdown untuk meningkatkan keterbacaan. **PASTIKAN TIDAK ADA DATA JSON PRODUK YANG TERCETAK DI BAGIAN RESPONS UTAMA.**

## [Judul Utama Berdasarkan Masalah Pengguna]
[Penjelasan singkat mengenai masalah atau permintaan pengguna, disertai solusi dan mengapa terjadi. **Bold** pada kata kunci penting.]

### 🌟 Ingredient yang Paling Kamu Butuhkan dan Alasannya
* **[Ingredient 1]** – [Konsentrasi/Jenis jika relevan]
    * Mengapa?: [Alasan manfaat]
    * Gunakan: [Cara penggunaan]
* **[Ingredient 2]** – ...
    * Mengapa?: ...
    * Gunakan: ...
...

### 🗓️ Contoh Basic Routine (Bisa Disesuaikan)
#### 🌞 Pagi:
* [Langkah 1]
* [Langkah 2]
...
#### 🌙 Malam:
* [Langkah 1]
* [Langkah 2]
...

### 📝 Tips Tambahan
* [Tips 1]
* [Tips 2]
...
---
--- Daftar Produk (format JSON) ---

> [Disclaimer medis]
`;

export default function Chat() {
    const [products, setProducts] = useState<Product[]>([]);
    const [userProblem, setUserProblem] = useState<string>("");
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    // `recommendedProducts` tidak lagi digunakan, jadi bisa dihapus sepenuhnya
    // const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initialChatProcessed = useRef(false);

    const initialPrompt = useChatStore((state) => state.initialPrompt);
    const clearInitialPrompt = useChatStore((state) => state.clearInitialPrompt);

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_AI_API_KEY || '' });

    const suggestedPrompts = [
        {
            id: 1, label: "Produk untuk kulit kering", icon: <Package size={16} className="mr-1" />,
        },
        {
            id: 2, label: "Produk untuk kulit berminyak", icon: <Droplet size={16} className="mr-1" />,
        },
        {
            id: 3, label: "Kulit Berjerawat", icon: <CircleCheck size={16} className="mr-1" />,
        },
        {
            id: 4, label: "Menghilangkan bekas jerawat", icon: <ShieldCheck size={16} className="mr-1" />,
        },
        {
            id: 5, label: "Mengatasi warna kulit tidak merata", icon: <Search size={16} className="mr-1" />,
        },
        {
            id: 6, label: "Produk skincare herbal", icon: <Sparkles size={16} className="mr-1" />,
        },
        {
            id: 7, label: "Rekomendasi sunscreen kulit sensitif", icon: <ShieldCheck size={16} className="mr-1" />,
        },
    ];

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isThinking, scrollToBottom]);

    const getProducts = useCallback(async (): Promise<void> => {
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
            console.log("Fetched products successfully. Total:", typedProducts.length); // LOG BARU
        } catch (error) {
            console.error('Error fetching products:', error instanceof Error ? error.message : error);
            setProducts([]);
        }
    }, []);

    const fetchAiRecommendations = useCallback(async (prompt: string, isInitialChat: boolean = false): Promise<void> => {
        if (!prompt.trim() || isThinking) {
            if (isInitialChat && !prompt.trim()) {
                console.log("Initial chat skipped: no initial question.");
                return;
            }
            if (!isThinking && !prompt.trim()) {
                setChatHistory(prev => [...prev, { role: 'ai', text: "Mohon masukkan masalah kulit Anda terlebih dahulu." }]);
            }
            return;
        }

        setIsThinking(true);
        // `userProblem` sudah di-reset di fungsi pemanggil (getSkincareRecommendations, handleSuggestedPromptClick)
        // atau dikosongkan di `handleInitialChat` jika `userProblem` sama dengan prompt.

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

        // Bangun riwayat chat lengkap untuk dikirim ke Gemini API
        const contentsToSend: Array<{ role: 'user' | 'model', parts: Array<{ text: string }> }> = [];

        // Selalu tambahkan SYSTEM_INSTRUCTION di awal percakapan yang dikirim ke AI
        contentsToSend.push({
            role: "user",
            parts: [{ text: SYSTEM_INSTRUCTION }]
        });

        // Tambahkan riwayat chat sebelumnya (dari state React)
        // Penting: Pastikan chatHistory yang digunakan di sini adalah state saat fungsi ini dipanggil.
        // Jika ada penambahan baru ke chatHistory sebelum ini yang tidak di-render ulang,
        // maka chatHistory di sini mungkin belum mencerminkan perubahan terakhir.
        // Namun, useCallback dengan chatHistory sebagai dependensi akan membantu.
        for (const message of chatHistory) {
            contentsToSend.push({
                role: message.role === 'user' ? 'user' : 'model',
                parts: [{ text: message.text || '' }]
            });
        }

        // Tambahkan prompt pengguna saat ini dan data produk ke bagian akhir riwayat yang akan dikirim
        contentsToSend.push({
            role: "user",
            parts: [{ text: `--- Daftar Produk (format JSON) ---\n${productJsonString}\n--- Akhir Daftar Produk ---\n\nMasalah atau permintaan saya: ${prompt}` }]
        });


        try {
            console.log("Sending prompt to AI:", contentsToSend);
            const response = await ai.models.generateContent({
                model: "gemma-3n-e4b-it",
                contents: contentsToSend, // Menggunakan seluruh riwayat chat yang telah dibentuk
            });
            console.log("AI response received:", response);

            let aiRawText: string = response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0] && response.candidates[0].content.parts[0].text
                ? response.candidates[0].content.parts[0].text
                : "Tidak ada respons teks yang valid dari AI.";

            // Pasca-pemrosesan untuk memotong JSON jika terdeteksi (meskipun seharusnya tidak ada)
            const jsonDelimiter = "--- Daftar Produk (format JSON) ---";
            const indexOfDelimiter = aiRawText.indexOf(jsonDelimiter);

            if (indexOfDelimiter !== -1) {
                aiRawText = aiRawText.substring(0, indexOfDelimiter).trim();
                console.warn("Detected and removed JSON delimiter from AI response.");
            }

            let recommendedProductIds: number[] = [];
            const productIdExtractRegex = /Produk Cocok \(ID\):\s*(.*?)(?:\n|$)/i;
            const matchProductIds = aiRawText.match(productIdExtractRegex);
            let cleanAiResponse = aiRawText;
            console.log("AI extracted Product IDs:", matchProductIds); // LOG PENTING
            if (matchProductIds && matchProductIds[1]) {
                const idsString = matchProductIds[1].trim();
                if (idsString.toLowerCase() !== "tidak ada produk dari database yang cocok" && idsString.toLowerCase() !== "tidak ada") {
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
            console.log("Updated chatHistory with AI message:", newAiMessage); // LOG BARU

        } catch (error: any) {
            console.error("Terjadi kesalahan saat membuat konten atau memproses respons AI:", error);
            const errorMessage = `Terjadi kesalahan saat mendapatkan rekomendasi: ${error.message || "Mohon coba lagi."}`;
            setChatHistory(prev => [...prev, { role: 'ai', text: errorMessage }]);
        } finally {
            setIsThinking(false);
            if (isInitialChat) {
                clearInitialPrompt(); // Hanya clear jika ini adalah prompt awal
            }
        }
    }, [ai, products, chatHistory, isThinking, clearInitialPrompt]);

    const handleInitialChat = useCallback(async (initialQuestion: string, currentProducts: Product[]): Promise<void> => {
        if (initialChatProcessed.current || isThinking || !initialQuestion) {
            console.log("handleInitialChat skipped: already processed, thinking, or no initial question", { initialChatProcessed: initialChatProcessed.current, isThinking, initialQuestion });
            return;
        }
        initialChatProcessed.current = true;

        // Set pesan pengguna awal di riwayat chat UI. Ini hanya terjadi sekali.
        setChatHistory([{ role: 'user', text: initialQuestion }]);
        console.log("Initial user message added to chatHistory:", initialQuestion); // LOG BARU

        // Panggil fungsi baru dengan flag isInitialChat
        await fetchAiRecommendations(initialQuestion, true);

    }, [isThinking, fetchAiRecommendations]);

    useEffect(() => {
        let isMounted = true;

        if (products.length === 0) {
            getProducts();
        } else {
            console.log("Products are already loaded. Total:", products.length); // LOG BARU
        }

        if (initialPrompt && initialPrompt.trim() && products.length > 0 && !initialChatProcessed.current && isMounted) {
            console.log("Zustand initialPrompt detected and products loaded. Calling handleInitialChat.");
            setUserProblem(initialPrompt); // Pastikan input userProblem terisi untuk tampilan
            handleInitialChat(initialPrompt, products);
        } else if (initialPrompt && initialPrompt.trim() && products.length === 0 && !initialChatProcessed.current && isMounted) {
            console.log("Zustand initialPrompt detected, but products not loaded yet. Waiting...");
        }


        return () => {
            isMounted = false;
        };
    }, [initialPrompt, products.length, getProducts, handleInitialChat, products]); // Tambahkan `products` ke dependensi jika perubahan `products` harus memicu ini

    const getSkincareRecommendations = useCallback(async (): Promise<void> => {
        if (!userProblem.trim()) return; // Validasi input
        // Tambahkan pesan pengguna ke UI. Penting: ini akan memicu render ulang chatHistory.
        // `fetchAiRecommendations` kemudian akan menggunakan chatHistory yang diperbarui ini.
        setChatHistory(prev => [...prev, { role: 'user', text: userProblem }]);
        const currentProblem = userProblem; // Simpan nilai prompt sebelum di-reset
        setUserProblem(""); // Kosongkan input
        await fetchAiRecommendations(currentProblem);
    }, [userProblem, fetchAiRecommendations]);

    const handleSuggestedPromptClick = (prompt: string) => {
        initialChatProcessed.current = false; // Reset ini agar prompt bisa diproses lagi
        setChatHistory([{ role: 'user', text: prompt }]); // Bersihkan riwayat dan tambahkan pesan saran ke UI
        setUserProblem(prompt); // Isi input agar terlihat di UI
        fetchAiRecommendations(prompt);
    };

    const getSkincareRecommendationsWithDirectPrompt = useCallback(async (prompt: string): Promise<void> => {
        if (!prompt.trim()) return; // Validasi input
        setChatHistory([{ role: 'user', text: prompt }]); // Bersihkan riwayat dan tambahkan pesan langsung ke UI
        setUserProblem(""); // Kosongkan input
        await fetchAiRecommendations(prompt);
    }, [fetchAiRecommendations]);

    // Hapus total useEffect yang terkait dengan setRecommendedProducts karena tidak digunakan
    /*
    useEffect(() => {
        const lastAiMessage = chatHistory[chatHistory.length - 1];
        if (lastAiMessage?.role === 'ai' && lastAiMessage.recommendedProductIds && lastAiMessage.recommendedProductIds.length > 0) {
            const filteredById = products.filter(product => lastAiMessage.recommendedProductIds?.includes(product.id));
            setRecommendedProducts(filteredById);
        } else {
            setRecommendedProducts([]);
        }
    }, [chatHistory, products]);
    */


    return (
        <div className="flex flex-col min-h-screen h-full bg-gray-100 pt-[100px]">

            {/* Conditional Rendering untuk UI Awal atau Chat Aktif */}
            {chatHistory.length === 0 ? (
                // UI Awal / Landing Page Style
                <main className="flex flex-col items-center flex-1 justify-center p-4">
                    <div className="w-full max-w-3xl mx-auto flex flex-col items-center pt-8 pb-16">
                        {/* Main Title Section */}
                        <div className="text-center mt-12 mb-8">
                            <h1 className="text-3xl title-font font-medium mb-2 text-gray-800">Avara AI by Gemini</h1>
                            <p className="desc text-gray-600">
                                Ceritakan masalah kulitmu atau hasil perawatan yang kamu inginkan
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full max-w-md">
                            <div className="flex items-center bg-white rounded-full border border-gray-200 px-4 py-2 shadow-sm">
                                <input
                                    type="text"
                                    placeholder="Saya Merasa Kulit Saya Kering..."
                                    className="flex-1 outline-none text-sm p-1"
                                    value={userProblem}
                                    onChange={(e) => setUserProblem(e.target.value)}
                                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                            getSkincareRecommendationsWithDirectPrompt(userProblem);
                                        }
                                    }}
                                />
                                <button
                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                    onClick={() => getSkincareRecommendationsWithDirectPrompt(userProblem)}
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Option Buttons */}
                        <div className="w-full mt-6">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {suggestedPrompts.map((option) => (
                                    <button
                                        key={option.id}
                                        className="flex items-center text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-blue-800 hover:bg-blue-50 transition-colors"
                                        onClick={() => handleSuggestedPromptClick(option.label)}
                                    >
                                        {option.icon}
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            ) : (
                // UI Chat Aktif
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
                        {chatHistory.map((message, index) => (
                            <div key={index}>
                                {message.role === 'user' ? (
                                    <div className="flex justify-end">
                                        <div className="bg-blue-600 text-white p-3 rounded-t-xl rounded-bl-xl shadow max-w-[75%] break-words">
                                            <ReactMarkdown>{message.text}</ReactMarkdown>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-start">
                                        <div className="bg-white p-3 rounded-t-xl rounded-br-xl shadow max-w-[75%] text-gray-800 break-words">
                                            <ReactMarkdown>{message.text}</ReactMarkdown>
                                        </div>
                                        {/* BAGIAN KRUSIAL UNTUK RENDERING CARD */}
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

                    {/* Input Area di bagian bawah */}
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
                </>
            )}
        </div>
    );
}