'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { getCountryFlag } from '@/lib/country-flags'

// Helper function to get service icon
const getServiceIcon = (serviceId: string) => {
  const icons: { [key: string]: string } = {
    'telegram': '📱',
    'whatsapp': '💬',
    'facebook': '📘',
    'instagram': '📷',
    'twitter': '🐦',
    'google': '🔍',
    'microsoft': '🪟',
    'apple': '🍎',
    'amazon': '📦',
    'uber': '🚗',
    'default': '📞'
  }
  return icons[serviceId.toLowerCase()] || icons.default
}

interface Country {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
}

export function CheckHowItWorks() {
  const { user } = useAuth()
  const [countries, setCountries] = useState<Country[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchCountries()
      fetchServices()
    }
  }, [user])

  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/countries', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setCountries(data.data.countries)
      }
    } catch (err) {
      console.error('Error fetching countries:', err)
    }
  }

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/services', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setServices(data.data.services)
      }
    } catch (err) {
      console.error('Error fetching services:', err)
    }
  }

  const handleGetNumber = async () => {
    if (!selectedCountry || !selectedService) {
      setError('Please select both country and service')
      return
    }

    if (!user) {
      setError('Please login to get a number')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countryId: selectedCountry,
          serviceId: selectedService,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to dashboard to see the new number
        window.location.href = '/dashboard'
      } else {
        setError(data.error || 'Failed to get number')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Check how it works!
          </h2>
          <p className="text-lg text-gray-600">
            Select your country and service to get started
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Get Your Number
            </h3>
            <p className="text-gray-600 mb-6">
              Choose your country and service to receive SMS
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-field">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {getCountryFlag(country.id)} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="form-field">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service
                </label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {getServiceIcon(service.id)} {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <button
              onClick={handleGetNumber}
              disabled={!selectedCountry || !selectedService || loading}
              className="btn btn-primary btn-full"
            >
              {loading ? 'Getting Number...' : 'Get Number'}
            </button>

            {!user && (
              <div className="login-prompt">
                <p>
                  <Link href="/auth/login" className="text-blue-600 hover:underline">
                    Login
                  </Link>{" "}
                  or{" "}
                  <Link href="/auth/register" className="text-blue-600 hover:underline">
                    Sign Up
                  </Link>{" "}
                  to get started
                </p>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Available Countries
            </h3>
            <p className="text-gray-600 mb-6">
              Choose from our extensive list of supported countries
            </p>

            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Code</th>
                    <th style={{textAlign: 'right'}}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {countries.slice(0, 10).map((country) => (
                    <tr key={country.id}>
                      <td>{getCountryFlag(country.id)} {country.name}</td>
                      <td>+{country.id}</td>
                      <td style={{textAlign: 'right', fontWeight: '600', color: '#059669'}}>
                        $0.15
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
