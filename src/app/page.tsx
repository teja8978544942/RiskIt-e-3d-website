
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
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { submitFeedback, subscribeToNewsletter } from '@/app/actions';
import { FlavorExplosionAnimation } from '@/components/flavor-explosion-animation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function FeedbackSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit Feedback'}
    </Button>
  );
}

function NewsletterSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="rounded-l-none" disabled={pending}>
      {pending ? 'Signing up...' : 'Sign Up'}
    </Button>
  );
}

export default function Home() {
  const router = useRouter();
  const [animatingFlavor, setAnimatingFlavor] = useState<{name: string, color: string} | null>(null);

  const { toast } = useToast();

  const feedbackFormRef = useRef<HTMLFormElement>(null);
  const [feedbackState, feedbackAction] = useActionState(submitFeedback, null);

  const newsletterFormRef = useRef<HTMLFormElement>(null);
  const [newsletterState, newsletterAction] = useActionState(subscribeToNewsletter, null);

  useEffect(() => {
    if (feedbackState?.type === 'success') {
      toast({
        title: 'Success!',
        description: feedbackState.message,
      });
      feedbackFormRef.current?.reset();
    } else if (feedbackState?.type === 'error') {
      toast({
        title: 'Oops!',
        description: feedbackState.message,
        variant: 'destructive',
      });
    }
  }, [feedbackState, toast]);

  useEffect(() => {
    if (newsletterState?.type === 'success') {
      toast({
        title: 'Success!',
        description: newsletterState.message,
      });
      newsletterFormRef.current?.reset();
    } else if (newsletterState?.type === 'error') {
      toast({
        title: 'Oops!',
        description: newsletterState.message,
        variant: 'destructive',
      });
    }
  }, [newsletterState, toast]);

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
            id="feedback"
            className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl text-center">
              <h2 className="mb-4 font-headline text-4xl font-bold md:text-6xl">
                Share Your Thoughts
              </h2>
              <p className="mb-8 text-base text-muted-foreground md:text-lg">
                We're always looking to improve. Let us know what you think!
              </p>
              <Card className="text-left shadow-lg">
                <CardContent className="p-8">
                  <form ref={feedbackFormRef} action={feedbackAction} className="grid gap-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="feedback-name">Name</Label>
                        <Input id="feedback-name" name="name" placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="feedback-email">Email</Label>
                        <Input
                          id="feedback-email"
                          name="email"
                          type="email"
                          placeholder="Your email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feedback-message">Message</Label>
                      <Textarea
                        id="feedback-message"
                        name="message"
                        placeholder="Your feedback..."
                        rows={5}
                      />
                    </div>
                    <div className="flex justify-end">
                      <FeedbackSubmitButton />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
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
          
          <section id="signup" className="bg-secondary py-24">
            <div className="container mx-auto max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold md:text-5xl">Stay in the Loop</h2>
              <p className="mb-8 mt-4 text-base text-secondary-foreground/80 md:text-lg">
                Sign up for our newsletter to get the latest on new flavors, deals, and adventures.
              </p>
              <form ref={newsletterFormRef} action={newsletterAction} className="mx-auto flex max-w-md">
                <Input name="email" type="email" placeholder="Enter your email address" className="rounded-r-none focus:z-10 text-base" />
                <NewsletterSubmitButton />
              </form>
            </div>
          </section>

          <footer className="h-[50vh] flex items-center justify-center text-center text-foreground/60">
              <p>&copy; {new Date().getFullYear()} RiskIt. All rights reserved.</p>
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
