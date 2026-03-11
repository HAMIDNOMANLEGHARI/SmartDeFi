'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPatient(data: FormData) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const name = data.get('name')?.toString()
  const phone = data.get('phone')?.toString()
  const email = data.get('email')?.toString()
  const age = data.get('age') ? Number(data.get('age')) : null
  const gender = data.get('gender')?.toString()
  const notes = data.get('notes')?.toString()

  if (!name) {
    throw new Error('Name is required')
  }

  const { error } = await supabase.from('patients').insert({
    doctor_id: user.id,
    name,
    phone,
    email,
    age,
    gender,
    notes,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/patients')
}
