"use client"

import { useEffect, useState } from "react"
import { useSubscriptionStore } from "@/stores/subscription-store"
import { useBudgetStore } from "@/stores/budget-store"
import { SubscriptionDialog } from "@/components/modules/budget/subscription-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Plus, MoreVertical, Edit, Trash2, DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { format, addMonths, subMonths } from "date-fns"
import type { Subscription } from "@/types/subscription.types"
import type { Budget } from "@/types/budget.types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function BudgetPage() {
  const {
    subscriptions,
    loading: subsLoading,
    fetchSubscriptions,
    deleteSubscription,
    getMonthlyTotal,
    getYearlyTotal,
  } = useSubscriptionStore()

  const {
    budgets,
    loading: budgetsLoading,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    updateSpent,
    getBudgetStats,
  } = useBudgetStore()

  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().substring(0, 7))

  const [budgetForm, setBudgetForm] = useState({
    category: "",
    amount: 0,
    spent: 0,
  })

  useEffect(() => {
    fetchSubscriptions()
    fetchBudgets(currentMonth)
  }, [fetchSubscriptions, fetchBudgets, currentMonth])

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setSubscriptionDialogOpen(true)
  }

  const handleDeleteSubscription = async (subscription: Subscription) => {
    if (confirm(`Are you sure you want to delete ${subscription.name}?`)) {
      await deleteSubscription(subscription.id)
      toast.success("Subscription deleted")
    }
  }

  const handleCreateBudget = () => {
    setSelectedBudget(null)
    setBudgetForm({ category: "", amount: 0, spent: 0 })
    setBudgetDialogOpen(true)
  }

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget)
    setBudgetForm({
      category: budget.category,
      amount: budget.amount,
      spent: budget.spent,
    })
    setBudgetDialogOpen(true)
  }

  const handleSaveBudget = async () => {
    if (!budgetForm.category.trim()) {
      toast.error("Category is required")
      return
    }

    if (budgetForm.amount <= 0) {
      toast.error("Amount must be greater than 0")
      return
    }

    try {
      if (selectedBudget) {
        await updateBudget(selectedBudget.id, {
          category: budgetForm.category,
          amount: budgetForm.amount,
          spent: budgetForm.spent,
        })
        toast.success("Budget updated")
      } else {
        await createBudget({
          category: budgetForm.category,
          amount: budgetForm.amount,
          spent: budgetForm.spent,
          month: currentMonth,
        })
        toast.success("Budget created")
      }
      setBudgetDialogOpen(false)
      setBudgetForm({ category: "", amount: 0, spent: 0 })
    } catch (error) {
      toast.error("Failed to save budget")
    }
  }

  const handleDeleteBudget = async (budget: Budget) => {
    if (confirm(`Are you sure you want to delete the ${budget.category} budget?`)) {
      await deleteBudget(budget.id)
      toast.success("Budget deleted")
    }
  }

  const handlePreviousMonth = () => {
    const newMonth = format(subMonths(new Date(currentMonth + "-01"), 1), "yyyy-MM")
    setCurrentMonth(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = format(addMonths(new Date(currentMonth + "-01"), 1), "yyyy-MM")
    setCurrentMonth(newMonth)
  }

  const monthlySubTotal = getMonthlyTotal()
  const yearlySubTotal = getYearlyTotal()
  const budgetStats = getBudgetStats(currentMonth)

  const chartData = budgets.map(b => ({
    name: b.category,
    Budget: b.amount,
    Spent: b.spent,
    Remaining: b.amount - b.spent,
  }))

  const pieData = budgets.map(b => ({
    name: b.category,
    value: b.spent,
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']

  const activeSubscriptions = subscriptions.filter(s => s.is_active)
  const inactiveSubscriptions = subscriptions.filter(s => !s.is_active)

  if (subsLoading || budgetsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Budget & Subscriptions</h1>
          <p className="text-muted-foreground">
            Track your subscriptions and manage monthly budgets
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Subscriptions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlySubTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${yearlySubTotal.toFixed(2)}/year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetStats.percentageUsed.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              ${budgetStats.totalSpent.toFixed(2)} of ${budgetStats.totalBudget.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${budgetStats.remaining < 0 ? 'text-red-500' : ''}`}>
              ${budgetStats.remaining.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {budgetStats.remaining < 0 ? 'Over budget' : 'Available'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Active Subscriptions ({activeSubscriptions.length})</h2>
            <Button onClick={() => {
              setSelectedSubscription(null)
              setSubscriptionDialogOpen(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subscription
            </Button>
          </div>

          {activeSubscriptions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No active subscriptions</h3>
                <p className="text-sm text-muted-foreground mb-4">Add your first subscription to start tracking</p>
                <Button onClick={() => setSubscriptionDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subscription
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeSubscriptions.map((subscription) => (
                <Card key={subscription.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{subscription.name}</CardTitle>
                        {subscription.category && (
                          <CardDescription className="mt-1">{subscription.category}</CardDescription>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditSubscription(subscription)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteSubscription(subscription)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">${subscription.cost}</span>
                      <Badge variant="outline">{subscription.billing_cycle}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Next: {format(new Date(subscription.next_billing_date), "MMM d, yyyy")}</span>
                    </div>
                    {subscription.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t">
                        {subscription.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {inactiveSubscriptions.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mt-8">Inactive Subscriptions ({inactiveSubscriptions.length})</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inactiveSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="opacity-60">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{subscription.name}</CardTitle>
                          {subscription.category && (
                            <CardDescription className="mt-1">{subscription.category}</CardDescription>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSubscription(subscription)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteSubscription(subscription)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">${subscription.cost}</span>
                        <Badge variant="outline">{subscription.billing_cycle}</Badge>
                      </div>
                      <Badge variant="secondary">Inactive</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                ←
              </Button>
              <h2 className="text-xl font-semibold">
                {format(new Date(currentMonth + "-01"), "MMMM yyyy")}
              </h2>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                →
              </Button>
            </div>
            <Button onClick={handleCreateBudget}>
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>

          {budgets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No budgets for this month</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first budget to start tracking</p>
                <Button onClick={handleCreateBudget}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const percentUsed = (budget.spent / budget.amount) * 100
                const remaining = budget.amount - budget.spent
                return (
                  <Card key={budget.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{budget.category}</CardTitle>
                          <CardDescription>
                            ${budget.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditBudget(budget)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteBudget(budget)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Progress value={Math.min(percentUsed, 100)} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className={remaining < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                          {remaining < 0 ? `Over by $${Math.abs(remaining).toFixed(2)}` : `$${remaining.toFixed(2)} remaining`}
                        </span>
                        <span className="text-muted-foreground">{percentUsed.toFixed(1)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Budget Analytics</h2>

          {budgets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No data to display</h3>
                <p className="text-sm text-muted-foreground">Add budgets to see analytics</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Budget vs Spent</CardTitle>
                  <CardDescription>Compare budgeted amounts with actual spending</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Budget" fill="#8884d8" />
                      <Bar dataKey="Spent" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spending Distribution</CardTitle>
                  <CardDescription>Breakdown of spending by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      <SubscriptionDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
        subscription={selectedSubscription}
      />

      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBudget ? "Edit Budget" : "Create Budget"}</DialogTitle>
            <DialogDescription>
              {selectedBudget ? "Update budget details" : `Add a budget for ${format(new Date(currentMonth + "-01"), "MMMM yyyy")}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="budget-category">Category *</Label>
              <Input
                id="budget-category"
                placeholder="Groceries, Entertainment..."
                value={budgetForm.category}
                onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="budget-amount">Budget Amount *</Label>
              <Input
                id="budget-amount"
                type="number"
                step="0.01"
                placeholder="500.00"
                value={budgetForm.amount || ""}
                onChange={(e) => setBudgetForm({ ...budgetForm, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="budget-spent">Amount Spent</Label>
              <Input
                id="budget-spent"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={budgetForm.spent || ""}
                onChange={(e) => setBudgetForm({ ...budgetForm, spent: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBudgetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBudget}>
              {selectedBudget ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
