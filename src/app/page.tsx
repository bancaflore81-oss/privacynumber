import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckHowItWorks } from '@/components/sections/check-how-it-works'
import { Footer } from '@/components/layout/footer'
import { Smartphone, Globe, Clock, Shield, Users, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Receive SMS Online
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Get disposable phone numbers for SMS verification instantly. 
              Perfect for online services, social media, and app registrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Receive SMS
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Rent Number
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Check How It Works Section */}
      <CheckHowItWorks />

      {/* 3 Steps Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How It Works in 3 Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground">
              Get your SMS verification number in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <CardTitle>Select Country & Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Choose your preferred country and the service you need verification for
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <CardTitle>Get Phone Number</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receive a disposable phone number instantly for your verification
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <CardTitle>Receive SMS Code</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get the verification code sent to your disposable number
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Disposable vs Rent Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Disposable vs Rent Numbers
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the option that best fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Disposable Numbers</CardTitle>
                <CardDescription>
                  One-time use for SMS verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    Perfect for one-time verifications
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    Lower cost per verification
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    Instant delivery
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    No commitment required
                  </li>
                </ul>
                <Button className="w-full">
                  Get Disposable Number
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Rent Numbers</CardTitle>
                <CardDescription>
                  Long-term numbers for ongoing use
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    Keep the same number for days/weeks
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    Multiple SMS receptions
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    Better for business use
          </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    Cost-effective for bulk usage
          </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Rent Number
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              About PrivacyNumber
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-6">
                PrivacyNumber is a leading SMS verification service that provides disposable phone numbers 
                for online verification purposes. Our platform serves millions of users worldwide, offering 
                reliable and secure SMS reception services.
              </p>
              <p className="mb-6">
                We understand the importance of privacy and security in today's digital world. That's why 
                we've built our service with the highest standards of data protection and user anonymity. 
                Whether you need to verify a social media account, register for an online service, or 
                protect your personal information, PrivacyNumber has you covered.
              </p>
              <p className="mb-8">
                Our extensive network covers over 200 countries and supports thousands of popular services 
                and applications. With instant delivery, competitive pricing, and 24/7 customer support, 
                we're committed to providing the best SMS verification experience possible.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">2M+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">200+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div className="text-center">
                <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">100%</div>
                <div className="text-sm text-muted-foreground">Secure</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join millions of users who trust PrivacyNumber for their SMS verification needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Create Free Account
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}