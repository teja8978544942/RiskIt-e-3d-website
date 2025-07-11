
'use client';

import { Scene } from '@/components/scene';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Link from 'next/link';
import { FlavorScene } from '@/components/flavor-scene';
import { flavors } from '@/lib/flavors';
import { Header } from '@/components/header';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FlavorExplosionAnimation } from '@/components/flavor-explosion-animation';
import { MousePointerClick } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [animatingFlavor, setAnimatingFlavor] = useState<{name: string, color: string} | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleCanClick = (flavor: {name: string, color: string}) => {
    router.push(`/pour/${encodeURIComponent(flavor.name)}`);
  };

  const handleCarouselClick = (flavor: {name: string, color: string}) => {
    setAnimatingFlavor(flavor);
  };

  const handleAnimationComplete = () => {
    if (animatingFlavor) {
      router.push(`/checkout?flavor=${encodeURIComponent(animatingFlavor.name)}`);
      setAnimatingFlavor(null);
    }
  };

  return (
    <>
      <main className="relative w-full overflow-x-hidden bg-background text-foreground">
        <Header />
        <div className="absolute inset-0 z-0">
          <Scene onCanClick={handleCanClick} />
        </div>

        <div className="relative z-10">
          <section className="flex h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className="font-headline text-6xl font-bold md:text-8xl lg:text-9xl">
              RiskIt
            </h1>
            <p className="mt-4 text-lg md:text-xl">
              The bold taste of adventure.
            </p>
            {showHint && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-5 duration-1000 mt-12 flex items-center gap-3 rounded-full bg-background/50 px-4 py-2 text-foreground/80 backdrop-blur-sm">
                <MousePointerClick className="h-5 w-5 animate-pulse" />
                <span>Click a can to dive into the flavor</span>
              </div>
            )}
          </section>

          <section
            id="section-1"
            className="container mx-auto flex h-screen items-center justify-start"
          >
            <div className="max-w-md p-4">
              <h2 className="font-headline text-4xl font-bold md:text-6xl">
                Natural Ingredients
              </h2>
              <p className="mt-4 text-base md:text-lg">
                Crafted with the finest, all-natural ingredients, our product offers a
                pure and refreshing taste. We believe in transparency and
                quality, from farm to can.
              </p>
            </div>
          </section>

          <section
            id="section-2"
            className="container mx-auto flex h-screen items-center justify-end"
          >
            <div className="max-w-md p-4 text-right">
              <h2 className="font-headline text-4xl font-bold md:text-6xl">
                Unleash the Flavor
              </h2>
              <p className="mt-4 text-base md:text-lg">
                A symphony of bold flavors designed to awaken your senses. Each
                sip is an invitation to a new experience, a new adventure.
              </p>
            </div>
          </section>

          <section
            id="flavors"
            className="container mx-auto flex h-screen flex-col items-center justify-center p-4"
          >
            <h2 className="mb-8 text-center font-headline text-4xl font-bold md:text-6xl">
              8 Bold Flavors
            </h2>

            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl"
            >
              <CarouselContent>
                {flavors.map((flavor, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card
                        className="overflow-hidden rounded-lg cursor-pointer transition-shadow hover:shadow-xl"
                        onClick={() => handleCarouselClick(flavor)}
                      >
                        <CardContent className="p-0">
                          <div className="relative w-full aspect-square">
                            <FlavorScene flavorName={flavor.name} flavorColor={flavor.color} />
                          </div>
                          <div className="w-full p-4">
                            <h3 className="text-center font-headline text-xl font-bold">
                              {flavor.name}
                            </h3>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
          
          <section
            id="section-3"
            className="flex h-screen flex-col items-center justify-center p-4 text-center"
          >
            <div className="max-w-lg">
              <h2 className="font-headline text-4xl font-bold md:text-6xl">
                Join the Adventure
              </h2>
              <p className="mt-4 text-base md:text-lg">
                Ready to take a risk? Experience the thrill of flavor and order
                your pack today.
              </p>
              <Link href="/checkout">
                  <Button size="lg" className="mt-8 px-10 py-6 font-bold">
                    Buy Now
                  </Button>
              </Link>
            </div>
          </section>

          <footer className="h-[50vh] flex items-center justify-center text-center text-foreground/60">
            <p>&copy; {year} RiskIt. All rights reserved.</p>
          </footer>
        </div>
      </main>
      {animatingFlavor && (
        <FlavorExplosionAnimation 
          flavorName={animatingFlavor.name} 
          flavorColor={animatingFlavor.color} 
          onComplete={handleAnimationComplete} 
        />
      )}
    </>
  );
}
