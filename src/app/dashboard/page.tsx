'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react'

interface SmsRequest {
  id: string
  requestId: string
  countryId: string
  serviceId: string
  phoneNumber?: string
  status: string
  smsCode?: string
  createdAt: string
  expiresAt?: string
}

interface User {
  id: string
  email: string
  name?: string
  balance: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [smsRequests, setSmsRequests] = useState<SmsRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    fetchUserData()
    fetchSmsRequests()
  }, [router])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setUser(data.data.user)
      } else {
        router.push('/auth/login')
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
      router.push('/auth/login')
    }
  }

  const fetchSmsRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/sms', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setSmsRequests(data.data.smsRequests)
      }
    } catch (err) {
      console.error('Error fetching SMS requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshSms = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      })

      const data = await response.json()
      if (data.success) {
        fetchSmsRequests() // Refresh the list
      }
    } catch (err) {
      console.error('Error refreshing SMS:', err)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'READY':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'CLOSE':
      case 'REJECT':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'READY':
        return 'SMS Received'
      case 'PENDING':
        return 'Waiting for SMS'
      case 'CLOSE':
        return 'Closed'
      case 'REJECT':
        return 'Rejected'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your SMS verification requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${user?.balance.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">
                Available for SMS verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{smsRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                SMS verification requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {smsRequests.filter(req => req.status === 'PENDING').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Waiting for SMS codes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Button onClick={() => router.push('/purchase')} className="mr-4">
            Request New Number
          </Button>
          <Button variant="outline" onClick={() => router.push('/pricing')}>
            View Pricing
          </Button>
        </div>

        {/* SMS Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent SMS Requests</CardTitle>
            <CardDescription>
              Your recent phone number requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {smsRequests.length === 0 ? (
              <div className="text-center py-8">
                <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                <p className="text-gray-600 mb-4">Get started by requesting your first phone number</p>
                <Button onClick={() => router.push('/purchase')}>
                  Request Number
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {smsRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(request.status)}
                        <div>
                          <p className="font-medium">
                            {request.phoneNumber || 'Number pending...'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Service: {request.serviceId} | Country: {request.countryId}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{getStatusText(request.status)}</p>
                        {request.smsCode && (
                          <p className="text-sm text-green-600 font-mono">
                            Code: {request.smsCode}
                          </p>
                        )}
                        {request.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => refreshSms(request.requestId)}
                            className="mt-2"
                          >
                            Refresh SMS
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
