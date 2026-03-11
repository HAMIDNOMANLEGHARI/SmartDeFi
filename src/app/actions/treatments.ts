'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTreatment(data: FormData) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const patient_id = data.get('patient_id')?.toString()
  const treatment_name = data.get('treatment_name')?.toString()
  const total_cost = data.get('total_cost') ? Number(data.get('total_cost')) : null
  const treatment_date = data.get('treatment_date')?.toString()
  const status = data.get('status')?.toString() || 'Pending'
  const notes = data.get('notes')?.toString()

  if (!patient_id || !treatment_name || total_cost === null || !treatment_date) {
    throw new Error('Missing required fields')
  }

  const { error } = await supabase.from('treatments').insert({
    patient_id,
    treatment_name,
    total_cost,
    treatment_date,
    status,
    notes,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/patients/${patient_id}`)
}
