"use client"
import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

export const description = "A radial chart with text"

interface ChartRadialTextProps {
  title?: string
  description?: string
  data: Array<{
    [key: string]: string | number | undefined
    fill?: string
  }>
  dataKey: string
  valueLabel: string
  chartConfig: ChartConfig
  value: number
  trend?: {
    value: string
    icon?: React.ReactNode
  }
  footerText?: string
  className?: string
  startAngle?: number
  endAngle?: number
  innerRadius?: number
  outerRadius?: number
  polarRadius?: number[]
  cornerRadius?: number
}

export function ChartRadialText({
  title = "Radial Chart - Text",
  description: cardDescription,
  data,
  dataKey,
  valueLabel,
  chartConfig,
  value,
  trend,
  footerText,
  className,
  startAngle = 0,
  endAngle = 250,
  innerRadius = 80,
  outerRadius = 110,
  polarRadius = [86, 74],
  cornerRadius = 10,
}: ChartRadialTextProps) {
  return (
    <Card className={`flex flex-col ${className || ""}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={data}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={polarRadius}
            />
            <RadialBar dataKey={dataKey} background cornerRadius={cornerRadius} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {value.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {valueLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {trend && (
          <div className="flex items-center gap-2 leading-none font-medium">
            {trend.value} {trend.icon || <TrendingUp className="h-4 w-4" />}
          </div>
        )}
        {footerText && (
          <div className="text-muted-foreground leading-none">
            {footerText}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}