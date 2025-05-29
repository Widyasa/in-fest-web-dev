'use client'

import Image from "next/image";
import Link from "next/link";
import {Icon} from "@iconify-icon/react";

export default function Navbar() {
    return(
        <>
        <nav className="py-4 navbar fixed w-full !bg-white z-50 bg-opacity-100 backdrop-filter-none">
            <div className="lg:flex hidden justify-between items-center container mx-auto">
                <div className="flex gap-2 logo-wrapper items-center">
                    <div className="flex justify-center items-center size-10 rounded-[6px] bg-main">
                        <Image width={25} height={29} src="/img/logo-icon.svg" alt="Logo Icon" />
                    </div>
                    <h2 className="text-main title-font text-3xl">Avara</h2>
                </div>
                <div className="flex gap-7 items-center">
                    <div className="flex gap-6">
                        <Link href={'/'} className={'nav-link active'}>Home</Link>
                        <Link href={'/'} className={'nav-link'}>Ask AI</Link>
                        <Link href={'/'} className={'nav-link'}>Product</Link>
                        <Link href={'/'} className={'nav-link'}>About</Link>
                    </div>
                    <button className={"btn btn-primary flex gap-3 items-center"}>
                        <Image width={23} height={23} src={"/icon/chat.svg"} alt="Chat Icon" />
                        New Chat
                    </button>
                </div>
            </div>
            <div className="flex lg:hidden justify-between items-center container mx-auto px-4">
                <div className="flex gap-2 logo-wrapper items-center">
                    <div className="flex justify-center items-center size-10 rounded-[6px] bg-main">
                        <Image width={25} height={29} src="/img/logo-icon.svg" alt="Logo Icon" />
                    </div>
                    <h2 className="text-main title-font text-3xl">Avara</h2>
                </div>
                <div className="flex gap-3 items-center">
                    <button className={"btn btn-primary"}>
                        <Image width={23} height={23} src={"/icon/chat.svg"} alt="Chat Icon" />
                    </button>
                    <button className={"btn btn-primary h-fit flex items-center"}>
                        <Icon icon="material-symbols:menu-rounded" width="23" height="23" className={"h-fit"}/>
                    </button>
                </div>
            </div>
        </nav>
        </>
    )
}