'use client'
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useCallback, useEffect, useRef, useState} from "react";
import useChatStore from "@/stores/chatStore";
import {GoogleGenAI} from "@google/genai";
import {CircleCheck, Droplet, Package, Search, ShieldCheck, Sparkles} from "lucide-react";
import ReactMarkdown from "react-markdown";
import ProductCard from "@/components/product-card";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";

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

// ... (SYSTEM_INSTRUCTION tetap sama)
const SYSTEM_INSTRUCTION: string = `Anda adalah seorang ahli kecantikan dan skincare profesional dengan pengalaman luas dalam menangani berbagai jenis kulit dan masalah kulit. Saya akan memberikan pertanyaan atau keluhan seputar kondisi kulit saya, dan Anda akan memberikan jawaban **dalam Bahasa Indonesia** yang informatif, terpercaya, dan mudah dipahami.

**Gunakan format Markdown untuk membuat respons Anda lebih menarik dan mudah dibaca.** Sertakan:
* **Heading (##, ###)** untuk judul bagian dan sub-bagian.
* **Bold (**tebal**)** untuk penekanan pada kata kunci penting (misalnya nama ingredient, jenis kulit).
* **List (* atau -)** untuk daftar kiat, manfaat, atau produk.
* **Blockquotes (>)** untuk menyoroti tips penting atau ringkasan.

Tugas Anda:
1.  Identifikasi jenis dan masalah kulit berdasarkan deskripsi saya.
2.  Berikan penjelasan ringkas namun jelas mengenai penyebab dan solusi yang dapat dilakukan untuk mengatasi masalah tersebut. Gunakan paragraf singkat dan **bold** pada kondisi atau penyebab utama.
3.  **Berikan rekomendasi ingredient utama yang paling dibutuhkan beserta alasannya (Mengapa?) dan cara penggunaan (Gunakan:).** Gunakan daftar dan **bold** nama ingredient.
4.  Jika relevan, sertakan contoh RUTINITAS (Pagi/Malam) berdasarkan ingredients yang direkomendasikan. Gunakan sub-heading (###) untuk 'Pagi' dan 'Malam'.
5.  **Rekomendasikan produk dari Daftar Produk (format JSON) di bawah yang paling sesuai dengan kebutuhan pengguna. Saat mengevaluasi produk, perhatikan baik kolom 'ingredients' maupun 'features' (yang mungkin merupakan array string di dalam JSON).** Pastikan produk yang direkomendasikan memiliki ingredients dan kategori yang relevan. Gunakan daftar bullet point untuk setiap produk.
6.  Jika saya meminta produk berdasarkan ingredient tertentu (contoh: "produk yang mengandung niacinamide"), berikan produk yang cocok dari daftar.
7.  Di akhir respons, berikan daftar ID produk yang direkomendasikan dalam format: **Produk Cocok (ID): [ID1], [ID2], [ID3]**. Jika tidak ada produk yang sesuai, tulis: ** Tidak Ada Produk dari Database yang Cocok**.
8.  **PENTING: Selalu tambahkan disclaimer di akhir respons bahwa informasi ini adalah saran umum dan bukan pengganti konsultasi dengan dermatologis profesional.** Gunakan blockquote untuk disclaimer ini.
9.  Jika pertanyaan tidak relevan dengan topik skincare atau kecantikan kulit, beri respons sopan bahwa Anda tidak bisa membantu dalam hal tersebut.

Format respons yang sangat diharapkan dari Anda: Sajikan informasi dalam format yang jelas dan terstruktur. Sertakan bagian-bagian berikut jika relevan dengan pertanyaan atau masalah yang diberikan, dan gunakan Markdown untuk meningkatkan keterbacaan:

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

### ✅ Rekomendasi Produk Sesuai Kebutuhanmu
#### 🔹 [Kategori Produk]
* **[Nama Produk 1 dari daftar produk]**
* **[Nama Produk 2 dari daftar produk]**
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

Produk Cocok (ID): [ID Produk 1], [ID Produk 2], ...

> [Disclaimer medis]
`;


