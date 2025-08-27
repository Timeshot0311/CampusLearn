

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const grades = [
  { assignment: "Problem Set 1", course: "Quantum Computing", grade: "A-", score: "92/100" },
  { assignment: "Lab Report 1", course: "Organic Chemistry", grade: "B+", score: "88/100" },
  { assignment: "Midterm Exam", course: "Ancient Philosophy", grade: "A", score: "95/100" },
  { assignment: "Problem Set 2", course: "Quantum Computing", grade: "B", score: "85/100" },
  { assignment: "Essay on Socrates", course: "Ancient Philosophy", grade: "A-", score: "91/100" },
];

export default function GradesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Grades</h1>
       <Card>
        <CardHeader>
          <CardTitle>My Grade Report</CardTitle>
          <CardDescription>A summary of your performance across all courses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.assignment}>
                  <TableCell className="font-medium">{grade.assignment}</TableCell>
                  <TableCell>{grade.course}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{grade.grade}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{grade.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
