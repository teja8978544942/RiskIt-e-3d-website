
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckoutForm } from '@/components/checkout-form';
import { CheckoutFormSkeleton } from '@/components/checkout-form-skeleton';

export default function CheckoutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4" suppressHydrationWarning={true}>
       <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="outline">
            &larr; Back to Home
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Checkout</CardTitle>
          <CardDescription>
            You're just one step away from tasting the adventure.
          </CardDescription>
        </CardHeader>
        <Suspense fallback={<CheckoutFormSkeleton />}>
          <CheckoutForm />
        </Suspense>
      </Card>
    </main>
  );
}
