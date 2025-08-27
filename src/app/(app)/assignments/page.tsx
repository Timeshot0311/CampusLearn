
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssignmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Assignments</h1>
       <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p>A list of your assignments will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
