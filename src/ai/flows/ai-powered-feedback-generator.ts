'use server';
/**
 * @fileOverview An AI-powered feedback generator for assignments.
 *
 * - generateAssignmentFeedback - A function that generates personalized feedback on assignments.
 * - GenerateAssignmentFeedbackInput - The input type for the generateAssignmentFeedback function.
 * - GenerateAssignmentFeedbackOutput - The return type for the generateAssignmentFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAssignmentFeedbackInputSchema = z.object({
  studentName: z.string().describe('The name of the student who submitted the assignment.'),
  assignmentDescription: z.string().describe('A description of the assignment.'),
  studentSubmission: z.string().describe('The student\'s submission for the assignment.'),
  tutorFeedbackGuidelines: z.string().describe('Guidelines from the tutor on what to focus on in the feedback.'),
  courseName: z.string().describe('The name of the course the assignment belongs to.'),
});
export type GenerateAssignmentFeedbackInput = z.infer<typeof GenerateAssignmentFeedbackInputSchema>;

const GenerateAssignmentFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback on the assignment.'),
});
export type GenerateAssignmentFeedbackOutput = z.infer<typeof GenerateAssignmentFeedbackOutputSchema>;

export async function generateAssignmentFeedback(
  input: GenerateAssignmentFeedbackInput
): Promise<GenerateAssignmentFeedbackOutput> {
  return generateAssignmentFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAssignmentFeedbackPrompt',
  input: {schema: GenerateAssignmentFeedbackInputSchema},
  output: {schema: GenerateAssignmentFeedbackOutputSchema},
  prompt: `You are an AI assistant helping tutors draft personalized feedback for their students' assignments.

  The student's name is: {{{studentName}}}.
  The assignment is for the course: {{{courseName}}}.
  The assignment description is: {{{assignmentDescription}}}.
  The student's submission is: {{{studentSubmission}}}.
  The tutor has provided the following guidelines for the feedback: {{{tutorFeedbackGuidelines}}}.

  Based on the student's submission and the tutor's guidelines, draft personalized feedback for the assignment. The feedback should be constructive, specific, and actionable.
  `,
});

const generateAssignmentFeedbackFlow = ai.defineFlow(
  {
    name: 'generateAssignmentFeedbackFlow',
    inputSchema: GenerateAssignmentFeedbackInputSchema,
    outputSchema: GenerateAssignmentFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
