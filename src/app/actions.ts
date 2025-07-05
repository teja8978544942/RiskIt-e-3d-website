'use server';

import { generateFlavorImage, GenerateFlavorImageInput } from '@/ai/flows/generate-flavor-image-flow';

export async function generateImageAction(input: GenerateFlavorImageInput): Promise<string> {
    try {
        const imageUrl = await generateFlavorImage(input);
        return imageUrl;
    } catch (error) {
        console.error('Error generating image:', error);
        // Return a placeholder or throw an error to be handled by the client
        return 'https://placehold.co/300x500.png';
    }
}
