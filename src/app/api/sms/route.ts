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

    const smsRequests = await prisma.smsRequest.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: { smsRequests }
    })

  } catch (error) {
    console.error('SMS requests error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
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

    // Check SMS status from SMS-man
    const smsManAPI = new SmsManAPI(user.smsManToken)
    const smsResult = await smsManAPI.getSms(requestId)

    // Update database
    const updatedRequest = await prisma.smsRequest.update({
      where: { requestId },
      data: {
        smsCode: smsResult.smsCode,
        status: smsResult.status === 'received' ? 'READY' : 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      data: { smsRequest: updatedRequest }
    })

  } catch (error) {
    console.error('SMS update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
