import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreatePaymentDialog } from '@/components/CreatePaymentDialog'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CalendarIcon, CreditCard, Stethoscope, Wallet } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function TreatmentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch treatment and patient details
  const { data: treatment, error: treatmentError } = await supabase
    .from('treatments')
    .select('*, patients(id, name)')
    .eq('id', id)
    .single()

  if (treatmentError || !treatment) {
    notFound()
  }

  // Fetch payments for this treatment
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('treatment_id', id)
    .order('payment_date', { ascending: false })

  // Calculations
  const totalCost = Number(treatment.total_cost)
  const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0
  const remainingBalance = Math.max(0, totalCost - totalPaid)
  const isPaid = remainingBalance === 0

  let statusVariant: "default" | "secondary" | "destructive" | "outline" = "outline"
  if (treatment.status === 'Completed') statusVariant = "default"
  if (treatment.status === 'In Progress') statusVariant = "secondary"

  return (
    <div className="space-y-6">
      <div className="flex items-center space-y-2">
        <Button variant="ghost" className="-ml-2 mr-2 text-muted-foreground p-0 hover:bg-transparent">
          <Link href={`/patients/${treatment.patient_id}`} className="flex items-center px-4 py-2 hover:bg-accent rounded-md">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patient
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center">
            {treatment.treatment_name}
            <Badge variant={statusVariant} className={`ml-3 text-sm ${statusVariant === 'default' ? 'bg-primary' : ''}`}>
               {treatment.status}
            </Badge>
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Patient: <Link href={`/patients/${treatment.patient_id}`} className="text-primary hover:underline">{treatment.patients.name}</Link>
          </p>
        </div>
        <CreatePaymentDialog treatmentId={treatment.id} remainingBalance={remainingBalance} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Treatment Details Card */}
        <Card className="md:col-span-1 border-border shadow-sm rounded-xl h-fit border-l-4 border-l-primary">
          <CardHeader className="bg-muted/10 pb-4 border-b border-border">
             <CardTitle className="text-lg">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
             <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center">
                  <Stethoscope className="mr-2 h-4 w-4" /> Total Cost
                </span>
                <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
             </div>
             
             <div className="space-y-1 pt-4 border-t border-border">
                <span className="text-sm font-medium text-muted-foreground flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" /> Amount Paid
                </span>
                <div className="text-xl font-bold text-primary">${totalPaid.toFixed(2)}</div>
             </div>

             <div className="space-y-1 pt-4 border-t border-border bg-secondary/10 -mx-6 px-6 pb-2 rounded-b-xl border-dashed">
                <span className="text-sm font-medium text-muted-foreground flex items-center pt-2">
                  <Wallet className="mr-2 h-4 w-4" /> Remaining Balance
                </span>
                <div className={`text-xl font-bold ${remainingBalance > 0 ? 'text-destructive' : 'text-primary'}`}>
                  ${remainingBalance.toFixed(2)}
                  {isPaid && <span className="ml-2 text-sm font-normal text-muted-foreground">(Paid in full)</span>}
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Payments Card */}
        <Card className="md:col-span-2 border-border shadow-sm rounded-xl">
          <CardHeader className="bg-muted/10 pb-4 border-b border-border">
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Record of previous transactions for this treatment.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Date</TableHead>
                  <TableHead className="font-semibold text-foreground">Amount</TableHead>
                  <TableHead className="font-semibold text-foreground">Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-40 text-muted-foreground">
                       <div className="flex flex-col items-center justify-center">
                         <CreditCard className="h-8 w-8 text-muted mb-2" />
                         <p>No payments recorded yet.</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments?.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        ${Number(payment.amount_paid).toFixed(2)}
                      </TableCell>
                      <TableCell>
                         <Badge variant="outline" className="bg-secondary/30">
                           {payment.payment_method}
                         </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
