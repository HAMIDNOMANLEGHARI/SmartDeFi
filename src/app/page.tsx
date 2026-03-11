import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, CreditCard, Activity, Calendar } from 'lucide-react'
import { DashboardCharts } from '@/components/DashboardCharts'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount_paid, payment_date')

  const { data: treatments, error: treatmentsError } = await supabase
    .from('treatments')
    .select('id, total_cost, payments(amount_paid)')

  let totalRevenue = 0
  let monthlyRevenue = 0
  let todayRevenue = 0
  let pendingPayments = 0

  // Chart data aggregation
  const monthlyMap: Record<string, number> = {}
  const dailyMap: Record<string, number> = {}

  if (payments && !paymentsError) {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const todayStr = today.toISOString().split('T')[0]

    payments.forEach((payment) => {
      const amount = Number(payment.amount_paid)
      totalRevenue += amount

      const paymentDate = new Date(payment.payment_date)
      if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
        monthlyRevenue += amount
      }

      if (payment.payment_date === todayStr) {
        todayRevenue += amount
      }

      // Aggregation for Bar Chart (Monthly)
      const monthKey = paymentDate.toLocaleString('default', { month: 'short', year: 'numeric' })
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + amount

      // Aggregation for Line Chart (Daily - last 14 days perhaps)
      const diffTime = Math.abs(today.getTime() - paymentDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays <= 14) {
        const dateKey = payment.payment_date
        dailyMap[dateKey] = (dailyMap[dateKey] || 0) + amount
      }
    })
  }

  if (treatments && !treatmentsError) {
    treatments.forEach((treatment) => {
      const totalCost = Number(treatment.total_cost)
      const amountPaid = treatment.payments.reduce((sum, p) => sum + Number(p.amount_paid), 0)
      pendingPayments += Math.max(0, totalCost - amountPaid)
    })
  }

  // Convert maps to arrays for Recharts
  const monthlyData = Object.entries(monthlyMap)
    .map(([month, amount]) => ({ month, amount }))
    // Just sort sortable strings loosely or rely on insertion mapping
    .slice(-6) // show last 6 months

  const dailyData = Object.entries(dailyMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, amount]) => ({ date: date.slice(5), amount })) // show as MM-DD

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">All time earnings</p>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Revenue
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payments
            </CardTitle>
            <CreditCard className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${pendingPayments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total unpaid treatments</p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts monthlyData={monthlyData} dailyData={dailyData} />
    </div>
  )
}
