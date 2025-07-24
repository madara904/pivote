"use client"

import DashboardOverviewHead from './modules/dashboard-overview-head'
import DashboardBottom from './modules/dashboard-last-table'
import DashboardMetrics from './modules/dashboard-metrics'
import DashboardPerformance from './modules/dashboard-performance'
import DashboardQuickActions from './modules/dashboard-quick-action'

const DashboardOverview = () => {
  return (
    <div className="space-y-6">
    <DashboardOverviewHead />
    <DashboardMetrics />
    <DashboardQuickActions />

    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 w-full max-w-full">
      <DashboardBottom />
      <DashboardPerformance />
    </div>
  </div>
  )
}

export default DashboardOverview