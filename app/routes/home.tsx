import { Main } from "~/components/main";
import { Navbar } from "~/components/navbar/navbar";
import { Footer } from "~/components/footer";

export function meta() {
  return [{ title: "github - XniceCraft" }];
}

export default function Home() {
  return (
    <>
      <Navbar />
      <Main>
        <div className="h-[100vh] flex items-center justify-center">
          <p>Nothing here</p>
        </div>
      </Main>
      <Footer />
    </>
  );
}
