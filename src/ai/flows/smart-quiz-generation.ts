'use server';

/**
 * @fileOverview This file implements the Smart Quiz Generation flow.
 *
 * It allows tutors to automatically generate practice quizzes from uploaded learning materials.
 * - generateQuiz - A function that generates a quiz from learning materials.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  learningMaterial: z
    .string()
    .describe('The learning material to generate a quiz from.'),
  numberOfQuestions: z
    .number()
    .describe('The number of questions to generate in the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quiz: z.string().describe('The generated quiz in JSON format.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert quiz generator. You will generate a quiz from the given learning material.

Learning Material: {{{learningMaterial}}}

Number of Questions: {{{numberOfQuestions}}}

The quiz should be in JSON format. Each question should have the following fields:
- question: the question text
- options: an array of possible answers
- answer: the correct answer (index of the options array)

Example:
{
  "quiz": [
    {
      "question": "What is the capital of France?",
      "options": ["Berlin", "Paris", "Rome", "Madrid"],
      "answer": 1
    },
    {
      "question": "What is the highest mountain in the world?",
      "options": ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"],
      "answer": 2
    }
  ]
}

Make sure the quiz is well-formatted JSON and can be parsed without errors.
`, // Ensure valid JSON is returned
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
