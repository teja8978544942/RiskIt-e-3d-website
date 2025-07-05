import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: process.env.GOOGLE_API_KEY ? [googleAI()] : [],
  model: 'googleai/gemini-2.0-flash',
});
