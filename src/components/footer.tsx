import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react"
import Link from "next/link";
import PrimaryButton from "@/components/ui/primary-button";

export default function FooterSection() {
    return (
        <footer className="bg-[#F1F8FF] py-10 px-4 section-margin-top">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-12 pb-8 border-b border-gray-200">
                    <h2 className="title-font section-title mb-4 md:mb-0">
                        Tetap <span className="text-blue-500">Terhubung</span> Dengan Kami
                    </h2>
                    <Link href={'https://wa.me/6288987338735?text=Halo, saya ingin bertanya terkait website Avara AI'}>
                        <PrimaryButton label={"Contact Us"}/>
                    </Link>
                </div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Avara Brand Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-main rounded-lg flex items-center justify-center mr-3">
                                <img src="/img/logo-icon.svg" alt=""/>
                            </div>
                            <span className="text-xl font-semibold title-font text-main">Avara</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Avara AI adalah asisten skincare berbasis kecerdasan buatan yang dirancang untuk membantu kamu menemukan
                            produk perawatan kulit yang paling cocok.
                        </p>
                    </div>

                    {/* Navigation Section */}
                    <div>
                        <h3 className="text-gray-800 font-semibold mb-4">Navigation</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/home" className="text-gray-600 hover:text-main w-fit transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/home/chat" className="text-gray-600 hover:text-main w-fit transition-colors">
                                    Ask AI
                                </Link>
                            </li>
                            <li>
                                <Link href="/home/product" className="text-gray-600 hover:text-main w-fit transition-colors">
                                    Product
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Socials Section */}
                    <div>
                        <h3 className="text-gray-800 font-semibold mb-4">Socials</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#" className="flex items-center text-gray-600 hover:text-main w-fit transition-colors">
                                    <Facebook className="w-4 h-4 mr-2" />
                                    Facebook
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="flex items-center text-gray-600 hover:text-main w-fit transition-colors">
                                    <Twitter className="w-4 h-4 mr-2" />
                                    Twitter
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="flex items-center text-gray-600 hover:text-main w-fit transition-colors">
                                    <Instagram className="w-4 h-4 mr-2" />
                                    Instagram
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="flex items-center text-gray-600 hover:text-main w-fit transition-colors">
                                    <Youtube className="w-4 h-4 mr-2" />
                                    Youtube
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h3 className="text-gray-800 font-semibold mb-4">Contact</h3>
                        <Link
                            href="mailto:avaraaisupport@gmail.com"
                            className="flex items-center text-gray-600 hover:text-main w-fit transition-colors"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            avaraaisupport@support.com
                        </Link>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
                    <p className="text-gray-500 text-sm mb-4 md:mb-0">© Copyright by AvaraAI. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <Link href="#" className="text-gray-500 hover:text-main w-fit text-sm transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="text-gray-500 hover:text-main w-fit text-sm transition-colors">
                            Term of Use
                        </Link>
                        <Link href="#" className="text-gray-500 hover:text-main w-fit text-sm transition-colors">
                            Legal
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
