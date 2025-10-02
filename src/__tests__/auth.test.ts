import { hashPassword, verifyPassword, generateToken, verifyToken } from '../lib/auth'

describe('Auth utilities', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'testpassword123'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(0)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testpassword123'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testpassword123'
      const wrongPassword = 'wrongpassword'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await verifyPassword(wrongPassword, hashedPassword)
      expect(isValid).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const payload = { userId: '123', email: 'test@example.com' }
      const token = generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })
  })

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const payload = { userId: '123', email: 'test@example.com' }
      const token = generateToken(payload)
      
      const verifiedPayload = verifyToken(token)
      expect(verifiedPayload).toMatchObject(payload)
      expect(verifiedPayload?.userId).toBe(payload.userId)
      expect(verifiedPayload?.email).toBe(payload.email)
    })

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here'
      
      const verifiedPayload = verifyToken(invalidToken)
      expect(verifiedPayload).toBeNull()
    })
  })
})
