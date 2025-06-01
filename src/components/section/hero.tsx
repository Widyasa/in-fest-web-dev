import Image from "next/image";
import PrimaryButton from "@/components/ui/primary-button";
import Link from "next/link";

export default function HeroSection() {
    return(
        <>
            <section className="hero-section md:mx-11">
                {/* Perbaikan di sini: Tambahkan min-h-screen untuk base, dan pastikan ukuran di md: */}
                {/* Gunakan relative dan overflow-hidden pada container background */}
                <div className="w-full min-h-[620px] h-auto md:h-[620px] rounded-xl bg-cover bg-center relative overflow-hidden">
                    <div className="relative h-full w-full"> {/* Pastikan h-full dan w-full di div ini */}
                        <div className="relative w-full"> {/* Pastikan w-full di div ini */}
                            <div className="flex justify-center">
                                <div className="max-w-[876px] w-full flex flex-col items-center mt-7">
                                    <div className="badge flex gap-[3px] bg-white rounded-full px-4 py-2 shadow-sm"> {/* Tambah styling badge */}
                                        <p className="font-semibold text-sm">POWERED BY</p>
                                        <Image width={47.598} height={17.847} src="/icon/gemini-logo.svg" alt="Logo Icon" />
                                    </div>
                                    <div className="text-center"> {/* Tambah text-center untuk memastikan alignment */}
                                        <h1 className="title-font hero-title mt-8 leading-[130%] text-gray-800"> {/* Tambah text-gray-800 */}
                                            Berhenti Asal-Asalan <br className={"hidden md:block"}/>
                                            Pilih Skincare Untuk Kulitmu <br className={"hidden md:block"}/>
                                            <span className="text-blue-600">Tanyakan Langsung Ke AI Sekarang</span> {/* Gunakan text-blue-600 atau warna main Anda */}
                                        </h1>
                                        <div className="max-w-[750px] w-full mx-auto"> {/* Tambah mx-auto */}
                                            <p className="mt-6 desc text-gray-600"> {/* Tambah text-gray-600 */}
                                                Didukung teknologi AI yang memahami jenis kulitmu dan mencocokkannya dengan produk terbaik. Siapkah kamu memulai perawatan kulit yang benar-benar sesuai dengan kebutuhan kulitmu
                                            </p>
                                        </div>
                                        <div className="mt-8 flex justify-center">
                                            <Link href={'#chat'}> {/* Ganti #chat dengan /chat */}
                                                <PrimaryButton label={"Get Started"} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Gambar-gambar absolute positioning */}
                        {/* Tambahkan `z-10` jika ada elemen lain yang menutupi */}
                        <div className="absolute top-0 left-20 right-0 lg:block hidden z-10">
                            <Image width={160} height={140} src="/img/hero/hero1.png" alt="hero decor" />
                        </div>
                        <div className="absolute top-11 right-0 lg:block hidden z-10">
                            <Image width={160} height={180} src="/img/hero/hero2.png" alt="hero decor" />
                        </div>
                        <div className="absolute bottom-9 left-14 lg:block hidden z-10">
                            <Image width={180} height={240} src="/img/hero/hero3.png" alt="hero decor" />
                        </div>
                        <div className="absolute bottom-0 right-[200px] lg:block hidden z-10">
                            <Image width={160} height={160} src="/img/hero/hero4.png" alt="hero decor" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}