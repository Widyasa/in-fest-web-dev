'use client'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { CircleCheck, Droplet, Package, Search, ShieldCheck, Sparkles, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
    text: string;
    recommendedProductIds?: number[];
    hiddenProductIdText?: string;
    timestamp: number;
}

const supabase = createClientComponentClient();

export default function Chat() {
    const [products, setProducts] = useState<Product[]>([]);
    const [userProblem, setUserProblem] = useState<string>("");
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

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
    }, []);

    const addMessageToHistory = useCallback((message: Omit<ChatMessage, 'timestamp'>) => {
        setChatHistory(prev => [...prev, { ...message, timestamp: Date.now() }].sort((a, b) => a.timestamp - b.timestamp));
    }, []);

    const getProducts = useCallback(async (): Promise<void> => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*');

            if (error) throw error;

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
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
    }, []);

    const fetchAiRecommendations = useCallback(async (prompt: string, latestChatHistory: ChatMessage[]): Promise<void> => {
        if (!prompt.trim() || isThinking) {
            if (!isThinking && !prompt.trim()) {
                addMessageToHistory({
                    role: 'ai',
                    text: "Mohon masukkan masalah kulit Anda terlebih dahulu."
                });
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
            const messagesForApi = latestChatHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                content: msg.role === 'user' ? 
                    removeMarkdown(msg.text) : 
                    msg.text + (msg.hiddenProductIdText || '')
            }));

            messagesForApi.push({ role: 'user', content: removeMarkdown(prompt) });

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messagesForApi,
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

            const matchProductIds = aiRawResponse.match(productIdExtractRegex);
            if (matchProductIds && matchProductIds[1]) {
                const idsString = matchProductIds[1].trim();
                if (idsString.toLowerCase() !== "tidak ada produk dari database yang cocok" && 
                    idsString.toLowerCase() !== "tidak ada") {
                    recommendedProductIds = idsString.split(',')
                        .map(id => parseInt(id.trim()))
                        .filter(id => !isNaN(id));
                }
                hiddenProductIdText = matchProductIds[0];
            }

            let textToRender = aiRawResponse
                .replace(productIdExtractRegex, '')
                .replace(inlineIdRegex, '')
                .trim();

            addMessageToHistory({
                role: 'ai',
                text: textToRender,
                recommendedProductIds: recommendedProductIds.length > 0 ? recommendedProductIds : undefined,
                hiddenProductIdText
            });

        } catch (error: any) {
            console.error("Error communicating with API:", error);
            addMessageToHistory({
                role: 'ai',
                text: `Terjadi kesalahan saat mendapatkan rekomendasi: ${error.message || "Mohon coba lagi."}`
            });
        } finally {
            setIsThinking(false);
        }
    }, [products, isThinking, addMessageToHistory]);

    useEffect(() => {
        let isMounted = true;

        if (products.length === 0) {
            getProducts();
        }

        if (initialPrompt?.trim() && products.length > 0 && !initialChatProcessed.current && isMounted) {
            const firstUserMessage: ChatMessage = {
                role: 'user',
                text: initialPrompt,
                timestamp: Date.now()
            };
            
            setChatHistory(prev => {
                const updatedHistory = [...prev, firstUserMessage];
                fetchAiRecommendations(initialPrompt, updatedHistory);
                return updatedHistory;
            });
            
            initialChatProcessed.current = true;
            clearInitialPrompt();
            setUserProblem("");
        }

        scrollToBottom();

        return () => {
            isMounted = false;
        };
    }, [initialPrompt, products.length, getProducts, fetchAiRecommendations, clearInitialPrompt, scrollToBottom]);

    const handleUserMessage = useCallback(async (prompt: string): Promise<void> => {
        if (!prompt.trim()) return;

        const newUserMessage: ChatMessage = {
            role: 'user',
            text: prompt,
            timestamp: Date.now()
        };

        setChatHistory(prev => {
            const updatedHistory = [...prev, newUserMessage];
            fetchAiRecommendations(prompt, updatedHistory);
            return updatedHistory;
        });

        setUserProblem("");
    }, [fetchAiRecommendations]);

    const handleSuggestedPromptClick = useCallback((prompt: string): void => {
        initialChatProcessed.current = false;
        handleUserMessage(prompt);
    }, [handleUserMessage]);

    return (
        <div className="flex flex-col min-h-screen h-full bg-gray-100 pt-[100px]">
            {chatHistory.length === 0 ? (
                <main className="flex flex-col items-center flex-1 justify-center p-4">
                    <div className="w-full max-w-3xl mx-auto flex flex-col items-center pt-8 pb-16">
                        <div className="text-center mt-12 mb-8">
                            <h1 className="text-3xl title-font font-medium mb-2 text-gray-800">Avara AI by Gemini</h1>
                            <p className="desc text-gray-600">
                                Ceritakan masalah kulitmu atau hasil perawatan yang kamu inginkan
                            </p>
                        </div>

                        <div className="relative w-full max-w-md">
                            <div className="flex items-center bg-white rounded-full border border-gray-200 px-4 py-2 shadow-sm">
                                <input
                                    type="text"
                                    placeholder="Saya Merasa Kulit Saya Kering..."
                                    className="flex-1 outline-none text-sm p-1"
                                    value={userProblem}
                                    onChange={(e) => setUserProblem(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleUserMessage(userProblem);
                                        }
                                    }}
                                />
                                <button
                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                    onClick={() => handleUserMessage(userProblem)}
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

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
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
                        {chatHistory.map((message, index) => (
                            <div key={`${message.timestamp}-${index}`}>
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
                                            {message.hiddenProductIdText && (
                                                <span className="hidden">{message.hiddenProductIdText}</span>
                                            )}
                                        </div>
                                        {message.recommendedProductIds?.length > 0 && (
                                            <div className="mt-4 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {products
                                                    .filter(p => message.recommendedProductIds?.includes(p.id))
                                                    .map(product => (
                                                        <ProductCard key={product.id} product={product} />
                                                    ))
                                                }
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
                                disabled={isThinking}
                                className="flex-1 h-12 resize-none p-3 border rounded-full focus:ring-blue-500 focus:border-blue-500 pr-10 overflow-hidden"
                                value={userProblem}
                                onChange={(e) => setUserProblem(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleUserMessage(userProblem);
                                    }
                                }}
                            />
                            <Button
                                onClick={() => handleUserMessage(userProblem)}
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