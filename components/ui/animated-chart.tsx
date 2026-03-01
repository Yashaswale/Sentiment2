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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { useTheme } from "@/contexts/theme-context"

// ─── Dark/Light Color Palettes ─────────────────────────────────────────────
const DARK_COLORS = {
  positive: "#4ade80",  // bright green
  negative: "#f87171",  // bright red
  neutral: "#fbbf24",  // bright amber
}

const LIGHT_COLORS = {
  positive: "#16a34a",  // deep green
  negative: "#dc2626",  // deep red
  neutral: "#d97706",  // deep amber
}

type ChartType1 = "pie" | "bar" | "radar"
type ChartType2 = "bar" | "pie"

// ─── Dropdown component ───────────────────────────────────────────────────

function ChartTypeSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { label: string; value: T }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="relative inline-flex items-center">
      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-primary/70">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h18v18H3z" opacity="0" />
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none text-sm pl-8 pr-7 py-1.5 rounded-full font-medium
          border-2 border-primary/20 bg-background/80 backdrop-blur-sm text-foreground
          cursor-pointer shadow-sm
          hover:border-primary/50 hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60
          transition-all duration-200"
        style={{ minWidth: 140 }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-primary/50">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  )
}

// ─── Animated Pie Chart (Chart 1: 3 types) ────────────────────────────────

interface AnimatedPieChartProps {
  data: Array<{ name: string; value: number; color: string }>
  className?: string
}

