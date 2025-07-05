
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
import Image from 'next/image';

const flavors = [
  { name: 'Orange Burst', color: '#E87722', imageUrl: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=400', hint: 'orange fruit' },
  { name: 'Lime Zing', color: '#99C23A', imageUrl: 'https://images.unsplash.com/photo-1602492138249-65231d55163a?q=80&w=400', hint: 'lime fruit' },
  { name: 'Grape Blast', color: '#5B3A74', imageUrl: 'https://images.unsplash.com/photo-1596394659353-84024a52c720?q=80&w=400', hint: 'grapes' },
  { name: 'Blueberry Wave', color: '#2C5A9A', imageUrl: 'https://images.unsplash.com/photo-1498557850523-233611029352?q=80&w=400', hint: 'blueberries' },
  { name: 'Mango Tango', color: '#F8A51B', imageUrl: 'https://images.unsplash.com/photo-1591073137096-9f0a8a3c5d6c?q=80&w=400', hint: 'mango' },
  { name: 'Raspberry Rush', color: '#D91D5C', imageUrl: 'https://images.unsplash.com/photo-1521302200723-6441b439e7a9?q=80&w=400', hint: 'raspberries' },
  { name: 'Pearadise', color: '#D1E231', imageUrl: 'https://images.unsplash.com/photo-1604929388364-9f8546a36f45?q=80&w=400', hint: 'pear' },
  { name: 'Strawberry Bliss', color: '#FC5A8D', imageUrl: 'https://images.unsplash.com/photo-1587393855524-087f83d95c9f?q=80&w=400', hint: 'strawberry' },
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
                      <CardContent className="p-0">
                        <div className="relative w-full aspect-square">
                          <Image
                              src={flavor.imageUrl}
                              alt={flavor.name}
                              fill
                              className="object-cover"
                              data-ai-hint={flavor.hint}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                              <FlavorScene flavorName={flavor.name} flavorColor={flavor.color} />
                          </div>
                        </div>
                        <div className="w-full p-4 bg-background/50 backdrop-blur-sm">
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
            <p>&copy; {new Date().getFullYear()} RiskIt. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
