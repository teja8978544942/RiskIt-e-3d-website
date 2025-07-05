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
import { Terminal } from 'lucide-react';
import { ArrowDown } from 'lucide-react';
import Image from 'next/image';

const initialFlavors = [
  { name: 'Midnight Chocolate', ingredients: 'dark chocolate, cocoa nibs', hint: 'soda can chocolate', imageUrl: 'https://images.unsplash.com/photo-1612230438343-cce33350371b?w=300&h=500&fit=crop&q=80' },
  { name: 'Citrus Surge', ingredients: 'lemon, lime, orange slices', hint: 'soda can citrus', imageUrl: 'https://images.unsplash.com/photo-1619546813926-a78fa6332cd2?w=300&h=500&fit=crop&q=80' },
  { name: 'Berry Blitz', ingredients: 'blueberries, raspberries, strawberries', hint: 'soda can berry', imageUrl: 'https://images.unsplash.com/photo-1595748898950-705a6a3788a4?w=300&h=500&fit=crop&q=80' },
  { name: 'Tropical Fusion', ingredients: 'pineapple, mango, passionfruit', hint: 'soda can tropical', imageUrl: 'https://images.unsplash.com/photo-1553531384-411a247ccd78?w=300&h=500&fit=crop&q=80' },
  { name: 'Arctic Mint', ingredients: 'fresh mint leaves, ice crystals', hint: 'soda can mint', imageUrl: 'https://images.unsplash.com/photo-1600205273392-38dd18c538a8?w=300&h=500&fit=crop&q=80' },
  { name: 'Spiced Apple', ingredients: 'red apples, cinnamon sticks', hint: 'soda can apple', imageUrl: 'https://images.unsplash.com/photo-1579888131237-c1955b9a897f?w=300&h=500&fit=crop&q=80' },
  { name: 'Cherry Bomb', ingredients: 'ripe cherries, cherry blossoms', hint: 'soda can cherry', imageUrl: 'https://images.unsplash.com/photo-1528755699335-422e1b4b18a1?w=300&h=500&fit=crop&q=80' },
  { name: 'Grape Escape', ingredients: 'concord grapes, vine leaves', hint: 'soda can grape', imageUrl: 'https://images.unsplash.com/photo-1618337130-1b33411c5862?w=300&h=500&fit=crop&q=80' },
];

export default async function Home() {
  let flavors = initialFlavors;
  const useApiKey = !!process.env.GOOGLE_API_KEY;

  if (useApiKey) {
    try {
      const imageGenerationPromises = initialFlavors.map(flavor => 
        generateFlavorImage({ flavorName: flavor.name, ingredients: flavor.ingredients })
      );
      const generatedImages = await Promise.all(imageGenerationPromises);
      flavors = initialFlavors.map((flavor, index) => ({
        ...flavor,
        imageUrl: generatedImages[index].imageUrl,
      }));
    } catch (error) {
      console.error("AI image generation failed, falling back to static images.", error);
      // flavors will remain initialFlavors
    }
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
          
          {!useApiKey && (
             <Alert className="max-w-xl mb-8">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Want custom images?</AlertTitle>
              <AlertDescription>
                Add a <code className="font-mono">GOOGLE_API_KEY</code> to your <code className="font-mono">.env</code> file to see AI-generated product shots.
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
                            unoptimized={useApiKey}
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
