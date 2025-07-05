'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

const flavors = [
  { name: 'Orange Burst' },
  { name: 'Lime Zing' },
  { name: 'Grape Blast' },
  { name: 'Blueberry Wave' },
  { name: 'Mango Tango' },
  { name: 'Raspberry Rush' },
  { name: 'Pearadise' },
  { name: 'Strawberry Bliss' },
];

export default function CheckoutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
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
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="flavor">Choose your flavor</Label>
                <Select>
                  <SelectTrigger id="flavor">
                    <SelectValue placeholder="Select a flavor..." />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {flavors.map((flavor) => (
                      <SelectItem key={flavor.name} value={flavor.name}>
                        {flavor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Jane Doe" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="jane.doe@example.com" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button size="lg">Complete Purchase</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
