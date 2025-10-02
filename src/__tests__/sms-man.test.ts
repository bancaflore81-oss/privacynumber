import { SmsManAPI } from '../lib/sms-man'

// Mock axios
jest.mock('axios')
import axios from 'axios'

describe('SmsManAPI', () => {
  let smsManAPI: SmsManAPI

  beforeEach(() => {
    smsManAPI = new SmsManAPI('test-token')
    jest.clearAllMocks()
  })

  describe('getCountries', () => {
    it('should fetch countries successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: [
            { id: '1', name: 'United States' },
            { id: '2', name: 'United Kingdom' }
          ]
        }
      }
      axios.get.mockResolvedValue(mockResponse)

      const result = await smsManAPI.getCountries()

      expect(result).toEqual([
        { id: '1', name: 'United States' },
        { id: '2', name: 'United Kingdom' }
      ])
      expect(axios.get).toHaveBeenCalledWith(
        'https://test-api.com',
        {
          params: {
            action: 'get_countries',
            token: 'test-token'
          }
        }
      )
    })

    it('should throw error when API returns error', async () => {
      const mockResponse = {
        data: {
          status: 'error',
          message: 'Invalid token'
        }
      }
      axios.get.mockResolvedValue(mockResponse)

      await expect(smsManAPI.getCountries()).rejects.toThrow('Invalid token')
    })
  })

  describe('getServices', () => {
    it('should fetch services successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: [
            { id: 'telegram', name: 'Telegram' },
            { id: 'whatsapp', name: 'WhatsApp' }
          ]
        }
      }
      axios.get.mockResolvedValue(mockResponse)

      const result = await smsManAPI.getServices()

      expect(result).toEqual([
        { id: 'telegram', name: 'Telegram' },
        { id: 'whatsapp', name: 'WhatsApp' }
      ])
    })
  })

  describe('getNumber', () => {
    it('should purchase number successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            request_id: '12345',
            number: '+1234567890'
          }
        }
      }
      axios.get.mockResolvedValue(mockResponse)

      const result = await smsManAPI.getNumber('1', 'telegram')

      expect(result).toEqual({
        requestId: '12345',
        phoneNumber: '+1234567890'
      })
    })
  })

  describe('getSms', () => {
    it('should get SMS code successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            sms: '123456'
          }
        }
      }
      axios.get.mockResolvedValue(mockResponse)

      const result = await smsManAPI.getSms('12345')

      expect(result).toEqual({
        status: 'received',
        smsCode: '123456'
      })
    })

    it('should return waiting status when SMS not received', async () => {
      const mockResponse = {
        data: {
          status: 'error',
          message: 'wait_sms'
        }
      }
      axios.get.mockResolvedValue(mockResponse)

      const result = await smsManAPI.getSms('12345')

      expect(result).toEqual({
        status: 'waiting'
      })
    })
  })
})
