'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // set initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-sm shadow-md'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between p-4">
        <Link
          href="/"
          className="font-headline text-3xl font-bold"
          onClick={closeMobileMenu}
        >
          RiskIt
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center space-x-8 md:flex">
          <Link
            href="#flavors"
            className="text-lg transition-colors hover:text-primary"
          >
            Flavors
          </Link>
          <Link
            href="#section-1"
            className="text-lg transition-colors hover:text-primary"
          >
            About
          </Link>
          <Link href="/checkout">
            <Button>Buy Now</Button>
          </Link>
        </nav>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col space-y-6 p-6">
                <Link
                  href="/"
                  className="self-start font-headline text-3xl font-bold"
                  onClick={closeMobileMenu}
                >
                  RiskIt
                </Link>
                <nav className="flex flex-col space-y-4">
                  <Link
                    href="#flavors"
                    className="text-xl"
                    onClick={closeMobileMenu}
                  >
                    Flavors
                  </Link>
                  <Link
                    href="#section-1"
                    className="text-xl"
                    onClick={closeMobileMenu}
                  >
                    About
                  </Link>
                </nav>
                <Link href="/checkout" onClick={closeMobileMenu}>
                  <Button size="lg" className="w-full">
                    Buy Now
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
