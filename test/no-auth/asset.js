const assert = require('assert').strict
const supertest = require('supertest')

const api = supertest('https://api.gopax.co.kr')

describe('Assets', () => {

  it('get return assets', () => {
    return api.get('/assets')
      .expect(200)
      .then(({ body }) => {
        assert.deepStrictEqual(body, require('../data/assets'))
      })
  })
})
