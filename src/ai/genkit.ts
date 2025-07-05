import { genkit } from 'genkit';
import { googleAI } from 'genkit/plugins/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
