'use server';
/**
 * @fileOverview A flow for generating images of RiskIt soda flavors.
 *
 * - generateFlavorImage - Generates an image for a given soda flavor.
 * - GenerateFlavorImageInput - The input type for the generateFlavorImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateFlavorImageInputSchema = z.object({
  flavorName: z.string().describe('The name of the soda flavor, e.g., "Midnight Chocolate".'),
});
export type GenerateFlavorImageInput = z.infer<typeof GenerateFlavorImageInputSchema>;

// The output will be the data URI of the generated image.
const GenerateFlavorImageOutputSchema = z.string();

export async function generateFlavorImage(input: GenerateFlavorImageInput): Promise<string> {
  return generateFlavorImageFlow(input);
}

const generateFlavorImageFlow = ai.defineFlow(
  {
    name: 'generateFlavorImageFlow',
    inputSchema: GenerateFlavorImageInputSchema,
    outputSchema: GenerateFlavorImageOutputSchema,
  },
  async ({ flavorName }) => {
    const prompt = `A dramatic, photorealistic product shot of a glass soda bottle. The bottle has a sleek, modern design and features the word "RiskIt" prominently on its label in a bold, adventurous font.

The bottle is surrounded by the core ingredients of the ${flavorName} flavor. For example, if the flavor is 'Midnight Chocolate', show rich dark chocolate pieces and cocoa powder. If it's 'Citrus Surge', show vibrant lemon and lime slices with a splash of juice.

The background is a dynamic and abstract splash of colors and textures that complement the flavor. The lighting is dramatic, highlighting the bottle and ingredients, creating a sense of energy and excitement. The overall mood is bold, premium, and adventurous.`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    if (!media) {
      throw new Error('Image generation failed to return media.');
    }

    return media.url;
  }
);
