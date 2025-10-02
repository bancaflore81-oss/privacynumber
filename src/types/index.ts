export interface User {
  id: string
  email: string
  name?: string
  smsManToken?: string
  balance: number
  createdAt: Date
  updatedAt: Date
}

export interface SmsRequest {
  id: string
  userId: string
  requestId: string
  countryId: string
  serviceId: string
  phoneNumber?: string
  status: SmsStatus
  maxPrice?: number
  currency: string
  smsCode?: string
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export enum SmsStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  CLOSE = 'CLOSE',
  REJECT = 'REJECT',
  USED = 'USED',
  EXPIRED = 'EXPIRED'
}

export interface Country {
  id: string
  name: string
}

export interface Service {
  id: string
  name: string
}

export interface Price {
  country_id: string
  service_id: string
  price: number
  currency: string
}

export interface PurchaseRequest {
  countryId: string
  serviceId: string
  maxPrice?: number
  currency?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
