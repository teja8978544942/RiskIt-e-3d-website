'use server';
/**
 * @fileOverview An AI flow for generating images of flavored drink bottles.
 *
 * - generateFlavorImage - A function that generates a product image.
 * - GenerateFlavorImageInput - The input type for the generateFlavorImage function.
 * - GenerateFlavorImageOutput - The return type for the generateFlavorImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlavorImageInputSchema = z.object({
  flavorName: z.string().describe('The name of the drink flavor.'),
  fruitDescription: z
    .string()
    .describe('A description of the fruits to be featured with the bottle.'),
});
export type GenerateFlavorImageInput = z.infer<
  typeof GenerateFlavorImageInputSchema
>;

const GenerateFlavorImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateFlavorImageOutput = z.infer<
  typeof GenerateFlavorImageOutputSchema
>;

export async function generateFlavorImage(
  input: GenerateFlavorImageInput
): Promise<GenerateFlavorImageOutput> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error(
      'GOOGLE_API_KEY is not set. Please add it to your .env file to generate images.'
    );
  }
  return generateFlavorImageFlow(input);
}

const generateFlavorImageFlow = ai.defineFlow(
  {
    name: 'generateFlavorImageFlow',
    inputSchema: GenerateFlavorImageInputSchema,
    outputSchema: GenerateFlavorImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A highly realistic, commercial product photograph of a "RiskIt" brand beverage can. The flavor is '${input.flavorName}'.
The can must be the centerpiece, look premium, and be covered in fine condensation.
The background should be a dark, dramatic setting that features the key ingredients, ${input.fruitDescription}, artfully arranged and complementing the can.
The ingredients should look fresh, delicious, and dynamic.
Include dynamic, colorful liquid splashes that match the flavor profile.
The lighting must be professional and cinematic, highlighting the textures of both the can and the ingredients.
The can must clearly and elegantly display the "RiskIt" logo and the flavor name "${input.flavorName}".`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed.');
    }

    return {imageUrl: media.url};
  }
);
