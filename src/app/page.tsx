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
import { ArrowDown } from 'lucide-react';
import Image from 'next/image';

const flavors = [
  { name: 'Midnight Chocolate', hint: 'soda can chocolate', imageUrl: 'https://images.unsplash.com/photo-1567103472667-6898f3a79cf2?w=300&h=500&fit=crop&q=80' },
  { name: 'Citrus Surge', hint: 'soda can citrus', imageUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a7046500?w=300&h=500&fit=crop&q=80' },
  { name: 'Berry Blitz', hint: 'soda can berry', imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=300&h=500&fit=crop&q=80' },
  { name: 'Tropical Fusion', hint: 'soda can tropical', imageUrl: 'https://images.unsplash.com/photo-1541533332-850626307138?w=300&h=500&fit=crop&q=80' },
  { name: 'Arctic Mint', hint: 'soda can mint', imageUrl: 'https://images.unsplash.com/photo-1556887596-6e4a52044816?w=300&h=500&fit=crop&q=80' },
  { name: 'Spiced Apple', hint: 'soda can apple', imageUrl: 'https://images.unsplash.com/photo-1627878344714-ac106d4e3758?w=300&h=500&fit=crop&q=80' },
  { name: 'Cherry Bomb', hint: 'soda can cherry', imageUrl: 'https://images.unsplash.com/photo-1558779093-61f893a7a403?w=300&h=500&fit=crop&q=80' },
  { name: 'Grape Escape', hint: 'soda can grape', imageUrl: 'https://images.unsplash.com/photo-1600171553254-159e1dc43834?w=300&h=500&fit=crop&q=80' },
];

export default function Home() {
  return (
    <main className="relative w-full overflow-x-hidden bg-background text-foreground">
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      <div className="relative z-10">
        <section className="flex h-screen flex-col items-center justify-center p-4 text-center">
          <h1 className="font-headline text-6xl font-bold md:text-8xl lg:text-9xl">
            RiskIt
          </h1>
          <p className="mt-4 text-lg md:text-xl">
            The bold taste of adventure.
          </p>
          <div className="absolute bottom-10 flex flex-col items-center gap-2 text-sm text-foreground/80">
            <p>Scroll to discover</p>
            <ArrowDown className="h-6 w-6 animate-bounce" />
          </div>
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
              Crafted with the finest, all-natural ingredients, RiskIt offers a
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
                    <Card className="overflow-hidden rounded-lg border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
                      <CardContent className="flex flex-col items-center justify-center p-0">
                        <div className="aspect-[3/5] w-full overflow-hidden bg-secondary">
                          <Image
                            src={flavor.imageUrl}
                            alt={flavor.name}
                            width={300}
                            height={500}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                            data-ai-hint={flavor.hint}
                          />
                        </div>
                        <div className="w-full p-4 bg-background/50">
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
            <Button size="lg" className="mt-8 px-10 py-6 font-bold">
              Buy Now
            </Button>
          </div>
        </section>
        
        <footer className="h-[50vh] flex items-center justify-center text-center text-foreground/60">
            <p>&copy; {new Date().getFullYear()} RiskIt. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
