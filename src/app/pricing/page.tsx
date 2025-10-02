'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCountryFlag } from '@/lib/country-flags'
import { DollarSign, Globe, Clock } from 'lucide-react'

interface Price {
  country_id: string
  service_id: string
  price: number
  currency: string
}

interface Country {
  id: string
  name: string
}

export default function PricingPage() {
  const [prices, setPrices] = useState<Price[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCountries()
  }, [])

  useEffect(() => {
    if (selectedCountry) {
      fetchPrices(selectedCountry)
    }
  }, [selectedCountry])

  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to view pricing')
        setLoading(false)
        return
      }

      const response = await fetch('/api/countries', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setCountries(data.data.countries)
        if (data.data.countries.length > 0) {
          setSelectedCountry(data.data.countries[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching countries:', err)
      setError('Failed to load countries')
    } finally {
      setLoading(false)
    }
  }

  const fetchPrices = async (countryId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/prices?countryId=${countryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setPrices(data.data.prices)
      }
    } catch (err) {
      console.error('Error fetching prices:', err)
    }
  }

  const getServiceName = (serviceId: string) => {
    const serviceNames: { [key: string]: string } = {
      'telegram': 'Telegram',
      'whatsapp': 'WhatsApp',
      'facebook': 'Facebook',
      'instagram': 'Instagram',
      'twitter': 'Twitter',
      'google': 'Google',
      'microsoft': 'Microsoft',
      'apple': 'Apple',
      'discord': 'Discord',
      'snapchat': 'Snapchat',
      'tiktok': 'TikTok',
      'uber': 'Uber',
      'lyft': 'Lyft',
      'airbnb': 'Airbnb',
      'paypal': 'PayPal',
      'amazon': 'Amazon',
      'netflix': 'Netflix',
      'spotify': 'Spotify',
      'uber_eats': 'Uber Eats',
      'doordash': 'DoorDash',
    }
    return serviceNames[serviceId] || serviceId
  }

  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId)
    return country?.name || countryId
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading pricing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SMS Verification Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transparent pricing for SMS verification services. 
            Choose your country to see current rates.
          </p>
        </div>

        {/* Country Selector */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Select Country</CardTitle>
              <CardDescription>
                Choose a country to view SMS verification prices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
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
            </CardContent>
          </Card>
        </div>

        {/* Pricing Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Pay Per Use</CardTitle>
                <CardDescription>
                  Only pay for what you use
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  No monthly fees or subscriptions. Pay only when you request a phone number.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Global Coverage</CardTitle>
                <CardDescription>
                  200+ countries available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Get phone numbers from countries worldwide for your verification needs.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Instant Delivery</CardTitle>
                <CardDescription>
                  Get numbers in seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Receive your disposable phone number instantly after payment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Table */}
        {selectedCountry && (
          <Card>
            <CardHeader>
              <CardTitle>
                Pricing for {getCountryName(selectedCountry)}
              </CardTitle>
              <CardDescription>
                Current SMS verification rates by service
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No pricing data available for this country</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Service</th>
                        <th className="text-right py-3 px-4 font-medium">Price</th>
                        <th className="text-center py-3 px-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prices.map((price, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium">
                              {getServiceName(price.service_id)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {price.service_id}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-medium">
                              ${price.price.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {price.currency}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button size="sm">
                              Request Number
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Card className="hero-gradient">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Create your account and start using SMS verification today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  Create Free Account
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
