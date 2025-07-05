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
    const prompt = `Create an ultra-realistic, professional product photograph of a single glass soda bottle for a premium brand called "RiskIt". The flavor of the soda is "${flavorName}".

The bottle should look cold, with subtle condensation and fine water droplets on its surface. The label design is modern and minimalist, clearly displaying the "RiskIt" brand name and the flavor "${flavorName}".

The bottle is set on a clean, slightly reflective surface like polished concrete or marble. The background is simple and elegantly blurred, suggesting a high-end studio or kitchen setting.

The lighting must be soft and professional, mimicking a studio setup with key and fill lights. This should create gentle highlights and realistic shadows that define the bottle's shape and accentuate the texture of the condensation. Avoid any dramatic, abstract, or unnatural elements. The final image should have the quality of a high-resolution photograph found in a premium beverage advertisement.`;

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
