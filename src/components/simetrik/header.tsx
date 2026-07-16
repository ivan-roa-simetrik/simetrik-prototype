"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  HeroNavigation01,
  HeroNavigation01SmallScreen,
  type Navigation,
} from "@/components/simetrik/hero-navigation";
import { Logo } from "@/components/simetrik/logo";
import { cn } from "@/lib/utils";

type HeaderProps = {
  navigationData: Navigation[];
  className?: string;
};

export const Header = ({ navigationData, className }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "bg-background sticky top-0 z-50 h-16 w-full border-b transition-all duration-300",
        { "bg-card/75 backdrop-blur": isScrolled },
        className,
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <a href="#">
          <Logo />
        </a>

        <HeroNavigation01 navigationData={navigationData} />

        <Button size="lg" className="max-lg:hidden" render={<Link href="/prueba-gratis" />} nativeButton={false}>
          Prueba gratis
        </Button>

        <div className="flex gap-4 lg:hidden">
          <Button size="lg" render={<Link href="/prueba-gratis" />} nativeButton={false}>
            Prueba gratis
          </Button>
          <HeroNavigation01SmallScreen navigationData={navigationData} triggerClassName="input-size-lg" />
        </div>
      </div>
    </header>
  );
};

export default Header;
