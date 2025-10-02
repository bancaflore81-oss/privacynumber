import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SmsManAPI } from '@/lib/sms-man'
import { z } from 'zod'

const purchaseSchema = z.object({
  countryId: z.string(),
  serviceId: z.string(),
  maxPrice: z.number().optional(),
  currency: z.string().default('USD')
})

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { countryId, serviceId, maxPrice, currency } = purchaseSchema.parse(body)

    // Get user's SMS-man token
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { smsManToken: true }
    })

    if (!user?.smsManToken) {
      return NextResponse.json(
        { success: false, error: 'SMS-man token not configured' },
        { status: 400 }
      )
    }

    // Purchase number from SMS-man
    const smsManAPI = new SmsManAPI(user.smsManToken)
    const result = await smsManAPI.getNumber(countryId, serviceId, maxPrice)

    // Save to database
    const smsRequest = await prisma.smsRequest.create({
      data: {
        userId: payload.userId,
        requestId: result.requestId,
        countryId,
        serviceId,
        phoneNumber: result.phoneNumber,
        maxPrice,
        currency,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })

    return NextResponse.json({
      success: true,
      data: { smsRequest }
    })

  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
