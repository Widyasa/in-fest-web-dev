import ChatSection from "@/components/section/chat";
import HeroSection from "@/components/section/hero";
import ProblemSection from "@/components/section/problem";
import SolutionSection from "@/components/section/solution";
import FooterSection from "@/components/footer";
import CtaSection from "@/components/section/cta";


function TestimonySection() {
    return null;
}

export default function Home() {

    return(
        <>
            <div className="pt-[100px]">
                <HeroSection />
                <ProblemSection />
                <SolutionSection />
                <ChatSection />
                <TestimonySection />
                <CtaSection />
                <FooterSection />
            </div>
        </>
    );
}