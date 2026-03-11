import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsCharts } from '@/components/AnalyticsCharts'
import { DollarSign, Pickaxe, Users, Wallet } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Fetch all required data for analytics
  const [patientsRes, treatmentsRes, paymentsRes] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact' }),
    supabase.from('treatments').select('id, total_cost'),
    supabase.from('payments').select('amount_paid, payment_date')
  ])

  const totalPatients = patientsRes.count || 0
  const payments = paymentsRes.data || []
  const treatments = treatmentsRes.data || []

  const totalEarned = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0)
  
  const totalBilled = treatments.reduce((sum, t) => sum + Number(t.total_cost), 0)
  const totalPending = Math.max(0, totalBilled - totalEarned)

  const avgPatientRevenue = totalPatients > 0 ? totalEarned / totalPatients : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Revenue Analytics</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earned
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalEarned.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pending
            </CardTitle>
            <Wallet className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalPending.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Patient Revenue
            </CardTitle>
            <Pickaxe className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${avgPatientRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalPatients}</div>
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts payments={payments as any} />
    </div>
  )
}
