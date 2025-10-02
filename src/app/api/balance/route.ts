import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SmsManAPI } from '@/lib/sms-man'

export async function GET(request: NextRequest) {
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

    // Get balance from SMS-man
    const smsManAPI = new SmsManAPI(user.smsManToken)
    const balance = await smsManAPI.getBalance()

    // Update user's balance in database
    await prisma.user.update({
      where: { id: payload.userId },
      data: { balance }
    })

    return NextResponse.json({
      success: true,
      data: { balance }
    })

  } catch (error) {
    console.error('Balance error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
