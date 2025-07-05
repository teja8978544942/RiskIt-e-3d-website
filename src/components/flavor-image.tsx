'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { generateImageAction } from '@/app/actions';

interface FlavorImageProps {
  flavorName: string;
  hint: string;
}

export function FlavorImage({ flavorName, hint }: FlavorImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generate = async () => {
      setIsLoading(true);
      try {
        const url = await generateImageAction({ flavorName });
        setImageUrl(url);
      } catch (error) {
        console.error(`Failed to generate image for ${flavorName}:`, error);
        setImageUrl('https://placehold.co/300x500.png'); // Fallback image
      } finally {
        setIsLoading(false);
      }
    };

    generate();
  }, [flavorName]);

  if (isLoading || !imageUrl) {
    return (
        <div className="aspect-[3/5] w-full overflow-hidden bg-secondary flex items-center justify-center">
            <Skeleton className="h-full w-full" />
        </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={flavorName}
      width={300}
      height={500}
      className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
      data-ai-hint={hint}
      unoptimized={imageUrl.startsWith('data:')}
    />
  );
}
