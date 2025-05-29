import HeroSection from "@/src/components/section/hero";
import ProblemSection from "@/src/components/section/problem";
import ChatSection from "@/src/components/section/chat";
import SolutionSection from "@/src/components/section/solution";
import TestimonySection from "@/src/components/section/testimony";
import CtaSection from "@/src/components/section/cta";
import FooterSection from "@/src/components/footer";

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