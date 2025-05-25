'use client'
import {Button} from "@/src/components/ui/button";
import {GoogleGenAI} from "@google/genai";
import {useState, useEffect} from "react";
import {createClientComponentClient} from '@supabase/auth-helpers-nextjs';
import {Textarea} from "@/src/components/ui/textarea";

export default function Home() {
    const [aiResponseText, setAiResponseText] = useState("");
    const [products, setProducts] = useState([]);
    const [userProblem, setUserProblem] = useState("");
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [isThinking, setIsThinking] = useState(false);

    const ai = new GoogleGenAI({apiKey: process.env.NEXT_PUBLIC_AI_API_KEY});
    const supabase = createClientComponentClient();

    async function getProducts() {
        try {
            const {data, error} = await supabase
                .from('products')
                .select('*');

            if (error) throw error;
            setProducts(data);
            console.log("Fetched products:", data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    useEffect(() => {
        getProducts();
    }, []);

    async function getSkincareRecommendations() {
        if (!userProblem) {
            setAiResponseText("Mohon masukkan masalah kulit Anda terlebih dahulu.");
            return;
        }

        setIsThinking(true);
        setAiResponseText("Menganalisis masalah kulit Anda dan mencari rekomendasi bahan aktif...");
        setRecommendedProducts([]); // Kosongkan rekomendasi sebelumnya

        // Data produk untuk AI (tetap sama, karena AI masih perlu 'melihat' data ini)
        const productDataForAI = products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            ingredients: product.ingredients_idn || product.ingredients_en,
            features: product.features_idn || product.features_en,
        }));
        const productJsonString = JSON.stringify(productDataForAI, null, 2);

        // --- Perubahan Penting di Sini: Prompt yang Diperbarui ---
        const prompt = `Anda adalah seorang ahli skincare profesional dan berpengalaman. Saya akan memberikan masalah kulit yang saya hadapi, dan Anda akan memberikan respons dalam Bahasa Indonesia.

        Tugas Anda:
        1.  Identifikasi masalah kulit dari prompt saya.
        2.  Berikan solusi dan penjelasan singkat mengenai masalah tersebut.
        3.  Rekomendasikan minimal 3 **bahan aktif (ingredients)** skincare yang paling cocok untuk mengatasi masalah tersebut. Sebutkan nama bahan aktifnya dan juga manfaat dari bahan aktif tersebut, pisahkan dengan koma (contoh: Salicylic Acid: berguna untuk ..., Niacinamide: berguna untuk..., Hyaluronic Acid: berguna untuk...).
        4.  Berdasarkan daftar produk di bawah ini, **tentukan produk mana yang paling cocok berdasarkan kecocokan bahan aktif dan juga kategori produk jika disebutkan dalam prompt** (contoh: jika user menyebut ingin rekomendasi 'tabir surya', maka pilih hanya produk dengan kategori 'tabir surya' yang cocok dengan masalah kulitnya).
        5.  Di akhir respons, berikan daftar ID produk yang cocok ini dalam format berikut: "Produk Cocok (ID): [ID1], [ID2], [ID3]". Hanya berikan ID produk yang ada dalam daftar. Jika tidak ada produk yang cocok, berikan "Produk Cocok (ID): Tidak ada".
        6.  Jika topik pertanyaan melenceng dari masalah kulit atau skincare, berikan jawaban bahwa Anda tidak dapat memberikan solusi.
        
        --- Daftar Produk (format JSON) ---
        ${productJsonString}
        --- Akhir Daftar Produk ---
        
        Masalah kulit saya: ${userProblem}
        
        **Contoh format respons yang diharapkan dari Anda:**
        Masalah Kulit: [Masalah Kulit Anda]
        Solusi: [Penjelasan Singkat Solusi]
        Bahan Aktif: [Bahan Aktif 1], [Bahan Aktif 2], [Bahan Aktif 3]
        Manfaatnya: [Manfaat Bahan Aktif 1], [Manfaat Bahan Aktif 2], [Manfaat Bahan Aktif 3]
        Produk Cocok (ID): [ID Produk 1], [ID Produk 2], [ID Produk 3]
        `;


        try {
            const response = await ai.models.generateContent({
                model: "gemma-3n-e4b-it",
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            });

            const aiRawText = response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0] && response.candidates[0].content.parts[0].text
                ? response.candidates[0].content.parts[0].text
                : "Tidak ada respons teks yang valid dari AI.";
            // setAiResponseText(aiRawText); // Jangan set langsung, kita akan memecahnya
            console.log("AI Raw Response:", aiRawText);

            let recommendedIngredients = [];
            let recommendedProductIds = [];

            // --- Logika Ekstraksi ID Produk dan Pemisahan Teks Respons ---
            const productIdExtractRegex = /Produk Cocok \(ID\):\s*(.*?)(?:\n|$)/i;
            const matchProductIds = aiRawText.match(productIdExtractRegex);

            let cleanAiResponse = aiRawText; // Teks AI tanpa bagian rekomendasi ID

            if (matchProductIds && matchProductIds[1]) {
                const idsString = matchProductIds[1].trim();
                if (idsString.toLowerCase() !== "tidak ada") {
                    recommendedProductIds = idsString.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                }
                // Hapus bagian "Produk Cocok (ID): ..." dari teks respons utama
                cleanAiResponse = aiRawText.replace(productIdExtractRegex, '').trim();
            }
            setAiResponseText(cleanAiResponse); // Set teks respons yang sudah bersih

            // Ekstraksi Bahan Aktif (tetap sama)
            const ingredientListRegex = /(?:Bahan Aktif):\s*(.*?)(?:\n|$)/i;
            let matchIngredients = cleanAiResponse.match(ingredientListRegex); // Gunakan cleanAiResponse

            if (matchIngredients && matchIngredients[1]) {
                recommendedIngredients = matchIngredients[1].split(',').map(item => item.trim().toLowerCase());
            } else {
                const keywords = [
                    'salicylic acid', 'hyaluronic acid', 'niacinamide', 'retinol',
                    'vitamin c', 'tea tree oil', 'ceramides', 'glycolic acid',
                    'lactic acid', 'azelaic acid', 'panthenol', 'squalane',
                    'peptide', 'zinc', 'green tea', 'aloe vera', 'centella asiatica'
                ];
                recommendedIngredients = keywords.filter(keyword => cleanAiResponse.toLowerCase().includes(keyword));
            }
            console.log("Extracted Recommended Ingredients:", recommendedIngredients);
            console.log("Extracted Recommended Product IDs from AI:", recommendedProductIds);

            // Filter produk berdasarkan ID yang direkomendasikan oleh AI (Prioritas Utama)
            if (products.length > 0 && recommendedProductIds.length > 0) {
                const filteredById = products.filter(product => recommendedProductIds.includes(product.id));
                setRecommendedProducts(filteredById);
                console.log("Filtered Products by AI's Recommended IDs:", filteredById);
            }
                // Fallback: Jika AI tidak memberikan ID produk atau ID tidak valid,
            // kita bisa filter berdasarkan bahan aktif seperti sebelumnya.
            else if (products.length > 0 && recommendedIngredients.length > 0) {
                const filteredByIngredient = products.filter(product => {
                    let productIngredientsText = '';

                    const getParsedIngredientsText = (ingredientsData) => {
                        if (ingredientsData) {
                            try {
                                const parsed = typeof ingredientsData === 'string' ? JSON.parse(ingredientsData) : ingredientsData;
                                if (Array.isArray(parsed)) {
                                    return parsed.join(', ');
                                }
                            } catch (e) {
                                console.warn("Error parsing ingredients (treating as string):", e, ingredientsData);
                            }
                        }
                        return String(ingredientsData || '');
                    };

                    productIngredientsText = getParsedIngredientsText(product.ingredients_idn) || getParsedIngredientsText(product.ingredients_en);

                    if (!productIngredientsText) {
                        return false;
                    }

                    const productIngredientsLower = productIngredientsText.toLowerCase();
                    return recommendedIngredients.some(ing => productIngredientsLower.includes(ing));
                });
                setRecommendedProducts(filteredByIngredient);
                console.log("Filtered Products by Ingredients (fallback):", filteredByIngredient);
            } else {
                console.warn("Tidak ada produk untuk difilter atau tidak ada bahan/ID spesifik yang diekstrak dari respons AI.");
                setRecommendedProducts([]);
            }

        } catch (error) {
            console.error("Terjadi kesalahan saat membuat konten atau memproses respons AI:", error);
            setAiResponseText("Terjadi kesalahan saat mendapatkan rekomendasi. Mohon coba lagi.");
            setRecommendedProducts([]);
        } finally {
            setIsThinking(false);
        }
    }

    return (
        <div className="flex flex-col gap-4 justify-center items-center p-4">
            <h1 className="text-2xl font-bold mb-4">Ahli Skincare AI</h1>
            <Textarea
                placeholder="Ceritakan masalah kulit Anda di sini (misalnya: 'Saya punya jerawat di dahi dan kulit saya berminyak', atau 'Kulit saya kering dan kusam, saya butuh pelembap')."
                className="max-w-2xl w-full h-32"
                value={userProblem}
                onChange={(e) => setUserProblem(e.target.value)}
            />
            <Button
                onClick={getSkincareRecommendations}
                className="w-fit"
                disabled={isThinking}
            >
                {isThinking ? '🤔 AI sedang berpikir...' : 'Dapatkan Rekomendasi'}
            </Button>

            {/* Tampilkan respons AI utama */}
            {aiResponseText && (
                <div className="mt-4 w-full max-w-2xl p-4 border rounded-lg bg-gray-50">
                    <h2 className="font-bold text-lg mb-2">Respons AI:</h2>
                    <p className="whitespace-pre-wrap text-justify">{aiResponseText}</p>
                </div>
            )}

            {/* Tampilkan produk yang direkomendasikan dari database */}
            {recommendedProducts.length > 0 && (
                <div className="mt-8 w-full max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4">Produk dari Database yang Mungkin Cocok:</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendedProducts.map((product) => (
                            <div key={product.id} className="border p-4 rounded-lg shadow-sm bg-white">
                                <h3 className="font-bold text-lg">{product.name}</h3>
                                <p className="text-md font-semibold text-green-700">
                                    Harga: Rp{product.price?.toLocaleString('id-ID')}
                                </p>
                                {product.ingredients_idn && (
                                    <p className="text-sm mt-2">
                                        **Kandungan Utama:** {typeof product.ingredients_idn === 'string' ? product.ingredients_idn : (Array.isArray(product.ingredients_idn) ? product.ingredients_idn.join(', ') : (product.ingredients_en || ''))}
                                    </p>
                                )}
                                {!product.ingredients_idn && product.ingredients_en && (
                                    <p className="text-sm mt-2">
                                        **Kandungan Utama:** {typeof product.ingredients_en === 'string' ? product.ingredients_en : (Array.isArray(product.ingredients_en) ? product.ingredients_en.join(', ') : '')}
                                    </p>
                                )}

                                {product.features_idn && (
                                    <p className="text-sm">
                                        **Fitur Utama:** {typeof product.features_idn === 'string' ? product.features_idn : (Array.isArray(product.features_idn) ? product.features_idn.join(', ') : (product.features_en || ''))}
                                    </p>
                                )}
                                {!product.features_idn && product.features_en && (
                                    <p className="text-sm">
                                        **Fitur Utama:** {typeof product.features_en === 'string' ? product.features_en : (Array.isArray(product.features_en) ? product.features_en.join(', ') : '')}
                                    </p>
                                )}

                                {product.description && <p className="text-sm mt-2 text-gray-700">{product.description}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {recommendedProducts.length === 0 && aiResponseText && !isThinking &&
                !aiResponseText.includes("Terjadi kesalahan") &&
                !aiResponseText.includes("Menganalisis masalah kulit Anda") && (
                    <p className="mt-4 text-gray-600">
                        Tidak ada produk yang cocok ditemukan dari database berdasarkan rekomendasi AI atau AI tidak dapat merekomendasikan ID produk spesifik.
                    </p>
                )}
        </div>
    );
}