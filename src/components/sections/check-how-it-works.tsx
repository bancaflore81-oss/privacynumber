'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { getCountryFlag } from '@/lib/country-flags'

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
    <section className="py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Check how it works!
          </h2>
          <p className="text-lg text-muted-foreground">
            Select your country and service to get started
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Get Your Number</CardTitle>
              <CardDescription>
                Choose your country and service to receive SMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm mb-6">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleGetNumber}
                disabled={loading || !user}
              >
                {loading ? 'Getting Number...' : 'Get Number'}
              </Button>

              {!user && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  <a href="/auth/login" className="text-primary hover:underline">Login</a> or{' '}
                  <a href="/auth/register" className="text-primary hover:underline">Sign Up</a> to get started
                </p>
              )}
            </CardContent>
          </Card>

          {/* Countries Table */}
          <Card>
            <CardHeader>
              <CardTitle>Available Countries</CardTitle>
              <CardDescription>
                Choose from our extensive list of supported countries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Country</th>
                      <th className="text-left py-3 px-4 font-medium">Code</th>
                      <th className="text-right py-3 px-4 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.slice(0, 10).map((country) => (
                      <tr key={country.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{getCountryFlag(country.id)} {country.name}</td>
                        <td className="py-3 px-4">+{country.id}</td>
                        <td className="py-3 px-4 text-right">$0.15</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
