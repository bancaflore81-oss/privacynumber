'use client'

import { useState, useEffect, useCallback } from 'react'

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

export function useSmsMonitoring() {
  const [smsRequests, setSmsRequests] = useState<SmsRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchSmsRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

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
    }
  }, [])

  const refreshSms = useCallback(async (requestId: string) => {
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
        // Update the specific request in the state
        setSmsRequests(prev => 
          prev.map(req => 
            req.requestId === requestId 
              ? { ...req, smsCode: data.data.smsRequest.smsCode, status: data.data.smsRequest.status }
              : req
          )
        )
        return data.data.smsRequest
      }
      throw new Error(data.error || 'Failed to refresh SMS')
    } catch (err) {
      console.error('Error refreshing SMS:', err)
      throw err
    }
  }, [])

  const startPolling = useCallback((requestId: string, interval: number = 5000) => {
    const intervalId = setInterval(async () => {
      try {
        const updatedRequest = await refreshSms(requestId)
        if (updatedRequest.status === 'READY' || updatedRequest.status === 'CLOSE') {
          clearInterval(intervalId)
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, interval)

    return intervalId
  }, [refreshSms])

  const stopPolling = useCallback((intervalId: NodeJS.Timeout) => {
    clearInterval(intervalId)
  }, [])

  useEffect(() => {
    fetchSmsRequests()
  }, [fetchSmsRequests])

  return {
    smsRequests,
    loading,
    error,
    fetchSmsRequests,
    refreshSms,
    startPolling,
    stopPolling,
  }
}
