import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Target, Users, Calendar, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch quick stats
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact" })
    .eq("user_id", user?.id)

  const { data: completedTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact" })
    .eq("user_id", user?.id)
    .eq("status", "completed")

  const { data: goals } = await supabase
    .from("goals")
    .select("*", { count: "exact" })
    .eq("user_id", user?.id)
    .eq("is_active", true)

  const { data: clients } = await supabase
    .from("clients")
    .select("*", { count: "exact" })
    .eq("user_id", user?.id)

  const stats = [
    {
      title: "Total Tasks",
      value: tasks?.length || 0,
      description: `${completedTasks?.length || 0} completed`,
      icon: CheckSquare,
      color: "text-blue-600",
    },
    {
      title: "Active Goals",
      value: goals?.length || 0,
      description: "Goals in progress",
      icon: Target,
      color: "text-green-600",
    },
    {
      title: "Clients",
      value: clients?.length || 0,
      description: "Total clients",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "This Week",
      value: "0",
      description: "Events scheduled",
      icon: Calendar,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your life dashboard today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest tasks and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Activity feed coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/dashboard/tasks"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Add Task</div>
              <div className="text-sm text-muted-foreground">Create a new task</div>
            </a>
            <a
              href="/dashboard/goals"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Set Goal</div>
              <div className="text-sm text-muted-foreground">Define a new goal</div>
            </a>
            <a
              href="/dashboard/clients"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Add Client</div>
              <div className="text-sm text-muted-foreground">Register new client</div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
