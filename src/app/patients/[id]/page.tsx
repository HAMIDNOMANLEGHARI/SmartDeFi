import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreateTreatmentDialog } from '@/components/CreateTreatmentDialog'
import { Badge } from '@/components/ui/badge'
import { FileText, Mail, Phone, User, CalendarIcon } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function PatientProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (patientError || !patient) {
    notFound()
  }

  const { data: treatments } = await supabase
    .from('treatments')
    .select('*, payments(amount_paid)')
    .eq('patient_id', id)
    .order('treatment_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Patient Profile</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Patient Details Card */}
        <Card className="md:col-span-1 border-border shadow-sm rounded-xl h-fit">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border">
            <CardTitle>{patient.name}</CardTitle>
            <CardDescription>Patient Details</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="flex items-center text-sm">
                <Phone className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{patient.phone || 'No phone provided'}</span>
             </div>
             <div className="flex items-center text-sm">
                <Mail className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{patient.email || 'No email provided'}</span>
             </div>
             <div className="flex items-center text-sm">
                <User className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{patient.age ? `${patient.age} years old` : 'Age unknown'}, {patient.gender || 'unspecified'}</span>
             </div>
             <div className="flex items-start text-sm pt-2 border-t border-border mt-2">
                <FileText className="mr-3 h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-foreground">
                  <span className="font-semibold block mb-1">Notes:</span>
                  {patient.notes || 'No notes added.'}
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Treatments Card */}
        <Card className="md:col-span-2 border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/30 pb-4 border-b border-border">
            <div>
              <CardTitle>Treatments</CardTitle>
              <CardDescription>History and active procedures</CardDescription>
            </div>
            <CreateTreatmentDialog patientId={patient.id} />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Date</TableHead>
                  <TableHead className="font-semibold text-foreground">Treatment</TableHead>
                  <TableHead className="font-semibold text-foreground">Cost</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                      No treatments recorded for this patient.
                    </TableCell>
                  </TableRow>
                ) : (
                  treatments?.map((treatment) => {
                    const totalPaid = treatment.payments.reduce((sum: number, p: any) => sum + Number(p.amount_paid), 0)
                    const remaining = Math.max(0, Number(treatment.total_cost) - totalPaid)
                    const isPaid = remaining === 0

                    let statusVariant: "default" | "secondary" | "destructive" | "outline" = "outline"
                    if (treatment.status === 'Completed') statusVariant = "default"
                    if (treatment.status === 'In Progress') statusVariant = "secondary"

                    return (
                      <TableRow key={treatment.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center text-sm whitespace-nowrap">
                            <CalendarIcon className="mr-2 h-3 w-3 text-muted-foreground" />
                            {new Date(treatment.treatment_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{treatment.treatment_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>${Number(treatment.total_cost).toFixed(2)}</span>
                            {remaining > 0 && <span className="text-xs text-destructive">Owes ${remaining.toFixed(2)}</span>}
                            {isPaid && <span className="text-xs text-primary font-medium">Paid in full</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant} className={statusVariant === 'default' ? 'bg-primary' : ''}>
                            {treatment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="hover:text-primary p-0 hover:bg-transparent">
                            <Link href={`/treatments/${treatment.id}`} className="px-3 py-2 bg-transparent hover:bg-primary/10 rounded-md">Manage</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
