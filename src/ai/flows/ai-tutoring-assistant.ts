
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

const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['article', 'video', 'audio', 'quiz', 'file', 'youtube']),
  content: z.string(),
  duration: z.string().optional(),
  completed: z.boolean(),
});

const ModuleSchema = z.object({
    id: z.string(),
    title: z.string(),
    lessons: z.array(LessonSchema)
});

const GradeSchema = z.object({
    id: z.string(),
    assignmentName: z.string(),
    grade: z.string(),
    feedback: z.string().optional(),
    date: z.string(),
});

const AiTutoringAssistantInputSchema = z.object({
  question: z.string().describe('The question from the student.'),
  course: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    modules: z.array(ModuleSchema)
  }).describe('The course context for the question.'),
  grades: z.array(GradeSchema).describe("The student's grades for this course."),
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
  prompt: `You are an AI tutoring assistant for a platform called CampusLearn. You must answer the student's question based *only* on the provided course materials and the student's grade history. If the answer cannot be found in the materials, state that you do not have that information in the course content.

Course Title: {{{course.title}}}
Course Description: {{{course.description}}}

Course Modules and Lessons:
{{#each course.modules}}
Module: {{title}}
  {{#each lessons}}
  - Lesson: {{title}} (Type: {{type}})
    Content: {{content}}
  {{/each}}
{{/each}}

Student's Grade History for this Course:
{{#if grades}}
  {{#each grades}}
  - Assignment: "{{assignmentName}}"
    Grade: {{grade}}
    Feedback: {{feedback}}
    Date: {{date}}
  {{/each}}
{{else}}
No grades have been recorded for this course yet.
{{/if}}

Student's Question: {{{question}}}

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
