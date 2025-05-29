import Navbar from "@/src/components/navbar";

export default function RootLayout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}