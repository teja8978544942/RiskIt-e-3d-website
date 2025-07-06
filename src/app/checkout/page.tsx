
'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckoutForm } from '@/components/checkout-form';
import { CheckoutFormSkeleton } from '@/components/checkout-form-skeleton';
import { CheckoutCanPreview } from '@/components/checkout-can-preview';
import { flavors } from '@/lib/flavors';
import { Skeleton } from '@/components/ui/skeleton';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedFlavorName, setSelectedFlavorName] = useState<string | null>(null);

  useEffect(() => {
    const flavorFromUrl = searchParams.get('flavor');
    if (flavorFromUrl && flavors.some(f => f.name === flavorFromUrl)) {
      setSelectedFlavorName(flavorFromUrl);
    } else if (flavors.length > 0) {
      setSelectedFlavorName(flavors[0].name);
    }
  }, [searchParams]);

  const selectedFlavor = useMemo(() => {
    if (!selectedFlavorName) return null;
    return flavors.find(f => f.name === selectedFlavorName) || null;
  }, [selectedFlavorName]);

  const handleFlavorChange = (flavorName: string) => {
    setSelectedFlavorName(flavorName);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('flavor', flavorName);
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950 lg:p-8">
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button variant="outline" className="bg-background/80 backdrop-blur-sm">
            &larr; Back to Home
          </Button>
        </Link>
      </div>

      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 flex h-[50vh] min-h-[400px] w-full items-center justify-center lg:order-1 lg:h-full">
          {selectedFlavor ? (
            <CheckoutCanPreview 
              key={selectedFlavor.name} 
              flavorName={selectedFlavor.name} 
              flavorColor={selectedFlavor.color} 
            />
          ) : (
            <Skeleton className="h-64 w-64 rounded-full" />
          )}
        </div>
        
        <div className="order-1 flex w-full items-center justify-center lg:order-2">
          <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-3xl md:text-4xl">Secure Checkout</CardTitle>
              <CardDescription>
                You're just one step away from tasting the adventure.
              </CardDescription>
            </CardHeader>
            {selectedFlavorName ? (
              <CheckoutForm 
                selectedFlavor={selectedFlavorName}
                onFlavorChange={handleFlavorChange} 
              />
            ) : (
              <CheckoutFormSkeleton />
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<CheckoutPageSkeleton />}>
            <CheckoutPageContent />
        </Suspense>
    );
}

function CheckoutPageSkeleton() {
    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950 lg:p-8">
            <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
                <div className="relative order-2 flex h-full min-h-[400px] w-full items-center justify-center lg:order-1">
                    <Skeleton className="h-64 w-64 rounded-full"/>
                </div>
                <div className="order-1 flex w-full items-center justify-center lg:order-2">
                    <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-xl">
                        <CardHeader>
                            <Skeleton className="h-10 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CheckoutFormSkeleton />
                    </Card>
                </div>
            </div>
        </main>
    );
}
