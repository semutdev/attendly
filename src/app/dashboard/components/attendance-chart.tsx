"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { format, subDays } from "date-fns"
import { id } from 'date-fns/locale'
import { Card } from "@/components/ui/card"
import type { AttendanceRecord } from "@/lib/data"

interface ChartData {
  name: string;
  present: number;
  absent: number;
}

export function AttendanceChart({ data }: { data: AttendanceRecord[] }) {
  const chartData: ChartData[] = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), i);
    const dateString = format(date, "yyyy-MM-dd");
    const dayName = format(date, "EEE", { locale: id });
    
    const todaysRecords = data.filter(record => record.date === dateString);
    
    const present = todaysRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const absent = todaysRecords.filter(r => r.status === 'absent').length;

    return { name: dayName, present, absent };
  }).reverse();

  return (
    <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
            <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            />
            <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            />
            <Tooltip
            contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
            }}
            cursor={{ fill: "hsl(var(--accent) / 0.1)" }}
            />
            <Bar dataKey="present" fill="hsl(var(--primary))" name="Hadir" radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" fill="hsl(var(--accent))" name="Absen" radius={[4, 4, 0, 0]} />
        </BarChart>
        </ResponsiveContainer>
    </div>
  )
}
