
'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { flavors } from "@/lib/flavors";

export function CheckoutForm() {
  const searchParams = useSearchParams();
  const [selectedFlavor, setSelectedFlavor] = useState('');

  useEffect(() => {
    const flavorFromUrl = searchParams.get('flavor');
    if (flavorFromUrl && flavors.some(f => f.name === flavorFromUrl)) {
      setSelectedFlavor(flavorFromUrl);
    }
  }, [searchParams]);

  const handleFlavorChange = (value: string) => {
    setSelectedFlavor(value);
  };

  return (
    <>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="flavor">Choose your flavor</Label>
              <Select onValueChange={handleFlavorChange} value={selectedFlavor}>
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
    </>
  );
}
