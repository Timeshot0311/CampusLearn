
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">My Courses</h1>
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <p>A list of your courses will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
