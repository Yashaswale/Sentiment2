"use client"

import { useEffect, useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface AnimatedPieChartProps {
  data: Array<{ name: string; value: number; color: string }>
  className?: string
}

export function AnimatedPieChart({ data, className }: AnimatedPieChartProps) {
  const [animatedData, setAnimatedData] = useState(data.map((item) => ({ ...item, value: 0 })))

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data)
    }, 500)

    return () => clearTimeout(timer)
  }, [data])

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={animatedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
            animationBegin={0}
            animationDuration={1500}
            label={({ name, value }) => `${name}: ${value}%`}
          >
            {animatedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}%`, "Percentage"]}
            contentStyle={{
<<<<<<< HEAD
              backgroundColor: "rgba(15,23,42,0.95)",
              border: "1px solid rgba(148,163,184,0.6)",
              borderRadius: "0.5rem",
              color: "#ffffff",
            }}
            labelStyle={{ color: "#ffffff" }}
            itemStyle={{ color: "#ffffff" }}
=======
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              color: "var(--foreground)",
            }}
            labelStyle={{ color: "var(--foreground)" }}
            itemStyle={{ color: "var(--foreground)" }}
>>>>>>> 05732df (updated the pdf part)
          />
          <Legend 
            wrapperStyle={{ color: 'var(--foreground)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

interface AnimatedBarChartProps {
  data: Array<{ name: string; value: number; fill: string }>
  className?: string
}

export function AnimatedBarChart({ data, className }: AnimatedBarChartProps) {
  const [animatedData, setAnimatedData] = useState(data.map((item) => ({ ...item, value: 0 })))

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data)
    }, 800)

    return () => clearTimeout(timer)
  }, [data])

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={animatedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'var(--foreground)' }}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <YAxis 
            tick={{ fill: 'var(--foreground)' }}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Percentage"]}
            contentStyle={{
<<<<<<< HEAD
              backgroundColor: "rgba(15,23,42,0.95)",
              border: "1px solid rgba(148,163,184,0.6)",
              borderRadius: "0.5rem",
              color: "#ffffff",
            }}
            labelStyle={{ color: "#ffffff" }}
            itemStyle={{ color: "#ffffff" }}
=======
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              color: "var(--foreground)",
            }}
            labelStyle={{ color: "var(--foreground)" }}
            itemStyle={{ color: "var(--foreground)" }}
>>>>>>> 05732df (updated the pdf part)
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} animationBegin={0} animationDuration={1500} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
