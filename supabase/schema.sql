-- Schema for SmartDeFi

-- Create patients table
CREATE TABLE public.patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  age INTEGER,
  gender TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create treatments table
CREATE TABLE public.treatments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  treatment_name TEXT NOT NULL,
  total_cost NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  treatment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  amount_paid NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for patients
CREATE POLICY "Doctors can view their own patients" ON public.patients
  FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can insert their own patients" ON public.patients
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can update their own patients" ON public.patients
  FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can delete their own patients" ON public.patients
  FOR DELETE USING (auth.uid() = doctor_id);

-- Policies for treatments
CREATE POLICY "Doctors can view treatments of their patients" ON public.treatments
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.patients WHERE patients.id = treatments.patient_id AND patients.doctor_id = auth.uid()));
CREATE POLICY "Doctors can insert treatments for their patients" ON public.treatments
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.patients WHERE patients.id = treatments.patient_id AND patients.doctor_id = auth.uid()));
CREATE POLICY "Doctors can update treatments of their patients" ON public.treatments
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.patients WHERE patients.id = treatments.patient_id AND patients.doctor_id = auth.uid()));
CREATE POLICY "Doctors can delete treatments of their patients" ON public.treatments
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.patients WHERE patients.id = treatments.patient_id AND patients.doctor_id = auth.uid()));

-- Policies for payments
CREATE POLICY "Doctors can view payments of their patients" ON public.payments
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.treatments JOIN public.patients ON treatments.patient_id = patients.id WHERE treatments.id = payments.treatment_id AND patients.doctor_id = auth.uid()));
CREATE POLICY "Doctors can insert payments for their patients" ON public.payments
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.treatments JOIN public.patients ON treatments.patient_id = patients.id WHERE treatments.id = payments.treatment_id AND patients.doctor_id = auth.uid()));
CREATE POLICY "Doctors can update payments of their patients" ON public.payments
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.treatments JOIN public.patients ON treatments.patient_id = patients.id WHERE treatments.id = payments.treatment_id AND patients.doctor_id = auth.uid()));
CREATE POLICY "Doctors can delete payments of their patients" ON public.payments
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.treatments JOIN public.patients ON treatments.patient_id = patients.id WHERE treatments.id = payments.treatment_id AND patients.doctor_id = auth.uid()));
