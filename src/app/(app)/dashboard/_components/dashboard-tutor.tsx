
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FileEdit, Lightbulb, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Submission, getTutorSubmissions } from "@/services/assignment-service";
import { FeedbackGeneratorDialog } from "@/components/feedback-generator-dialog";
import { Topic, getTopics } from "@/services/topic-service";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { UserProfileHoverCard } from "@/components/user-profile-hover-card";
import { User } from "@/services/user-service";

const performanceData = [
  { name: 'Quiz 1', avgScore: 78 },
  { name: 'Midterm', avgScore: 85 },
  { name: 'Quiz 2', avgScore: 82 },
  { name: 'P. Set 3', avgScore: 91 },
  { name: 'Final', avgScore: 88 },
];

function StudentQuestionsCard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [topics, setTopics] = useState<Topic[]>([]);

    useEffect(() => {
        const fetchTopics = async () => {
            setLoading(true);
            try {
                const allTopics = await getTopics();
                // Filter topics relevant to the tutor/lecturer
                const relevantTopics = allTopics.filter(topic =>
                    user.assignedCourses?.includes(topic.course) && topic.status !== 'Closed'
                );
                setTopics(relevantTopics.sort((a,b) => (b.replies?.[b.replies.length-1]?.timestamp || 0) > (a.replies?.[a.replies.length-1]?.timestamp || 0) ? 1 : -1));
            } catch (error) {
                toast({ title: "Error fetching topics", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        if (user.assignedCourses && user.assignedCourses.length > 0) {
            fetchTopics();
        } else if(user.role !== 'student') {
             // Fetch all for admin/non-students without assigned courses
            const fetchAllTopics = async () => {
                setLoading(true);
                try {
                    const allTopics = await getTopics();
                     setTopics(allTopics.filter(t => t.status !== 'Closed').sort((a,b) => (b.replies?.[b.replies.length-1]?.timestamp || 0) > (a.replies?.[a.replies.length-1]?.timestamp || 0) ? 1 : -1));
                } catch(e) {
                    toast({title: "Error fetching all topics", variant: "destructive"});
                } finally {
                    setLoading(false);
                }
            }
            fetchAllTopics();
        } 
        else {
            setLoading(false);
        }
    }, [toast, user.assignedCourses, user.role]);


    return (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Student Questions</CardTitle>
            <CardDescription>
              Open help topics from students in your courses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <p>Loading questions...</p>
            ) : topics.length > 0 ? (
                <div className="space-y-4">
                    {topics.slice(0, 5).map((topic) => (
                        <div key={topic.id} className="flex items-start justify-between">
                           <div className="flex items-start gap-4">
                                <UserProfileHoverCard user={topic as unknown as User}>
                                    <Link href={`/profile/${topic.authorId}`}>
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={topic.authorAvatar} alt={topic.author} />
                                            <AvatarFallback>{topic.author.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                </UserProfileHoverCard>
                                <div>
                                    <p className="font-medium text-sm">{topic.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        From <UserProfileHoverCard user={topic as unknown as User}><Link href={`/profile/${topic.authorId}`} className="hover:underline">{topic.author}</Link></UserProfileHoverCard> in <span className="font-semibold">{topic.course}</span>
                                    </p>
                                </div>
                           </div>
                           <Button asChild size="sm" variant="outline">
                               <Link href={`/topics/${topic.id}`}>View</Link>
                           </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-6">
                    <MessageSquare className="mx-auto h-12 w-12" />
                    <p className="mt-4">No open questions in your courses.</p>
                </div>
            )}
          </CardContent>
        </Card>
    );
}

export function DashboardTutor() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    useEffect(() => {
        if (!user.id) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [fetchedSubmissions] = await Promise.all([
                    getTutorSubmissions(user.id),
                ]);
                setSubmissions(fetchedSubmissions);
            } catch (error) {
                 toast({ title: "Error fetching tutor data", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast, user.id]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Total Students</CardTitle>
                    <CardDescription>Across all your courses</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">128</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Pending Submissions</CardTitle>
                    <CardDescription>Assignments needing review</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{loading ? "..." : submissions.length}</p>
                </CardContent>
            </Card>
        </div>
        <StudentQuestionsCard />
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Student Performance</CardTitle>
            <CardDescription>Average scores on recent assessments.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-primary"/>
                    <CardTitle className="font-headline">Feature Moved</CardTitle>
                </div>
                <CardDescription>
                The "Smart Quiz Generation" feature can now be found on the topic detail pages to better associate quizzes with specific learning discussions.
                </CardDescription>
            </CardHeader>
        </Card>
         <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
                <FileEdit className="h-6 w-6 text-primary"/>
                <CardTitle className="font-headline">AI Feedback Generator</CardTitle>
            </div>
            <CardDescription>
              Draft personalized feedback for student assignments.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <FeedbackGeneratorDialog />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
