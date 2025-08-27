
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GradesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Grades</h1>
       <Card>
        <CardHeader>
          <CardTitle>Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your grades will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
