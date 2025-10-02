import axios from 'axios'

const SMS_MAN_BASE_URL = process.env.SMS_MAN_BASE_URL || 'https://sms-man.com/stubs/handler_api.php'

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

export interface SmsManResponse {
  status: string
  data?: any
  message?: string
}

export class SmsManAPI {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getCountries(): Promise<Country[]> {
    try {
      const response = await axios.get(`${SMS_MAN_BASE_URL}`, {
        params: {
          action: 'get_countries',
          token: this.apiKey
        }
      })
      
      if (response.data.status === 'success') {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch countries')
    } catch (error) {
      console.error('Error fetching countries:', error)
      throw error
    }
  }

  async getServices(): Promise<Service[]> {
    try {
      const response = await axios.get(`${SMS_MAN_BASE_URL}`, {
        params: {
          action: 'get_applications',
          token: this.apiKey
        }
      })
      
      if (response.data.status === 'success') {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch services')
    } catch (error) {
      console.error('Error fetching services:', error)
      throw error
    }
  }

  async getPrices(countryId?: string): Promise<Price[]> {
    try {
      const params: any = {
        action: 'get_prices',
        token: this.apiKey
      }
      
      if (countryId) {
        params.country_id = countryId
      }

      const response = await axios.get(`${SMS_MAN_BASE_URL}`, { params })
      
      if (response.data.status === 'success') {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch prices')
    } catch (error) {
      console.error('Error fetching prices:', error)
      throw error
    }
  }

  async getBalance(): Promise<number> {
    try {
      const response = await axios.get(`${SMS_MAN_BASE_URL}`, {
        params: {
          action: 'get_balance',
          token: this.apiKey
        }
      })
      
      if (response.data.status === 'success') {
        return parseFloat(response.data.data?.balance || '0')
      }
      throw new Error(response.data.message || 'Failed to fetch balance')
    } catch (error) {
      console.error('Error fetching balance:', error)
      throw error
    }
  }

  async getNumber(countryId: string, serviceId: string, maxPrice?: number): Promise<{ requestId: string; phoneNumber: string }> {
    try {
      const params: any = {
        action: 'get_number',
        token: this.apiKey,
        country: countryId,
        service: serviceId
      }
      
      if (maxPrice) {
        params.max_price = maxPrice
      }

      const response = await axios.get(`${SMS_MAN_BASE_URL}`, { params })
      
      if (response.data.status === 'success') {
        return {
          requestId: response.data.data.request_id,
          phoneNumber: response.data.data.number
        }
      }
      throw new Error(response.data.message || 'Failed to get number')
    } catch (error) {
      console.error('Error getting number:', error)
      throw error
    }
  }

  async getSms(requestId: string): Promise<{ status: string; smsCode?: string }> {
    try {
      const response = await axios.get(`${SMS_MAN_BASE_URL}`, {
        params: {
          action: 'get_sms',
          token: this.apiKey,
          request_id: requestId
        }
      })
      
      if (response.data.status === 'success') {
        return {
          status: 'received',
          smsCode: response.data.data?.sms
        }
      } else if (response.data.message === 'wait_sms') {
        return { status: 'waiting' }
      }
      
      throw new Error(response.data.message || 'Failed to get SMS')
    } catch (error) {
      console.error('Error getting SMS:', error)
      throw error
    }
  }

  async setStatus(requestId: string, status: 'ready' | 'close' | 'reject' | 'used'): Promise<void> {
    try {
      const response = await axios.get(`${SMS_MAN_BASE_URL}`, {
        params: {
          action: 'set_status',
          token: this.apiKey,
          request_id: requestId,
          status
        }
      })
      
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to set status')
      }
    } catch (error) {
      console.error('Error setting status:', error)
      throw error
    }
  }
}
