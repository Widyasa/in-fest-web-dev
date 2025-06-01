
export default function SolutionSection(){
    return(
        <>
            <section className="problem-section section-margin-top container mx-auto">
                <div className="flex justify-center">
                    <div className="badge">
                        <p className="font-semibold text-sm uppercase">WHAT WE SERVE</p>
                    </div>
                </div>
                <div className="mt-14">
                    <div className="grid grid-cols-12 items-center gap-10">
                        <div className="lg:col-span-5 lg:block hidden">
                            <img src="/img/solution/solution-img.png" alt="problem image" className="w-full"/>
                        </div>
                        <div className="xl:col-span-1 xl:block hidden"></div>
                        <div className="lg:col-span-7 xl:col-span-6 col-span-12">
                            <h2 className="title-font text-[40px] section-title leading-[130%]">
                                <span className="text-main">Solusi</span> Yang Kami Tawarkan
                            </h2>
                            <p className="mt-3 desc">
                                Avara ingin mengubah cara orang memilih skincare dari yang  berdasarkan tren, menjadi apa yang dibutuhkan kulit.
                            </p>
                            <div className="p-6 rounded-lg bg-[#F1F8FF] mt-8">
                                <div className="flex flex-col gap-6">
                                    <div className="flex gap-4 items-center">
                                        <div className="">
                                            <div className="bg-white size-[68px] rounded flex justify-center items-center">
                                                <img src="/icon/solution/solution1.svg" alt="Check Icon" />
                                            </div>
                                        </div>
                                        <div className="">
                                            <h3 className="text-main title-font text-xl">Memberi Rekomendasi Berdasarkan Masalah </h3>
                                            <p className="desc mt-1 text-sm">
                                                Masukkan masalah kulit yang kamu alami & AI kami akan temukan <br/>
                                                produk yang paling sesuai
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="">
                                            <div className="bg-white size-[68px] rounded flex justify-center items-center">
                                                <img src="/icon/solution/solution2.svg" alt="Check Icon" />
                                            </div>
                                        </div>
                                        <div className="">
                                            <h3 className="text-main title-font text-xl">Personalisasi Cerdas dengan Teknologi AI</h3>
                                            <p className="desc mt-1 text-sm">
                                                Kami menggunakan AI untuk memahami pola dan kebutuhan <br/>
                                                kulitmu, sehingga rekomendasi terasa seperti dari skin expert pribadi.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="">
                                            <div className="bg-white size-[68px] rounded flex justify-center items-center">
                                                <img src="/icon/solution/solution3.svg" alt="Check Icon" />
                                            </div>
                                        </div>
                                        <div className="">
                                            <h3 className="text-main title-font text-xl">Memberi Rekomendasi Berdasarkan Masalah </h3>
                                            <p className="desc mt-1 text-sm">
                                                Rekomendasi tidak dipengaruhi sponsor atau endorsement. <br/>
                                                Semua produk didasarkan pada kecocokan bahan & kulit.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="">
                                            <div className="bg-white size-[68px] rounded flex justify-center items-center">
                                                <img src="/icon/solution/solution4.svg" alt="Check Icon" />
                                            </div>
                                        </div>
                                        <div className="">
                                            <h3 className="text-main title-font text-xl">Memberi Rekomendasi Berdasarkan Masalah </h3>
                                            <p className="desc mt-1 text-sm">
                                                Ada dua produk yang digunakan bersamaan punya bahan yang <br/>
                                                bertentangan. AI kami bisa membantu efek seperti ini.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}