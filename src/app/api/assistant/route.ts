import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize Gemini Free Flash
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API context not configured' }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })

    // Step 1: Fetch clinic context to provide to Gemini
    // Since we don't have direct DB SQL execution capabilities, we fetch the doctor's data 
    // to simulate the "Query Supabase" securely and accurately.
    const [patients, treatments, payments] = await Promise.all([
      supabase.from('patients').select('id, name, age, gender').eq('doctor_id', user.id),
      supabase.from('treatments').select('id, patient_id, treatment_name, total_cost, status, treatment_date'),
      supabase.from('payments').select('id, treatment_id, amount_paid, payment_method, payment_date')
    ])

    const dbContext = JSON.stringify({
      patients: patients.data || [],
      treatments: treatments.data || [],
      payments: payments.data || []
    })

    // Step 2: Use Gemini to process the text-to-SQL logic and generate the direct answer
    const prompt = `
You are an AI Finance Assistant inside the "SmartDeFi" Dental Clinic Finance Management Web App.
Your job is to answer the doctor's financial questions based on their clinic database.

The user asked: "${message}"

Here is the JSON representation of the doctor's database tables (patients, treatments, payments):
${dbContext}

Instructions:
1. Act as if you converted their question into a SQL query and ran it.
2. Analyze the provided JSON data to find the exact answer to their question.
3. Return a highly professional, short, human-readable answer.
4. If applicable, briefly mention the "POWERED BY HNL AI".


Example response format:
"You earned $3,450 in March. 
The highest revenue came from 12 Root Canal treatments.

POWERED BY HNL AI"
`




    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    })

    const answer = response.text

    return NextResponse.json({ answer })

  } catch (error: any) {
    console.error('AI Assistant Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
