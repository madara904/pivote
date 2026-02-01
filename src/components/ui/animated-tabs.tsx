"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface AnimatedTab {
  value: string
  label: React.ReactNode
  content?: React.ReactNode
}

interface AnimatedTabsProps {
  tabs: AnimatedTab[]
  value: string
  onValueChange: (value: string) => void
  className?: string
  tabsListClassName?: string
  tabsTriggerClassName?: string
  gridCols?: string
  activationMode?: "automatic" | "manual"
}

export function AnimatedTabs({
  tabs,
  value,
  onValueChange,
  className,
  tabsListClassName,
  tabsTriggerClassName,
  gridCols,
  activationMode = "automatic",
}: AnimatedTabsProps) {
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const [underlineStyle, setUnderlineStyle] = React.useState({ left: 0, width: 0 })

  React.useLayoutEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.value === value)
    const activeTabElement = tabRefs.current[activeIndex]

    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement
      setUnderlineStyle({
        left: offsetLeft,
        width: offsetWidth
      })
    }
  }, [value, tabs])

  return (
    <Tabs 
      value={value} 
      onValueChange={onValueChange} 
      className={cn("w-full", className)}
      activationMode={activationMode}
    >
      <TabsList 
        className={cn(
          "h-auto bg-background relative rounded-none border-b border-border/40 p-0 gap-0 w-full overflow-x-auto grid",
          gridCols || `grid-cols-${tabs.length}`,
          tabsListClassName
        )}
      >
        {tabs.map((tab, index) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            ref={el => {
              tabRefs.current[index] = el
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2 sm:py-3 px-2 sm:px-4 rounded-none border-0 bg-background dark:data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground relative z-10 shrink-0 min-w-0",
              tabsTriggerClassName
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
        <motion.div
          className="bg-primary absolute bottom-0 z-20 h-0.5"
          layoutId="underline"
          style={{
            left: underlineStyle.left,
            width: underlineStyle.width
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 40
          }}
        />
      </TabsList>
      {tabs.map(tab => (
        tab.content && (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        )
      ))}
    </Tabs>
  )
}

