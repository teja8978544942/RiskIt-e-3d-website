
'use client';

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { flavors } from "@/lib/flavors";

interface CheckoutFormProps {
  selectedFlavor: string;
  onFlavorChange: (flavorName: string) => void;
}

export function CheckoutForm({ selectedFlavor, onFlavorChange }: CheckoutFormProps) {
  return (
    <>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()} className="w-full">
          <div className="grid w-full items-center gap-6">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="flavor">Choose your flavor</Label>
              <Select onValueChange={onFlavorChange} value={selectedFlavor}>
                <SelectTrigger id="flavor" className="text-base">
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
            <div className="flex flex-col space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Jane Doe" className="text-base" />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="jane.doe@example.com" className="text-base" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4 pt-2">
        <Button size="lg" className="w-full py-6 text-lg font-bold">Complete Purchase</Button>
        <p className="text-xs text-center text-muted-foreground">
          By completing your purchase, you agree to our Terms of Service.
        </p>
      </CardFooter>
    </>
  );
}
