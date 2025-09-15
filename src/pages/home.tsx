import { Navbar } from "@/components/navbar/navbar";
import { Main } from "@/components/ui/main";
import MainLayout from "@/layout/main-layout";

export default function Home() {
    return (
        <MainLayout>
            <Navbar />

            <Main>
                <p></p>
            </Main>
        </MainLayout>
    );
}
