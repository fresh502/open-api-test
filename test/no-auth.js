const supertest = require('supertest')

const api = supertest('https://api.gopax.co.kr')

describe('No auth', () => {
  it('should return asset list', () => {
    api.get('/assets')
      .expect(200)
  })
})
