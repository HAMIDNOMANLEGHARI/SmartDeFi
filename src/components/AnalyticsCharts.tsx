'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Payment = { amount_paid: number; payment_date: string }

export function AnalyticsCharts({ payments }: { payments: Payment[] }) {
  const [timeRange, setTimeRange] = useState('6M')

  const { barData, lineData } = useMemo(() => {
    const now = new Date()
    let cutoff = new Date()

    if (timeRange === '1M') cutoff.setMonth(now.getMonth() - 1)
    if (timeRange === '6M') cutoff.setMonth(now.getMonth() - 6)
    if (timeRange === '1Y') cutoff.setFullYear(now.getFullYear() - 1)
    if (timeRange === 'ALL') cutoff = new Date(0)

    const filtered = payments.filter((p) => new Date(p.payment_date) >= cutoff)

    // Aggregate monthly for Bar Chart
    const monthlyMap: Record<string, number> = {}
    // Aggregate daily for Line Chart
    const dailyMap: Record<string, number> = {}

    filtered.forEach((p) => {
      const d = new Date(p.payment_date)
      const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      const dayKey = p.payment_date

      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + Number(p.amount_paid)
      dailyMap[dayKey] = (dailyMap[dayKey] || 0) + Number(p.amount_paid)
    })

    const bData = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }))
    const lData = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date: date.slice(5), amount })) // MM-DD

    return { barData: bData, lineData: lData }
  }, [payments, timeRange])

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Select value={timeRange} onValueChange={(val) => setTimeRange(val as string)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1M">Last Month</SelectItem>
            <SelectItem value="6M">Last 6 Months</SelectItem>
            <SelectItem value="1Y">Last Year</SelectItem>
            <SelectItem value="ALL">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DEC8" />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']} cursor={{fill: '#F3EFE3'}} />
                  <Bar dataKey="amount" fill="#769382" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Daily Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DEC8" />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                  <Line type="monotone" dataKey="amount" stroke="#769382" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
