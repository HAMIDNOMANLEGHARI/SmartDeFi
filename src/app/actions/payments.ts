'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPayment(data: FormData) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const treatment_id = data.get('treatment_id')?.toString()
  const amount_paid = data.get('amount_paid') ? Number(data.get('amount_paid')) : null
  const payment_method = data.get('payment_method')?.toString()
  const payment_date = data.get('payment_date')?.toString()

  if (!treatment_id || amount_paid === null || !payment_method || !payment_date) {
    throw new Error('Missing required fields')
  }

  const { error } = await supabase.from('payments').insert({
    treatment_id,
    amount_paid,
    payment_method,
    payment_date,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/treatments/${treatment_id}`)
}

export async function updateTreatmentStatus(treatmentId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('treatments')
    .update({ status })
    .eq('id', treatmentId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/treatments/${treatmentId}`)
}
