import { Search, CircleCheck, Droplet, Package, ShieldCheck, Sparkles } from "lucide-react"

export default function ChatSection() {
    const options = [
        {
            id: 1,
            label: "Produk untuk kulit kering",
            icon: <Package size={16} className="mr-1" />,
        },
        {
            id: 2,
            label: "Produk untuk kulit berminyak",
            icon: <Droplet size={16} className="mr-1" />,
        },
        {
            id: 3,
            label: "Kulit Berjerawat",
            icon: <CircleCheck size={16} className="mr-1" />,
        },
        {
            id: 4,
            label: "Menghilangkan flek/kerutan",
            icon: <ShieldCheck size={16} className="mr-1" />,
        },
        {
            id: 5,
            label: "Mengobati warna kulit tidak merata",
            icon: <Search size={16} className="mr-1" />,
        },
        {
            id: 6,
            label: "Produk skincare untuk mencerahkan",
            icon: <Sparkles size={16} className="mr-1" />,
        },
        {
            id: 7,
            label: "Rekomendasi sunscreen kulit sensitif",
            icon: <ShieldCheck size={16} className="mr-1" />,
        },
    ]

    return (
        <main className="flex section-margin-top flex-col items-center bg-[#f0f4f9] p-4">
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center pt-8 pb-16">
                {/* AI Consultant Header */}
                <div className="self-center badge text-sm font-semibold">
                    AI Consultant
                </div>

                {/* Main Title Section */}
                <div className="text-center mt-12 mb-8">
                    <h1 className="text-3xl title-font font-medium mb-2">Avara AI by Gemini</h1>
                    <p className="desc">
                        Certifikatif menguasai kutipmu untuk hasil perencanaan yang kamu inginkan
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full max-w-md">
                    <div className="flex items-center bg-white rounded-full border border-gray-200 px-4 py-2 shadow-sm">
                        <input
                            type="text"
                            placeholder="Saya Merasa Kulit Saya Kering..."
                            className="flex-1 outline-none text-sm"
                        />
                        <button className="ml-2 text-gray-400 hover:text-gray-600">
                            <Search size={18} />
                        </button>
                    </div>
                </div>

                {/* Option Buttons */}
                <div className="w-full mt-6">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {options.map((option) => (
                            <button
                                key={option.id}
                                className="flex items-center text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-blue-800 hover:bg-blue-50 transition-colors"
                            >
                                {option.icon}
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
