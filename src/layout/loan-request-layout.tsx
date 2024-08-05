import { Outlet } from "react-router-dom";
import logo from "@/assets/images/dominion-logo.svg";
import authIllustration from "@/assets/images/background-img.jpeg";
import { Card } from "@/components/ui/card";

export const LoanRequestLayout = () => {
  return (
    <main>
      <section className="flex justify-center items-center h-auto min-h-screen relative border-2">
        <img
          src={authIllustration}
          alt="Auth"
          className="object-center inline-block absolute inset-0 max-h-full w-full"
        />
        <div className="absolute inset-0 bg-[#7E21CF] opacity-60"></div>
        <article className="py-6 min-h-screen flex items-center justify-center w-[95%] mx-auto max-w-[800px] relative z-30">
          <Card className="w-full rounded">
            <img
              src={logo}
              alt="Auth"
              className="block mx-auto my-2 h-4 lg:h-8"
            />

            <div className="py-6">
              <Outlet />
            </div>
          </Card>
        </article>
      </section>
    </main>
  );
};
