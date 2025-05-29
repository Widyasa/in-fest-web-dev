import Image from "next/image";
import PrimaryButton from "@/src/components/ui/primary-button";

export default function HeroSection() {
    return(
        <>
            <section className="hero-section md:mx-11">
                <div className="bg-[url('/img/hero-bg.svg')] w-full md:h-[620px] h-screen rounded-xl bg-cover bg-center">
                    <div className="relative h-full">
                        <div className="relative">
                            <div className="flex justify-center">
                                <div className="max-w-[876px] w-full flex flex-col items-center mt-7">
                                    <div className="badge flex gap-[3px]">
                                        <p className="font-semibold text-sm">POWERED BY</p>
                                        <Image width={47.598} height={17.847} src="/icon/gemini-logo.svg" alt="Logo Icon" />
                                    </div>
                                    <div className="">
                                        <h1 className="title-font hero-title mt-8 text-center leading-[130%]">
                                            Berhenti Asal-Asalan <br className={"hidden md:block"}/>
                                            Pilih Skincare Untuk Kulitmu <br className={"hidden md:block"}/>
                                            <span className="text-main">Tanyakan Langsung Ke AI Sekarang</span>
                                        </h1>
                                        <div className="max-w-[750px] w-full">
                                            <p className="mt-6 desc text-center">
                                                Didukung teknologi AI yang memahami jenis kulitmu dan mencocokkannya dengan produk terbaik. Siapkah kamu memulai perawatan kulit yang benar-benar sesuai dengan kebutuhan kulitmu
                                            </p>
                                        </div>
                                        <div className="mt-8 flex justify-center">
                                            <PrimaryButton label={"Get Started"} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 left-20 right-0 lg:block hidden">
                            <Image width={160} height={140} src="/img/hero/hero1.png" alt="hero decor" />
                        </div>
                        <div className="absolute top-11 right-0 lg:block hidden">
                            <Image width={160} height={180} src="/img/hero/hero2.png" alt="hero decor" />
                        </div>
                        <div className="absolute bottom-9 left-14 lg:block hidden">
                            <Image width={180} height={240} src="/img/hero/hero3.png" alt="hero decor" />
                        </div>
                        <div className="absolute bottom-0 right-[200px] lg:block hidden">
                            <Image width={160} height={160} src="/img/hero/hero4.png" alt="hero decor" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}