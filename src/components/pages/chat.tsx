'use client'
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {useCallback, useEffect, useRef, useState} from "react";
import {CircleCheck, Droplet, Package, Search, ShieldCheck, Sparkles, Send, Loader2} from "lucide-react"; 
import ReactMarkdown from "react-markdown";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import useChatStore from "@/stores/chatStore";
import ProductCard from "@/components/product-card";
import removeMarkdown from 'remove-markdown'; 

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
    text: string; // Teks yang akan dirender (sudah bersih dari (ID: XX) dan siap Markdown)
    // textForApi tidak lagi diperlukan di ChatMessage karena kita hanya mengirim prompt saat ini
    // dan API tidak memproses riwayat AI yang dikirim kembali
    recommendedProductIds?: number[];
    hiddenProductIdText?: string; // Menyimpan teks "Produk Cocok (ID):..." untuk span tersembunyi
}

const supabase = createClientComponentClient();

export default function Chat() {
    const [products, setProducts] = useState<Product[]>([]);
    const [userProblem, setUserProblem] = useState<string>("");
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]); // Ini hanya untuk tampilan UI

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initialChatProcessed = useRef(false);

    const initialPrompt = useChatStore((state) => state.initialPrompt);
    const clearInitialPrompt = useChatStore((state) => state.clearInitialPrompt);

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
    }, [chatHistory, isThinking]); 

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
            console.log("Fetched products successfully. Total:", typedProducts.length);
        } catch (error) {
            console.error('Error fetching products:', error instanceof Error ? error.message : error);
            setProducts([]);
        }
    }, []);

    const fetchAiRecommendations = useCallback(async (prompt: string): Promise<void> => {
        if (!prompt.trim() || isThinking) {
            if (!isThinking && !prompt.trim()) {
                setChatHistory(prev => [...prev, { role: 'ai', text: "Mohon masukkan masalah kulit Anda terlebih dahulu." }]);
            }
            return;
        }

        setIsThinking(true);
        
        const productDataForAI = products.map(product => ({
            id: product.id,
            name: product.name,
            ingredients: product.ingredients,
            price: product.price,
            features: product.features,
            img_link: product.img_link,
            shop_link: product.shop_link,
            category: product.category,
            description: product.description,
        }));

        try {
            // ----- PERBAIKAN PENTING DI SINI -----
            // Kita HANYA akan mengirim pesan user saat ini ke backend.
            // Riwayat pesan AI sebelumnya tidak dikirim lagi ke model.
            // Ini adalah kunci untuk mengatasi error "type: other".
            const messagesForApi = [{ role: 'user', content: removeMarkdown(prompt) }]; 
            
            console.log("Sending payload to API:", { messages: messagesForApi, productsData: productDataForAI });

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    messages: messagesForApi, // HANYA pesan user saat ini
                    productsData: productDataForAI 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); 
            const aiRawResponse = data.content; 

            let recommendedProductIds: number[] = [];
            let hiddenProductIdText: string = ''; 
            const productIdExtractRegex = /Produk Cocok \(ID\):\s*(.*?)(?:\n|$)/i;
            const inlineIdRegex = /\s*\(ID:\s*\d+\)/g; 

            // 1. Ekstrak ID dari baris khusus "Produk Cocok (ID):"
            const matchProductIds = aiRawResponse.match(productIdExtractRegex);
            if (matchProductIds && matchProductIds[1]) {
                const idsString = matchProductIds[1].trim();
                if (idsString.toLowerCase() !== "tidak ada produk dari database yang cocok" && idsString.toLowerCase() !== "tidak ada") {
                    recommendedProductIds = idsString.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                }
                hiddenProductIdText = matchProductIds[0]; 
            }

            // 2. Buat teks yang akan ditampilkan: Hapus baris "Produk Cocok (ID):" DAN ID inline
            let textToRender = aiRawResponse.replace(productIdExtractRegex, '').trim(); 
            textToRender = textToRender.replace(inlineIdRegex, '').trim(); 

            // 3. textForApi tidak diperlukan lagi di ChatMessage karena tidak mengirim riwayat AI
            // Namun, untuk pesan user yang masuk, kita tetap simpan text-nya dalam bentuk plaintext
            // agar konsisten jika nanti ada logic lain yang memerlukannya.

            const newAiMessage: ChatMessage = {
                role: 'ai',
                text: textToRender, // Ini adalah teks yang akan dirender
                recommendedProductIds: recommendedProductIds.length > 0 ? recommendedProductIds : undefined,
                hiddenProductIdText: hiddenProductIdText 
            };
            
            setChatHistory(prev => [...prev, newAiMessage]);
            console.log("Updated chatHistory with AI message:", newAiMessage);

        } catch (error: any) {
            console.error("Terjadi kesalahan saat berkomunikasi dengan API:", error);
            const errorMessage = `Terjadi kesalahan saat mendapatkan rekomendasi: ${error.message || "Mohon coba lagi."}`;
            setChatHistory(prev => [...prev, { role: 'ai', text: errorMessage }]); // textForApi tidak diperlukan di sini
        } finally {
            setIsThinking(false);
        }
    }, [products, isThinking]); // Hapus chatHistory dari dependency, karena kita tidak mengirimnya

    useEffect(() => {
        let isMounted = true;

        if (products.length === 0) {
            getProducts();
        } else {
            console.log("Products are already loaded. Total:", products.length);
        }

        if (initialPrompt && initialPrompt.trim() && products.length > 0 && !initialChatProcessed.current && isMounted) {
            console.log("Zustand initialPrompt detected and products loaded. Calling fetchAiRecommendations.");
            // Karena hanya prompt saat ini yang dikirim, setChatHistory langsung dengan prompt user
            setChatHistory([{ role: 'user', text: initialPrompt }]); 
            fetchAiRecommendations(initialPrompt); 
            initialChatProcessed.current = true;
            clearInitialPrompt(); 
            setUserProblem(""); 
        } else if (initialPrompt && initialPrompt.trim() && products.length === 0 && !initialChatProcessed.current && isMounted) {
            console.log("Zustand initialPrompt detected, but products not loaded yet. Waiting...");
        }

        return () => {
            isMounted = false;
        };
    }, [initialPrompt, products.length, getProducts, fetchAiRecommendations, clearInitialPrompt]); 

    const getSkincareRecommendations = useCallback(async (): Promise<void> => {
        if (!userProblem.trim()) return;
        // Tambahkan pesan user ke chat history di UI
        setChatHistory(prev => [...prev, { role: 'user', text: userProblem }]); 
        const currentProblem = userProblem;
        setUserProblem(""); 
        await fetchAiRecommendations(currentProblem);
    }, [userProblem, fetchAiRecommendations]);

    const handleSuggestedPromptClick = useCallback(async (prompt: string): Promise<void> => {
        initialChatProcessed.current = false; 
        // Tambahkan pesan saran ke chat history di UI
        setChatHistory([{ role: 'user', text: prompt }]); 
        setUserProblem(""); 
        await fetchAiRecommendations(prompt);
    }, [fetchAiRecommendations]);

    const getSkincareRecommendationsWithDirectPrompt = useCallback(async (prompt: string): Promise<void> => {
        if (!prompt.trim()) return;
        // Tambahkan pesan langsung ke chat history di UI
        setChatHistory([{ role: 'user', text: prompt }]); 
        setUserProblem(""); 
        await fetchAiRecommendations(prompt);
    }, [fetchAiRecommendations]);


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
                                            {/* Untuk user: gunakan text */}
                                            <ReactMarkdown>{message.text}</ReactMarkdown>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-start">
                                        <div className="bg-white p-3 rounded-t-xl rounded-br-xl shadow max-w-[75%] text-gray-800 break-words">
                                            {/* Untuk AI: gunakan text (sudah bersih dari ID di frontend) */}
                                            <ReactMarkdown>{message.text}</ReactMarkdown>
                                            {/* Bagian untuk menyembunyikan "Produk Cocok (ID):" */}
                                            {message.hiddenProductIdText && (
                                                <span
                                                    style={{
                                                        display: 'block', 
                                                        height: 0,
                                                        opacity: 0,
                                                        overflow: 'hidden',
                                                        lineHeight: 0, 
                                                        fontSize: 0,  
                                                    }}
                                                >
                                                    {message.hiddenProductIdText}
                                                </span>
                                            )}
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

                    {/* Input Area di bagian bawah */}
                    <div className="w-full bg-white p-4 shadow-md flex justify-center sticky bottom-0 z-10">
                        <div className="max-w-2xl w-full flex items-center gap-2">
                            <Textarea
                                placeholder="Ketik pesan Anda..."
                                disabled={isThinking} 
                                className="flex-1 h-12 resize-none p-3 border rounded-full focus:ring-blue-500 focus:border-blue-500 pr-10 overflow-hidden"
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
                                    <Loader2 className="h-5 w-5 animate-spin" /> 
                                ) : (
                                    <Send className="w-5 h-5" /> 
                                )}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}