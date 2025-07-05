
import { CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "./ui/label";

export function CheckoutFormSkeleton() {
  return (
    <>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="flavor">Choose your flavor</Label>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Skeleton className="h-11 w-36" />
      </CardFooter>
    </>
  );
}
