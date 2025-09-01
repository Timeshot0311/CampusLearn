
"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateQuiz } from "@/ai/flows/smart-quiz-generation";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Lightbulb, Upload } from "lucide-react";
import { Quiz, Question } from "@/services/topic-service";

type QuizGeneratorDialogProps = {
  // allow async onSave implementations
  onSave: (quiz: Omit<Quiz, "id">) => void | Promise<void>;
};

type NormalizedQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
};

function coerceStringArray(val: any): string[] {
  if (Array.isArray(val)) return val.map((x) => String(x));
  return [];
}

/**
 * Accepts many possible AI shapes and returns a normalized list of questions.
 * Supported shapes (examples):
 * - { quiz: [...] }
 * - { questions: [...] }
 * - [ ... ] (top-level array)
 * - question keys: question | prompt | text
 * - options keys: options | choices | answers
 * - correct keys: answer | answerIndex | correct | correctOption
 */
function normalizeAiQuestions(ai: any): NormalizedQuestion[] {
  const root =
    Array.isArray(ai) ? ai :
    Array.isArray(ai?.quiz) ? ai.quiz :
    Array.isArray(ai?.questions) ? ai.questions :
    [];

  if (!Array.isArray(root)) return [];

  return root.map((q: any) => {
    const question = String(q?.question ?? q?.prompt ?? q?.text ?? "").trim();
    const options =
      coerceStringArray(q?.options).length ? coerceStringArray(q?.options) :
      coerceStringArray(q?.choices).length ? coerceStringArray(q?.choices) :
      coerceStringArray(q?.answers);

    // Try to resolve the correct index
    let answer: number | null = null;

    if (typeof q?.answer === "number") answer = q.answer;
    else if (typeof q?.answerIndex === "number") answer = q.answerIndex;
    else if (typeof q?.correct === "number") answer = q.correct;
    else if (typeof q?.correctOption === "string" && options.length) {
      const idx = options.findIndex((o) => o.trim() === String(q.correctOption).trim());
      answer = idx >= 0 ? idx : null;
    }

    // explanation (optional)
    const explanation = (q?.explanation ?? q?.why ?? q?.reason) ? String(q?.explanation ?? q?.why ?? q?.reason) : undefined;

    return {
      question,
      options,
      answer: typeof answer === "number" ? answer : -1,
      explanation,
    };
  });
}

function validateQuestions(qs: NormalizedQuestion[]): { ok: boolean; message?: string } {
  if (!qs.length) return { ok: false, message: "No questions were found in the AI output." };

  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    if (!q.question) return { ok: false, message: `Question ${i + 1} is missing text.` };
    if (!Array.isArray(q.options) || q.options.length < 2)
      return { ok: false, message: `Question ${i + 1} must have at least 2 options.` };
    if (typeof q.answer !== "number" || q.answer < 0 || q.answer >= q.options.length)
      return { ok: false, message: `Question ${i + 1} has an invalid correct option index.` };
  }
  return { ok: true };
}

export function QuizGeneratorDialog({ onSave }: QuizGeneratorDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [material, setMaterial] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizTitle, setQuizTitle] = useState("");
  const [generatedQuizJson, setGeneratedQuizJson] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedQuizJson(null);
    try {
      const result = await generateQuiz({
        learningMaterial: material,
        numberOfQuestions: numQuestions,
      });
      // store exactly as a string (handles both string/object returns)
      const payload = typeof result?.quiz === "string" ? result.quiz : JSON.stringify(result?.quiz ?? result);
      setGeneratedQuizJson(payload);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Quiz",
        description: "There was an issue creating the quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!generatedQuizJson || !quizTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please generate a quiz and provide a title before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsed = JSON.parse(generatedQuizJson);
      const normalized = normalizeAiQuestions(parsed);

      const valid = validateQuestions(normalized);
      if (!valid.ok) {
        toast({
          title: "Quiz Validation Failed",
          description: valid.message ?? "The quiz data is not in the expected format.",
          variant: "destructive",
        });
        return;
      }

      const quizToSave: Omit<Quiz, "id"> = {
        title: quizTitle.trim(),
        // Map to your service’s exact expected shape:
        questions: normalized.map((q) => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
          ...(q.explanation ? { explanation: q.explanation } : {}),
        })),
      };

      // If the parent returns a promise, await it so we can show proper feedback.
      await Promise.resolve(onSave(quizToSave));

      setOpen(false);
      // reset for next time
      setMaterial("");
      setNumQuestions(5);
      setQuizTitle("");
      setGeneratedQuizJson(null);

      toast({ title: "Quiz Saved", description: "Your quiz was saved to this topic." });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error Saving Quiz",
        description: error?.message ?? "The generated quiz data was not in the expected format.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setMaterial(text);
        toast({ title: "File Loaded", description: `${file.name} has been loaded as learning material.` });
      };
      reader.onerror = () => {
        toast({ title: "Error Reading File", variant: "destructive" });
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Lightbulb className="mr-2 h-4 w-4" />
          Create New Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Smart Quiz Generation</DialogTitle>
          <DialogDescription>
            Paste in any learning material (e.g., lecture notes, an article, a video transcript) to automatically generate a practice quiz for this topic.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="quiz-title">Quiz Title</Label>
            <Input
              id="quiz-title"
              placeholder="e.g., 'Chapter 1 Review'"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between items-center mb-2">
                <Label htmlFor="material">Learning Material</Label>
                <Button asChild variant="outline" size="sm">
                    <label htmlFor="material-file-upload" className="cursor-pointer flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload File
                    </label>
                </Button>
                <Input id="material-file-upload" type="file" className="hidden" accept=".txt,.md,.html,.json,text/*" onChange={handleFileChange} />
            </div>
            <Textarea
              id="material"
              placeholder="Paste your content here or upload a file..."
              rows={10}
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="num-questions">Number of Questions</Label>
            <Input
              id="num-questions"
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-24"
            />
          </div>

          <Button onClick={handleGenerate} disabled={loading || !material.trim()} className="w-fit">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Generating..." : "Generate Quiz"}
          </Button>

          {generatedQuizJson && (
            <div className="grid gap-2">
              <Label>Generated Quiz (Preview)</Label>
              <Textarea
                readOnly
                value={(() => {
                  try {
                    return JSON.stringify(JSON.parse(generatedQuizJson), null, 2);
                  } catch {
                    return generatedQuizJson; // already a string; show raw if not JSON
                  }
                })()}
                rows={10}
                className="font-mono text-xs bg-muted"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSaveQuiz} disabled={!generatedQuizJson || !quizTitle.trim()}>
            Save Quiz to Topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
