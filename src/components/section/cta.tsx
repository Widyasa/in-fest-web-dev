export default function CtaSection() {
    return (
        <>
            <div className="container mx-auto section-margin-top rounded-2xl">
                <section
                    className="py-16 px-4 md:py-20 lg:py-24 rounded-2xl"
                    style={{
                        boxShadow: "0px 0px 24px 0px rgba(0, 70, 182, 0.20)",
                        backgroundImage: "url('/img/cta/bg-cta.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    {/* Content */}
                    <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
                            Yuk, Mulai Temukan
                            <br />
                            Skincare Terbaik Kulitmu
                        </h1>

                        <p className="text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed opacity-90">
                            Gak perlu bingung lagi pilih skincare. Cukup konsul pada Avara AI dan biarkan Avara bantu temukan produk yang
                            cocok buat kulit kamu.
                        </p>
                    </div>
                </section>
            </div>
        </>
    )
}
