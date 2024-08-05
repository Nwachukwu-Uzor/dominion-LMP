import { useState } from "react";
import { Sidebar, Container } from "@/components/shared";
import { Outlet } from "react-router-dom";
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useUser } from "@/hooks";
import { ClipLoader } from "react-spinners";
// import { ClipLoader } from "react-spinners";

export const MainLayout = () => {
  const { isLoading } = useUser();
  const [open, setOpen] = useState(window.innerWidth > 768);
  const handleToggleSidebar = () => {
    setOpen((open) => !open);
  };

  return isLoading ? (
    <section className="h-screen flex items-center justify-center">
      <ClipLoader size={20} color="#fde047" />
    </section>
  ) : (
    <main className="flex relative">
      <div className="w-fit">
        <Sidebar open={open} handleToggleSidebar={handleToggleSidebar} />
      </div>
      <section className={`w-auto flex-auto bg-[#E4E4E4]`}>
        <header className="bg-white shadow-sm h-12 flex items-center justify-center">
          <Container>
            <div className="flex justify-end lg:justify-between items-center">
              <HamburgerMenuIcon
                onClick={handleToggleSidebar}
                className="cursor-pointer hidden lg:inline-block"
              />
              <div className="flex items-center gap-1">
                <div
                  className="lg:hidden self-end cursor-pointer"
                  onClick={handleToggleSidebar}
                >
                  {open ? <Cross1Icon /> : <HamburgerMenuIcon />}
                </div>
              </div>
            </div>
          </Container>
        </header>
        <article className={`mt-8 w-auto`}>
          <article className="min-h-[calc(100vh-50px)] flex flex-col justify-between gap-8">
            <Outlet />

            <div className="flex items-center justify-center mt-auto bg-[#2D2D2D] h-10">
              <p className="text-white text-sm font-light">
                &copy; {new Date().getFullYear()}
                <span className="inline-block ml-1 font-semibold">
                  Dominion Merchants and Partners Limited
                </span>
              </p>
            </div>
          </article>
        </article>
      </section>
    </main>
  );
};
