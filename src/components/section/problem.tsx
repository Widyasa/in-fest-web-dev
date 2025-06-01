
export default function ProblemSection(){
    return(
        <>
            <section className="problem-section section-margin-top container mx-auto">
                <div className="flex justify-center">
                    <div className="badge">
                        <p className="font-semibold text-sm uppercase">the problem</p>
                    </div>
                </div>
                <div className="mt-14">
                    <div className="grid grid-cols-12 items-center gap-10">
                        <div className="lg:col-span-7 xl:col-span-6 col-span-12">
                            <h2 className="title-font text-[40px] section-title leading-[130%]">
                                <span className="text-main">Masalah</span> Yang Sering <br className="md:block hidden"/>
                                Muncul Saat Memilih Skincare
                            </h2>
                            <p className="mt-3 desc">
                                Tidak semua produk cocok untuk semua orang. Tanpa <br className="xl:block hidden"/>
                                memahami jenis kulit dan kandungan bahan, skincare bisa <br className="xl:block hidden"/>
                                jadi tidak efektif — atau justru merusak skin barrier.
                            </p>
                            <div className="grid md:grid-cols-2 grid-cols-1 gap-5 mt-7">
                                <div className="problem-card">
                                    <div className="size-12 rounded-lg bg-main flex justify-center items-center">
                                        <img
                                            src="/icon/problem/problem1.svg"
                                            alt="Check Icon"
                                            className="object-contain"
                                        />
                                    </div>
                                    <h3 className="text-main title-font text-xl">
                                        Tidak Mengerti <br/> Kandungan Produk
                                    </h3>
                                </div>
                                <div className="problem-card">
                                    <div className="size-12 rounded-lg bg-main flex justify-center items-center">
                                        <img
                                            src="/icon/problem/problem2.svg"
                                            alt="Check Icon"
                                            className="object-contain"
                                        />
                                    </div>
                                    <h3 className="text-main title-font text-xl">
                                        Tidak Tahu Kondisi <br/> Kulit Sendiri
                                    </h3>
                                </div>
                                <div className="problem-card">
                                    <div className="size-12 rounded-lg bg-main flex justify-center items-center">
                                        <img
                                            src="/icon/problem/problem3.svg"
                                            alt="Check Icon"
                                            className="object-contain"
                                        />
                                    </div>
                                    <h3 className="text-main title-font text-xl">
                                        Ikut Tren Tanpa <br/> Pertimbangan
                                    </h3>
                                </div>
                                <div className="problem-card">
                                    <div className="size-12 rounded-lg bg-main flex justify-center items-center">
                                        <img
                                            src="/icon/problem/problem4.svg"
                                            alt="Check Icon"
                                            className="object-contain"
                                        />
                                    </div>
                                    <h3 className="text-main title-font text-xl">
                                        Bingung Kombinasi <br/> Produk Skincare
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="xl:col-span-1 xl:block hidden"></div>
                        <div className="lg:col-span-5 lg:block hidden">
                            <img src="/img/problem/problem-img.png" alt="problem image" className="w-full"/>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}