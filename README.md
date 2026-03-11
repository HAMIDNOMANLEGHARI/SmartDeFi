
# SmartDeFi

SmartDeFi is a specialized financial management platform designed exclusively for dental professionals. It empowers doctors to seamlessly track their practice's revenue, manage patient billing, and leverage a built-in AI assistant to query their financial data in natural language.

**Live Demo:** [smart-de-fi.vercel.app](https://smart-de-fi.vercel.app) #APP LINK

## Core Features

* **Financial Dashboard:** Track daily, monthly, and annual revenue streams.
* **Patient Management:** Manage treatments, billing, and payment histories.
* **AI Data Assistant:** Powered by Google's Gemini 2.5 Flash model, allowing doctors to ask questions like "What was my highest-earning treatment last month?" and get instant, accurate insights based on their actual database.
* **Secure Authentication:** Secure login powered by Supabase and Google OAuth.

## Tech Stack

* **Framework:** Next.js (App Router)
* **Database & Auth:** Supabase (PostgreSQL)
* **AI Integration:** Google Gen AI SDK (`@google/genai`)
* **Hosting:** Vercel

---

## Database Schema

This application relies on a relational database structure to manage dental practice data efficiently. Below is an overview of the core tables:

### Patients

* `id` (UUID, Primary Key)
* `full_name` (Text)
* `contact_info` (Text)
* `created_at` (Timestamp)

### Treatments

* `id` (UUID, Primary Key)
* `patient_id` (UUID, Foreign Key referencing Patients.id)
* `treatment_name` (Text) - e.g., Root Canal, Extraction
* `cost` (Numeric)
* `treatment_date` (Date)
* `created_at` (Timestamp)

### Payments

* `id` (UUID, Primary Key)
* `patient_id` (UUID, Foreign Key referencing Patients.id)
* `treatment_id` (UUID, Foreign Key referencing Treatments.id)
* `amount_paid` (Numeric)
* `payment_date` (Timestamp)
* `payment_method` (Text)

---

## Local Development

To run this project on your local machine, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/SmartDeFi.git
cd SmartDeFi

```

### 2. Set up Environment Variables

Create a `.env.local` file in the root directory and add your keys (you will need to configure your own Supabase project and Google Cloud credentials):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key

```

### 3. Install dependencies and run

```bash
npm install
npm run dev
# or yarn / pnpm / bun equivalents

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result. The application will auto-update as you modify files in the `src/app` directory.

---

## Deployment

This project is optimized for deployment on the Vercel Platform.

When deploying, ensure that you add all the environment variables listed above into your Vercel project settings (**Settings > Environment Variables**) before triggering the build. For more details, check out the Next.js deployment documentation.


