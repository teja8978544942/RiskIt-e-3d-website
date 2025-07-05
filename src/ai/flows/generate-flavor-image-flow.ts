'use server';
/**
 * @fileOverview An AI flow to generate a stylized product image for a soda flavor.
 *
 * - generateFlavorImage - A function that generates an image for a given flavor.
 * - GenerateFlavorImageInput - The input type for the function.
 * - GenerateFlavorImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFlavorImageInputSchema = z.object({
  flavorName: z.string().describe('The name of the soda flavor, e.g., "Berry Blitz".'),
  ingredients: z.string().describe('A comma-separated list of ingredients for the flavor, e.g., "blueberries, raspberries, strawberries".'),
});
export type GenerateFlavorImageInput = z.infer<typeof GenerateFlavorImageInputSchema>;

const GenerateFlavorImageOutputSchema = z.object({
  imageUrl: z.string().describe("The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateFlavorImageOutput = z.infer<typeof GenerateFlavorImageOutputSchema>;


export async function generateFlavorImage(input: GenerateFlavorImageInput): Promise<GenerateFlavorImageOutput> {
  return generateFlavorImageFlow(input);
}

const generateFlavorImageFlow = ai.defineFlow(
  {
    name: 'generateFlavorImageFlow',
    inputSchema: GenerateFlavorImageInputSchema,
    outputSchema: GenerateFlavorImageOutputSchema,
  },
  async ({ flavorName, ingredients }) => {
    const prompt = `A photorealistic product shot of a premium soda in a clear glass bottle. The brand is 'RiskIt'.
    The bottle is the central focus, looking crisp and refreshing.
    The flavor is '${flavorName}'.
    The background is a clean, monochromatic studio backdrop that vibrantly matches the flavor's color palette.
    Floating around the bottle are the fresh, key ingredients for this flavor: ${ingredients}.
    The lighting is dramatic and modern, creating beautiful highlights on the bottle and ingredients.
    The overall style should be elegant, bold, and highly appetizing, similar to high-end beverage commercials.
    The bottle must have a minimalist label with the text 'RiskIt' and below it, in smaller text, '${flavorName}'.`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    const imageUrl = media.url;
    if (!imageUrl) {
        throw new Error('Image generation failed to return a data URI.');
    }

    return { imageUrl };
  }
);
