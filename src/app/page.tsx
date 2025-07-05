import { generateFlavorImage } from '@/ai/flows/generate-flavor-image-flow';
import { Scene } from '@/components/scene';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ArrowDown, TriangleAlert } from 'lucide-react';
import Image from 'next/image';

const flavors = [
    { name: 'Midnight Chocolate', hint: 'soda bottle chocolate', ingredients: 'dark chocolate chunks, cocoa beans', fallbackUrl: 'https://images.unsplash.com/photo-1572492398242-2d8c0f2d1e5d?w=300&h=500&fit=crop&q=80' },
    { name: 'Citrus Surge', hint: 'soda bottle citrus', ingredients: 'orange slices, lemon wedges, lime', fallbackUrl: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=300&h=500&fit=crop&q=80' },
    { name: 'Berry Blitz', hint: 'soda bottle berry', ingredients: 'blueberries, raspberries, strawberries', fallbackUrl: 'https://images.unsplash.com/photo-1628295987711-2d744252d6a5?w=300&h=500&fit=crop&q=80' },
    { name: 'Tropical Fusion', hint: 'soda bottle tropical', ingredients: 'pineapple chunks, mango slices, passion fruit', fallbackUrl: 'https://images.unsplash.com/photo-1542289948-83e07f5941b3?w=300&h=500&fit=crop&q=80' },
    { name: 'Arctic Mint', hint: 'soda bottle mint', ingredients: 'fresh mint leaves, ice crystals', fallbackUrl: 'https://images.unsplash.com/photo-1599602138162-fa5a5664367f?w=300&h=500&fit=crop&q=80' },
    { name: 'Spiced Apple', hint: 'soda bottle apple', ingredients: 'red apple slices, cinnamon sticks', fallbackUrl: 'https://images.unsplash.com/photo-1619546813926-a78fa6332cd2?w=300&h=500&fit=crop&q=80' },
    { name: 'Cherry Bomb', hint: 'soda bottle cherry', ingredients: 'ripe red cherries', fallbackUrl: 'https://images.unsplash.com/photo-1597873839242-3536b694c3c3?w=300&h=500&fit=crop&q=80' },
    { name: 'Grape Escape', hint: 'soda bottle grape', ingredients: 'purple grapes', fallbackUrl: 'https://images.unsplash.com/photo-1587322838329-a417578705b1?w=300&h=500&fit=crop&q=80' },
];

export default async function Home() {
  const hasApiKey = !!process.env.GOOGLE_API_KEY;

  let flavorsWithImages = flavors.map(f => ({ ...f, imageUrl: f.fallbackUrl }));

  if (hasApiKey) {
    const imageGenerationPromises = flavors.map(flavor =>
      generateFlavorImage({
        flavorName: flavor.name,
        ingredients: flavor.ingredients,
      })
    );

    const results = await Promise.allSettled(imageGenerationPromises);

    flavorsWithImages = flavors.map((flavor, index) => {
      const result = results[index];
      if (result.status === 'fulfilled' && result.value.imageUrl) {
        return { ...flavor, imageUrl: result.value.imageUrl };
      } else {
        if (result.status === 'rejected') {
          console.error(`Image generation failed for ${flavor.name}:`, result.reason);
        }
        return { ...flavor, imageUrl: flavor.fallbackUrl };
      }
    });
  }
  
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
          
          {!hasApiKey && (
            <Alert variant="default" className="mb-8 max-w-2xl">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Image Generation Disabled</AlertTitle>
              <AlertDescription>
                To see unique, AI-generated images for each flavor, please add your Google AI API key to the .env file.
                Currently displaying fallback images.
              </AlertDescription>
            </Alert>
          )}

          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl"
          >
            <CarouselContent>
              {flavorsWithImages.map((flavor, index) => (
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
