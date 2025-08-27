'use server';
/**
 * @fileOverview An AI tutoring assistant that answers student questions using course materials.
 *
 * - aiTutoringAssistant - A function that handles the question answering process.
 * - AiTutoringAssistantInput - The input type for the aiTutoringAssistant function.
 * - AiTutoringAssistantOutput - The return type for the aiTutoringAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTutoringAssistantInputSchema = z.object({
  question: z.string().describe('The question from the student.'),
  courseMaterials: z.string().describe('The relevant course materials.'),
});
export type AiTutoringAssistantInput = z.infer<typeof AiTutoringAssistantInputSchema>;

const AiTutoringAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the question based on the course materials.'),
});
export type AiTutoringAssistantOutput = z.infer<typeof AiTutoringAssistantOutputSchema>;

export async function aiTutoringAssistant(input: AiTutoringAssistantInput): Promise<AiTutoringAssistantOutput> {
  return aiTutoringAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTutoringAssistantPrompt',
  input: {schema: AiTutoringAssistantInputSchema},
  output: {schema: AiTutoringAssistantOutputSchema},
  prompt: `You are an AI tutoring assistant. Answer the student's question using the provided course materials.

Course Materials: {{{courseMaterials}}}

Question: {{{question}}}

Answer:`,
});

const aiTutoringAssistantFlow = ai.defineFlow(
  {
    name: 'aiTutoringAssistantFlow',
    inputSchema: AiTutoringAssistantInputSchema,
    outputSchema: AiTutoringAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
