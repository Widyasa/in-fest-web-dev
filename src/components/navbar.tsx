"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {Button} from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    const navigationLinks = [
        { name: "Home", href: "/home" },
        { name: "Ask AI", href: "/home/chat" },
        { name: "Product", href: "/home/product" },
        { name: "About", href: "/home#about" },
    ]
    const pathname = usePathname();
    return (
        <nav className="w-full border-b !bg-white z-50 bg-opacity-100 backdrop-filter-none py-2 fixed">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-main">
                                <img src="/img/logo-icon.svg" alt=""/>
                            </div>
                            <span className="title-font text-3xl text-main">Avara</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navigationLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`nav-link text-center ${pathname === link.href ? "active" : ""}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Desktop CTA Button */}
                    <div className="hidden md:block">
                        <Link href={'/home/chat'}>
                            <button className="btn btn-primary flex items-center gap-3">
                                <img src="/icon/chat.svg" alt=""/>
                                New Chat
                            </button>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetHeader className={"h-0 p-0"}>
                                <VisuallyHidden>
                                    <SheetTitle>Navigation Menu</SheetTitle>
                                </VisuallyHidden>
                            </SheetHeader>
                            <SheetTrigger asChild>
                                <Button variant="ghost" className={"btn btn-primary"} size="icon">
                                    <Menu className="h-6 w-6 text-white" />
                                    <span className="sr-only">Open main menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="top" className="w-full">
                                <div className="flex flex-col space-y-4 mt-6 max-w-md mx-auto">
                                    {/* Mobile Logo */}
                                    <div className="flex items-center justify-center space-x-2 pb-4 border-b">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-main">
                                            <img src="/img/logo-icon.svg" alt=""/>
                                        </div>
                                        <span className="text-3xl title-font text-main">Avara</span>
                                    </div>

                                    {/* Mobile Navigation Links */}
                                    <div className="flex flex-col space-y-2">
                                        {navigationLinks.map((link) => (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                className={`nav-link text-center ${pathname === link.href ? "active" : ""}` }
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {link.name}
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Mobile CTA Button */}
                                    <div className="py-4 w-full flex justify-center">
                                        <Link href={'/home/chat'}>
                                            <Button className="btn btn-primary flex items-center gap-3">
                                                <img src="/icon/chat.svg" alt=""/>
                                                New Chat
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    )
}
