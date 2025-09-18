'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Input } from '@/components/ui/Input'
import { 
  type SchoolAccount,
  type User 
} from '@/types/auth'
import { 
  type SchoolUsageStatistics,
  type TeacherAccount,
  type BillingInfo,
  type GDPRReport,
  schoolAdministrationService 
} from '@/lib/school-administration-service'
import { subscriptionService } from '@/lib/subscription-service'
import { motion } from 'framer-motion'

interface SchoolAdminDashboardProps {
  schoolAccount: SchoolAccount
  currentUser: User
  className?: string
}

export function SchoolAdminDashboard({
  schoolAccount,
  currentUser,
  className
}: SchoolAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'billing' | 'gdpr'>('overview')
  const [statistics, setStatistics] = useState<SchoolUsageStatistics | null>(null)
  const [billing, setBilling] = useState<BillingInfo | null>(null)
  const [gdprReport, setGdprReport] = useState<GDPRReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [schoolAccount.id])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [stats, billingInfo] = await Promise.all([
        schoolAdministrationService.getSchoolUsageStatistics(schoolAccount.id, 'month'),
        schoolAdministrationService.getBillingInfo(schoolAccount.id)
      ])
      
      setStatistics(stats)
      setBilling(billingInfo)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount)
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="caption" className="text-neutral-600">
                  Aktiva lärare
                </Typography>
                <Typography variant="h3" className="text-primary-600">
                  {statistics?.activeTeachers || 0}
                </Typography>
              </div>
              <span className="text-2xl">👨‍🏫</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="caption" className="text-neutral-600">
                  Quiz skapade
                </Typography>
                <Typography variant="h3" className="text-success-600">
                  {statistics?.totalQuizzes || 0}
                </Typography>
              </div>
              <span className="text-2xl">📝</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="caption" className="text-neutral-600">
                  Elever nådda
                </Typography>
                <Typography variant="h3" className="text-info-600">
                  {statistics?.totalStudents || 0}
                </Typography>
              </div>
              <span className="text-2xl">👥</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="caption" className="text-neutral-600">
                  Månadskostnad
                </Typography>
                <Typography variant="h3" className="text-warning-600">
                  {billing ? formatCurrency(billing.currentPeriod.totalCost) : '—'}
                </Typography>
              </div>
              <span className="text-2xl">💰</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Teachers */}
      <Card>
        <CardHeader>
          <CardTitle>Mest aktiva lärare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statistics?.topPerformingTeachers.map((teacher, index) => (
              <div key={teacher.teacherId} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="font-medium">
                      {teacher.teacherName}
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      {teacher.quizzesCreated} quiz • {teacher.studentsReached} elever
                    </Typography>
                  </div>
                </div>
                <div className="text-right">
                  <Typography variant="body2" className="font-medium text-success-600">
                    {Math.round(teacher.engagementScore * 100)}%
                  </Typography>
                  <Typography variant="caption" className="text-neutral-600">
                    engagement
                  </Typography>
                </div>
              </div>
            )) || (
              <Typography variant="body2" className="text-neutral-600 text-center py-8">
                Inga data tillgängliga än
              </Typography>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Översikt', icon: '📊' },
    { id: 'teachers', label: 'Lärare', icon: '👨‍🏫' },
    { id: 'billing', label: 'Fakturering', icon: '💰' },
    { id: 'gdpr', label: 'GDPR', icon: '🛡️' }
  ] as const

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-8">
        <Typography variant="h4" className="mb-2">
          {schoolAccount.name}
        </Typography>
        <Typography variant="body1" className="text-neutral-600">
          Administrationspanel för skolkonto
        </Typography>
      </div>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab !== 'overview' && (
          <div className="text-center py-12">
            <Typography variant="h6" className="mb-2">
              {tabs.find(t => t.id === activeTab)?.label} kommer snart
            </Typography>
            <Typography variant="body2" className="text-neutral-600">
              Denna funktion utvecklas för närvarande.
            </Typography>
          </div>
        )}
      </motion.div>
    </div>
  )
}