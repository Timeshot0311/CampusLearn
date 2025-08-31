"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { Quiz, Question } from '@/services/topic-service';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

type QuizTakerDialogProps = {
  quiz: Quiz;
};

export function QuizTakerDialog({ quiz }: QuizTakerDialogProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [open, setOpen] = useState(false);

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctIndex) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setSubmitted(true);
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  }
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Reset state when dialog is closed
    if (!isOpen) {
      handleRetake();
    }
  };

  const allQuestionsAnswered = Object.keys(answers).length === quiz.questions.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">Take Quiz</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{quiz.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-6">
            {!submitted ? (
            <div className="py-4 space-y-6">
                {quiz.questions.map((question, qIndex) => (
                <Card key={qIndex}>
                    <CardHeader>
                        <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                        <p className="pt-2">{question.text}</p>
                    </CardHeader>
                    <CardContent>
                    <RadioGroup
                        value={answers[qIndex]?.toString()}
                        onValueChange={(value) => handleAnswerChange(qIndex, parseInt(value))}
                        className="space-y-2"
                    >
                        {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}o${oIndex}`} />
                            <Label htmlFor={`q${qIndex}o${oIndex}`}>{option}</Label>
                        </div>
                        ))}
                    </RadioGroup>
                    </CardContent>
                </Card>
                ))}
            </div>
            ) : (
            <div className="py-4 space-y-6">
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Quiz Complete!</CardTitle>
                        <CardDescription>You scored</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-bold">{score} / {quiz.questions.length}</p>
                        <p className="text-2xl font-semibold mt-2">
                            {((score / quiz.questions.length) * 100).toFixed(0)}%
                        </p>
                    </CardContent>
                </Card>
                <div>
                    <h3 className="text-xl font-bold mb-4">Review Your Answers</h3>
                    {quiz.questions.map((question, qIndex) => {
                        const userAnswer = answers[qIndex];
                        const isCorrect = userAnswer === question.correctIndex;
                        return (
                            <Card key={qIndex} className="mb-4">
                                <CardHeader>
                                    <CardTitle className="text-base flex justify-between items-center">
                                        <span>{qIndex + 1}. {question.text}</span>
                                        {isCorrect ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {question.options.map((option, oIndex) => {
                                            const isUserAnswer = oIndex === userAnswer;
                                            const isCorrectAnswer = oIndex === question.correctIndex;

                                            return (
                                                <div key={oIndex} className={cn(
                                                    "p-2 rounded-md my-1 text-sm",
                                                    isCorrectAnswer && "bg-green-100 dark:bg-green-900/30",
                                                    isUserAnswer && !isCorrectAnswer && "bg-red-100 dark:bg-red-900/30",
                                                )}>
                                                    {isUserAnswer && !isCorrectAnswer && <strong>Your Answer: </strong>}
                                                    {isCorrectAnswer && <strong>Correct Answer: </strong>}
                                                    {!isUserAnswer && !isCorrectAnswer && <span>&nbsp;&nbsp;&nbsp;</span>}
                                                    {option}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {question.explanation && (
                                        <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded-md">
                                            <strong>Explanation:</strong> {question.explanation}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
            )}
        </ScrollArea>

        <DialogFooter>
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={!allQuestionsAnswered}>Submit Answers</Button>
          ) : (
            <>
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
                <Button onClick={handleRetake}>Retake Quiz</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
