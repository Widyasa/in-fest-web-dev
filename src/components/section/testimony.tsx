"use client"

import { useState } from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

export default function TestimonialsSection() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)
    const [realIndex, setRealIndex] = useState(0)

    const testimonials = [
        {
            id: 1,
            name: "Putri Ninggreni",
            image: "/img/testi/testi1.png",
            rating: 5,
            text: "Assistant bot ini memberikan rekomendasi skincare yang sesuai dengan kondisi kulit. Prosesnya cepat dan informatif.",
        },
        {
            id: 2,
            name: "Icha Septirasa",
            image: "/img/testi/testi2.png",
            rating: 5,
            text: "Bot-nya responsif, ngerti kebutuhan kulit, dan bantu pilih produk yang pas. Sekarang skincare-an jadi lebih yakin.",
        },
        {
            id: 3,
            name: "Agnes Gabriella",
            image: "/img/testi/testi3.png",
            rating: 5,
            text: "Ngga nyangka, pakai bot buat milih skincare ternyata ngebantu banget. Gak perlu scroll lama-lama, langsung dapat.",
        },
        {
            id: 4,
            name: "Sarah Melinda",
            image: "/img/testi/testi1.png",
            rating: 5,
            text: "Rekomendasi yang diberikan sangat akurat dan sesuai dengan budget. Skincare routine jadi lebih terarah.",
        },
        {
            id: 5,
            name: "Diana Kusuma",
            image: "/img/testi/testi2.png",
            rating: 5,
            text: "Chatbot-nya mudah digunakan dan memberikan solusi yang tepat untuk masalah kulit sensitif saya.",
        },
        {
            id: 6,
            name: "Maya Sari",
            image: "/img/testi/testi3.png",
            rating: 5,
            text: "Interface yang user-friendly dan hasil rekomendasi yang sangat membantu dalam memilih produk skincare.",
        },
    ]

    // Star rating component
    const StarRating = ({ rating }: { rating: number }) => {
        return (
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        )
    }

    const handleSlideChange = (swiper: SwiperType) => {
        setActiveIndex(swiper.activeIndex)
        setRealIndex(swiper.realIndex)
    }

    // Function to determine if a slide should be highlighted
    const isSlideHighlighted = (slideIndex: number) => {
        // For 3 slides per view, the center slide should be highlighted
        // The center slide is the one at position 1 (middle) in the visible slides
        const centerSlideIndex = (realIndex + 1) % testimonials.length
        return slideIndex === centerSlideIndex
    }

    return (
        <section className="py-16 section-margin-top px-4 bg-white">
            <div className="container mx-auto">
                {/* Badge */}
                <div className="flex justify-center mb-8">
                    <span className="badge text-sm font-semibold">TESTIMONIALS</span>
                </div>

                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="section-title title-font">
                        Cerita Mereka Setelah Menggunakan <span className="text-blue-600">Avara</span>
                    </h2>
                    <p className="desc max-w-3xl mx-auto">
                        Setelah mencoba Avara, banyak pengguna merasakan perubahan positif pada kulit mereka. Lewat rekomendasi yang
                        personal dan tepat sasaran
                    </p>
                </div>

                {/* Testimonials Swiper */}
                <div className="relative px-16">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={24}
                        slidesPerView={3}
                        slidesPerGroup={1}
                        centeredSlides={false}
                        loop={true}
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                        }}
                        speed={600}
                        navigation={{
                            nextEl: ".swiper-button-next-custom",
                            prevEl: ".swiper-button-prev-custom",
                        }}
                        pagination={{
                            el: ".swiper-pagination-custom",
                            clickable: true,
                            bulletClass: "swiper-pagination-bullet-custom",
                            bulletActiveClass: "swiper-pagination-bullet-active-custom",
                        }}
                        breakpoints={{
                            320: {
                                slidesPerView: 1,
                                spaceBetween: 16,
                            },
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 24,
                            },
                        }}
                        onSlideChange={handleSlideChange}
                    >
                        {testimonials.map((testimonial, index) => (
                            <SwiperSlide key={testimonial.id}>
                                <div
                                    className={`relative p-6 rounded-3xl transition-all duration-500 cursor-pointer h-full ${
                                        isSlideHighlighted(index) || hoveredCard === index
                                            ? "bg-[#F1F8FF] transform scale-105 border border-transparent"
                                            : "bg-white text-gray-800 border border-gray-100"
                                    }`}
                                    onMouseEnter={() => setHoveredCard(index)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    {/* Profile and Rating */}
                                    <div className="flex items-center mb-4">
                                        <div className="relative w-10 h-10 overflow-hidden mr-3">
                                            <Image
                                                src={testimonial.image || "/placeholder.svg"}
                                                alt={testimonial.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4
                                                className={`font-semibold text-sm`}
                                            >
                                                {testimonial.name}
                                            </h4>
                                            <div className="mt-1">
                                                <StarRating rating={testimonial.rating} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Testimonial Text */}
                                    <p
                                        className={`text-sm leading-relaxed desc`}
                                    >
                                        {testimonial.text}
                                    </p>

                                    {/* Quote Icon */}
                                    <div className="absolute top-6 right-6">
                                        <svg
                                            className={`w-8 h-8 text-main`}
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                                        </svg>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Custom Navigation Buttons */}
                    <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-200 z-10">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-200 z-10">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Custom Pagination */}
                <div className="swiper-pagination-custom flex justify-center space-x-2 mt-8"></div>
            </div>

            <style jsx global>{`
                .testimonials-swiper {
                    padding: 20px 0;
                    overflow: visible;
                }

                .swiper-pagination-bullet-custom {
                    width: 32px;
                    height: 8px;
                    border-radius: 4px;
                    background: #d1d5db;
                    opacity: 1;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .swiper-pagination-bullet-active-custom {
                    background: #798CAA;
                    width:60px
                }

                .swiper-button-prev-custom,
                .swiper-button-next-custom {
                    position: absolute;
                    top: 50%;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: white;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    cursor: pointer;
                    transition: background-color 0.2s ease, box-shadow 0.2s ease;
                }

                .swiper-button-prev-custom {
                    left: 0;
                    transform: translateY(-50%);
                }

                .swiper-button-next-custom {
                    right: 0;
                    transform: translateY(-50%);
                }

                .swiper-button-prev-custom:hover,
                .swiper-button-next-custom:hover {
                    background-color: #f9fafb;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
            `}</style>
        </section>
    )
}