export function AnimatedPieChart({ data, className }: AnimatedPieChartProps) {
  const [animatedData, setAnimatedData] = useState(data.map((item) => ({ ...item, value: 0 })))
  const [chartType, setChartType] = useState<ChartType1>("pie")
  const { theme } = useTheme()

  const palette = theme === "dark" ? DARK_COLORS : LIGHT_COLORS

  // Apply theme-aware colors
  const themedData = data.map((item) => ({
    ...item,
    color:
      item.name.toLowerCase() === "positive"
        ? palette.positive
        : item.name.toLowerCase() === "negative"
          ? palette.negative
          : palette.neutral,
  }))

  const themedAnimated = animatedData.map((item) => ({
    ...item,
    color:
      item.name.toLowerCase() === "positive"
        ? palette.positive
        : item.name.toLowerCase() === "negative"
          ? palette.negative
          : palette.neutral,
  }))

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data)
    }, 500)
    return () => clearTimeout(timer)
  }, [data])

  const tooltipStyle = {
    backgroundColor: theme === "dark" ? "#1e1e2e" : "#ffffff",
    border: `1px solid ${theme === "dark" ? "#333" : "#e2e8f0"}`,
    borderRadius: "0.5rem",
    color: theme === "dark" ? "#f8f8f2" : "#1a1a2e",
  }

  const chart1Options: { label: string; value: ChartType1 }[] = [
    { label: "🍩 Donut Pie", value: "pie" },
    { label: "📊 Bar Chart", value: "bar" },
    { label: "🕸️ Radar Chart", value: "radar" },
  ]

  const radarData = themedData.map((d) => ({ subject: d.name, value: d.value, fullMark: 100 }))

  return (
    <div className={className}>
      {/* Dropdown top-right */}
      <div className="flex justify-end mb-2">
        <ChartTypeSelect value={chartType} options={chart1Options} onChange={setChartType} />
      </div>

      <div style={{ height: "calc(100% - 36px)" }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "pie" ? (
            <PieChart>
              <Pie
                data={themedAnimated}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {themedAnimated.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, "Percentage"]}
                contentStyle={tooltipStyle}
                labelStyle={{ color: tooltipStyle.color }}
                itemStyle={{ color: tooltipStyle.color }}
              />
              <Legend wrapperStyle={{ color: theme === "dark" ? "#f8f8f2" : "#1a1a2e" }} />
            </PieChart>
          ) : chartType === "bar" ? (
            <BarChart
              data={themedData.map((d, i) => ({
                name: d.name,
                value: themedAnimated[i]?.value ?? 0,
                fill: d.color,
              }))}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#333" : "#e2e8f0"} />
              <XAxis dataKey="name" tick={{ fill: theme === "dark" ? "#a0a0b0" : "#475569" }} />
              <YAxis tick={{ fill: theme === "dark" ? "#a0a0b0" : "#475569" }} domain={[0, 100]} />
              <Tooltip
                formatter={(value) => [`${value}%`, "Percentage"]}
                contentStyle={tooltipStyle}
                labelStyle={{ color: tooltipStyle.color }}
                itemStyle={{ color: tooltipStyle.color }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationBegin={0} animationDuration={1500}>
                {themedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <RadarChart data={radarData}>
              <PolarGrid stroke={theme === "dark" ? "#333" : "#cbd5e1"} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: theme === "dark" ? "#a0a0b0" : "#475569", fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: theme === "dark" ? "#666" : "#94a3b8" }} />
              <Radar
                name="Sentiment"
                dataKey="value"
                stroke={theme === "dark" ? "#a78bfa" : "#7c3aed"}
                fill={theme === "dark" ? "#a78bfa" : "#7c3aed"}
                fillOpacity={0.4}
                animationBegin={0}
                animationDuration={1500}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Percentage"]}
                contentStyle={tooltipStyle}
                labelStyle={{ color: tooltipStyle.color }}
                itemStyle={{ color: tooltipStyle.color }}
              />
              <Legend wrapperStyle={{ color: theme === "dark" ? "#f8f8f2" : "#1a1a2e" }} />
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Animated Bar Chart (Chart 2: 2 types) ────────────────────────────────

interface AnimatedBarChartProps {
  data: Array<{ name: string; value: number; fill: string }>
  className?: string
}

export function AnimatedBarChart({ data, className }: AnimatedBarChartProps) {
  const [animatedData, setAnimatedData] = useState(data.map((item) => ({ ...item, value: 0 })))
  const [chartType, setChartType] = useState<ChartType2>("bar")
  const { theme } = useTheme()

  const palette = theme === "dark" ? DARK_COLORS : LIGHT_COLORS

  const themedData = data.map((item) => ({
    ...item,
    fill:
      item.name.toLowerCase() === "positive"
        ? palette.positive
        : item.name.toLowerCase() === "negative"
          ? palette.negative
          : palette.neutral,
  }))

  const themedAnimated = animatedData.map((item) => ({
    ...item,
    fill:
      item.name.toLowerCase() === "positive"
        ? palette.positive
        : item.name.toLowerCase() === "negative"
          ? palette.negative
          : palette.neutral,
  }))

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data)
    }, 800)
    return () => clearTimeout(timer)
  }, [data])

  const tooltipStyle = {
    backgroundColor: theme === "dark" ? "#1e1e2e" : "#ffffff",
    border: `1px solid ${theme === "dark" ? "#333" : "#e2e8f0"}`,
    borderRadius: "0.5rem",
    color: theme === "dark" ? "#f8f8f2" : "#1a1a2e",
  }

  const chart2Options: { label: string; value: ChartType2 }[] = [
    { label: "📊 Bar Chart", value: "bar" },
    { label: "🍩 Donut Pie", value: "pie" },
  ]

  const pieData = themedData.map((d, i) => ({
    name: d.name,
    value: themedAnimated[i]?.value ?? 0,
    color: d.fill,
  }))

  return (
    <div className={className}>
      {/* Dropdown top-right */}
      <div className="flex justify-end mb-2">
        <ChartTypeSelect value={chartType} options={chart2Options} onChange={setChartType} />
      </div>

      <div style={{ height: "calc(100% - 36px)" }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={themedAnimated} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#333" : "#e2e8f0"} />
              <XAxis
                dataKey="name"
                tick={{ fill: theme === "dark" ? "#a0a0b0" : "#475569" }}
                axisLine={{ stroke: theme === "dark" ? "#444" : "#cbd5e1" }}
              />
              <YAxis
                tick={{ fill: theme === "dark" ? "#a0a0b0" : "#475569" }}
                axisLine={{ stroke: theme === "dark" ? "#444" : "#cbd5e1" }}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Percentage"]}
                contentStyle={tooltipStyle}
                labelStyle={{ color: tooltipStyle.color }}
                itemStyle={{ color: tooltipStyle.color }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationBegin={0} animationDuration={1500}>
                {themedAnimated.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={105}
                paddingAngle={5}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, "Percentage"]}
                contentStyle={tooltipStyle}
                labelStyle={{ color: tooltipStyle.color }}
                itemStyle={{ color: tooltipStyle.color }}
              />
              <Legend wrapperStyle={{ color: theme === "dark" ? "#f8f8f2" : "#1a1a2e" }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