export default function Chat() {
    const [products, setProducts] = useState<Product[]>([]);
    const [userProblem, setUserProblem] = useState<string>("");
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    // const searchParams = useSearchParams(); // TIDAK LAGI DIGUNAKAN
    const initialChatProcessed = useRef(false);

    // Ambil initialPrompt dan clearInitialPrompt dari Zustand store
    const initialPrompt = useChatStore((state) => state.initialPrompt);
    const clearInitialPrompt = useChatStore((state) => state.clearInitialPrompt);


    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_AI_API_KEY });

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
            console.log("Fetched products:", typedProducts);
        } catch (error) {
            console.error('Error fetching products:', error instanceof Error ? error.message : error);
            setProducts([]);
        }
    }, []);


    // handleInitialChat sekarang dipicu oleh useEffect yang memantau `initialPrompt` dari Zustand
    const handleInitialChat = useCallback(async (initialQuestion: string, currentProducts: Product[]): Promise<void> => {
        // Guard untuk mencegah pemrosesan ulang
        if (initialChatProcessed.current || isThinking || !initialQuestion) {
            console.log("handleInitialChat skipped: already processed, thinking, or no initial question", { initialChatProcessed: initialChatProcessed.current, isThinking, initialQuestion });
            return;
        }
        initialChatProcessed.current = true; // Set flag agar tidak diproses lagi

        setIsThinking(true);
        const initialUserMessage: ChatMessage = { role: 'user', text: initialQuestion };
        setChatHistory([initialUserMessage]); // Set history awal hanya dengan pertanyaan user

        const productDataForAI = currentProducts.map(product => ({
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

        const initialPromptContent = `${SYSTEM_INSTRUCTION}\n\n--- Daftar Produk (format JSON) ---\n${productJsonString}\n--- Akhir Daftar Produk ---\n\nMasalah atau permintaan saya: ${initialQuestion}`;

        try {
            console.log("Sending initial prompt to AI:", initialPromptContent);
            const response = await ai.models.generateContent({
                model: "gemma-3n-e4b-it",
                contents: [{ role: "user", parts: [{ text: initialPromptContent }] }],
            });
            console.log("AI initial response received:", response);

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

        } catch (error: any) {
            console.error("Terjadi kesalahan saat membuat konten atau memproses respons AI (initial chat):", error);
            const errorMessage = `Terjadi kesalahan saat mendapatkan rekomendasi awal: ${error.message || "Mohon coba lagi."}`;
            setChatHistory(prev => [...prev, { role: 'ai', text: errorMessage }]);
        } finally {
            setIsThinking(false);
            clearInitialPrompt(); // PENTING: Bersihkan prompt dari Zustand setelah digunakan
        }
    }, [ai, isThinking, setChatHistory, clearInitialPrompt]);


    // EFFECT UTAMA BARU untuk memicu chat dari Zustand
    useEffect(() => {
        let isMounted = true;

        // Panggil getProducts jika belum dimuat
        if (products.length === 0) {
            getProducts();
        }

        // Hanya panggil handleInitialChat jika ada initialPrompt dari Zustand
        // dan produk sudah dimuat, serta belum diproses
        if (initialPrompt && initialPrompt.trim() && products.length > 0 && !initialChatProcessed.current && isMounted) {
            console.log("Zustand initialPrompt detected and products loaded. Calling handleInitialChat.");
            setUserProblem(initialPrompt); // Set input field dengan prompt dari Zustand
            handleInitialChat(initialPrompt, products); // Panggil handleInitialChat
        } else if (initialPrompt && initialPrompt.trim() && !initialChatProcessed.current && isMounted) {
            console.log("Zustand initialPrompt detected, but products not loaded yet. Waiting...");
            // Ini akan menunggu products.length berubah, dan kemudian useEffect akan terpanggil lagi
            // Jika products.length sudah > 0, handleInitialChat akan dipanggil.
        }


        return () => {
            isMounted = false;
        };
    }, [initialPrompt, products.length, getProducts, handleInitialChat]); // Dependencies

    // Fungsi utama untuk mendapatkan rekomendasi dari AI (untuk input regular)
    const getSkincareRecommendations = useCallback(async (): Promise<void> => {
        if (!userProblem.trim()) {
            setChatHistory(prev => [...prev, { role: 'ai', text: "Mohon masukkan masalah kulit Anda terlebih dahulu." }]);
            return;
        }

        setIsThinking(true);
        const currentUserMessage: ChatMessage = { role: 'user', text: userProblem };
        setChatHistory(prev => [...prev, currentUserMessage]);
        setUserProblem(""); // Kosongkan input setelah dikirim

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

        const aiHistoryFormatted = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        let currentPromptText: string = currentUserMessage.text;

        const contents = aiHistoryFormatted.concat({ role: "user", parts: [{ text: currentPromptText }] });

        if (chatHistory.length === 0) { // Hanya sertakan instruksi sistem dan daftar produk di turn pertama
            contents[0].parts[0].text = `${SYSTEM_INSTRUCTION}\n\n--- Daftar Produk (format JSON) ---\n${productJsonString}\n--- Akhir Daftar Produk ---\n\nMasalah atau permintaan saya: ${currentUserMessage.text}`;
        }

        try {
            console.log("Sending regular prompt to AI:", contents);
            const response = await ai.models.generateContent({
                model: "gemma-3n-e4b-it",
                contents: contents,
            });
            console.log("AI regular response received:", response);

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

        } catch (error: any) {
            console.error("Terjadi kesalahan saat membuat konten atau memproses respons AI (regular chat):", error);
            const errorMessage = `Terjadi kesalahan saat mendapatkan rekomendasi: ${error.message || "Mohon coba lagi."}`;
            setChatHistory(prev => [...prev, { role: 'ai', text: errorMessage }]);
        } finally {
            setIsThinking(false);
        }
    }, [products, userProblem, chatHistory, ai, setChatHistory, setIsThinking]);


    useEffect(() => {
        const lastAiMessage = chatHistory[chatHistory.length - 1];
        if (lastAiMessage?.role === 'ai' && lastAiMessage.recommendedProductIds && lastAiMessage.recommendedProductIds.length > 0) {
            const filteredById = products.filter(product => lastAiMessage.recommendedProductIds?.includes(product.id));
            setRecommendedProducts(filteredById);
        } else {
            setRecommendedProducts([]);
        }
    }, [chatHistory, products]);


    // Handler untuk tombol rekomendasi di UI awal
    const handleSuggestedPromptClick = (prompt: string) => {
        // Tidak perlu set userProblem karena handleInitialChat akan mengurusnya
        // atau jika userProblem sudah terisi, getSkincareRecommendationsWithDirectPrompt akan menggunakannya.
        // Langsung panggil fungsi pengiriman chat dengan prompt ini.
        // Pastikan products sudah dimuat sebelum memanggil.
        if (products.length > 0) {
            getSkincareRecommendationsWithDirectPrompt(prompt);
        } else {
            // Ini seharusnya tidak terjadi jika `getProducts` sudah dipanggil di useEffect
            // Tapi sebagai fallback, bisa menampilkan loading atau error
            console.warn("Products not loaded yet when suggested prompt clicked.");
            // Atau Anda bisa memanggil getProducts() lalu handleInitialChat dalam callbacknya
            // (akan membuat state userProblem tidak terisi duluan di Textarea)
        }
    };

    // Fungsi baru untuk memicu rekomendasi dari prompt langsung (tidak melalui URL)
    const getSkincareRecommendationsWithDirectPrompt = useCallback(async (prompt: string): Promise<void> => {
        if (!prompt.trim()) {
            setChatHistory(prev => [...prev, { role: 'ai', text: "Mohon masukkan masalah kulit Anda terlebih dahulu." }]);
            return;
        }

        setIsThinking(true);
        const currentUserMessage: ChatMessage = { role: 'user', text: prompt };
        setChatHistory(prev => [...prev, currentUserMessage]);
        setUserProblem(""); // Kosongkan input setelah dikirim

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

        const aiHistoryFormatted = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const contents = aiHistoryFormatted.concat({ role: "user", parts: [{ text: prompt }] });

        if (chatHistory.length === 0) { // Untuk turn pertama
            contents[0].parts[0].text = `${SYSTEM_INSTRUCTION}\n\n--- Daftar Produk (format JSON) ---\n${productJsonString}\n--- Akhir Daftar Produk ---\n\nMasalah atau permintaan saya: ${prompt}`;
        }

        try {
            console.log("Sending direct prompt to AI:", contents);
            const response = await ai.models.generateContent({
                model: "gemma-3n-e4b-it",
                contents: contents,
            });
            console.log("AI direct response received:", response);

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

        } catch (error: any) {
            console.error("Terjadi kesalahan saat membuat konten atau memproses respons AI (direct prompt):", error);
            const errorMessage = `Terjadi kesalahan saat mendapatkan rekomendasi: ${error.message || "Mohon coba lagi."}`;
            setChatHistory(prev => [...prev, { role: 'ai', text: errorMessage }]);
        } finally {
            setIsThinking(false);
        }
    }, [products, chatHistory, ai, setChatHistory, setIsThinking]);


    return (
        <div className="flex flex-col h-screen bg-gray-100 pt-[100px]">

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
                                    value={userProblem} // Terikat ke userProblem state
                                    onChange={(e) => setUserProblem(e.target.value)}
                                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => { // Tipe event untuk input
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
                    <div className=""></div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full">
                        <div className="container mx-auto p-4 space-y-4">
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
                                            {/* Tampilkan produk yang direkomendasikan jika ada di pesan ini */}
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