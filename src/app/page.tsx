import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckHowItWorks } from '@/components/sections/check-how-it-works'
import { Footer } from '@/components/layout/footer'
import { Smartphone, Globe, Clock, Shield, Users, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Receive SMS Online</h1>
          <p>
            Get disposable phone numbers for SMS verification instantly. 
            Perfect for online services, social media, and app registrations.
          </p>
          <div className="hero-buttons">
            <Link href="/auth/register" className="btn btn-primary btn-large">
              Receive SMS
            </Link>
            <Link href="/pricing" className="btn btn-outline btn-large">
              Rent Number
            </Link>
          </div>
        </div>
      </section>

      {/* Check How It Works Section */}
      <CheckHowItWorks />

      {/* 3 Steps Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get your temporary number in just 3 simple steps
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-icon">🌍</div>
              <h3>Choose Country</h3>
              <p>Select your preferred country from our extensive list of supported regions</p>
            </div>
            <div className="step">
              <div className="step-icon">📱</div>
              <h3>Get Number</h3>
              <p>Receive a temporary phone number instantly for SMS verification</p>
            </div>
            <div className="step">
              <div className="step-icon">✅</div>
              <h3>Receive SMS</h3>
              <p>Get verification codes and messages from any service or platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose PrivacyNumber?
            </h2>
            <p className="text-lg text-gray-600">
              The most reliable SMS verification service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">Your data is protected with enterprise-grade security</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Delivery</h3>
              <p className="text-gray-600">Get your number and receive SMS in seconds</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Coverage</h3>
              <p className="text-gray-600">200+ countries and thousands of services supported</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support when you need it</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trusted by Millions</h3>
              <p className="text-gray-600">Join 2M+ users who trust our service</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use</h3>
              <p className="text-gray-600">Simple interface designed for everyone</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted Worldwide
            </h2>
            <p className="text-lg text-gray-600">
              Join millions of satisfied users
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2M+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">200+</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-gray-600">Secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <div className="comparison-card text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join millions of users who trust PrivacyNumber for their SMS verification needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn btn-secondary btn-large">
                Create Free Account
              </Link>
              <Link href="/pricing" className="btn btn-outline btn-large">
                View Pricing Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}