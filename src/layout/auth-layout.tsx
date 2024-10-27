import { Outlet } from "react-router-dom";
import logo from "@/assets/images/dominion-logo.svg";
import authIllustration from "@/assets/images/background-img.jpeg";
import { Card } from "@/components/ui/card";

export const AuthLayout = () => {
  return (
    <main>
      <section className="flex justify-center items-center min-h-screen relative">
        <img
          src={authIllustration}
          alt="Auth"
          className="w-full fixed inset-0"
        />
        <div className="absolute inset-0 bg-[#7E21CF] opacity-60"></div>
        <article className="min-h-screen flex items-center justify-center w-[95%] mx-auto max-w-[600px] relative z-30">
          <Card className="w-full rounded">
            <img
              src={logo}
              alt="Auth"
              className="block mx-auto my-2 h-4 lg:h-8"
            />
            {/* <h2 className="scroll-m-20 text-3xl font-bold tracking-tight mb-12">
              Loan Management System
            </h2> */}
            <div className="mt-6">
              <Outlet />
            </div>
          </Card>
        </article>
      </section>
    </main>
  );
};
