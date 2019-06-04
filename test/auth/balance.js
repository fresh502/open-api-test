const expect = require('chai').expect
const supertest = require('supertest')

const generateSignature = require('../lib/generateSignature')

const api = supertest('https://api.gopax.co.kr')

// TODO set before run test
const API_KEY = '61c3c6c3-2410-4e11-863a-0b1eba60bfe9'
const SECRET = 'kEO9mHCtFMF4KsmTXb46O9KxxuNhHPaDFmuc0nX+jTsm4dnWgcM4ME8k28tirWkVDjC47UZke2PFFcKmjlJc5g=='

describe('Balances', () => {

  it('get return balances', () => {
    const nonce = Date.now()
    const path = '/balances'

    return api.get(path)
      .set('API-KEY', API_KEY)
      .set('SIGNATURE', generateSignature(SECRET, nonce, 'GET', path))
      .set('NONCE', nonce)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(({ body }) => {
        const assets = require('../data/assets')
        body.forEach((balance, idx) => {
          expect(balance).to.have.property('asset').that.is.equal(assets[idx].id)
          expect(balance).to.have.property('avail').that.is.a('number')
          expect(balance).to.have.property('hold').that.is.a('number')
          expect(balance).to.have.property('pendingWithdrawal').that.is.a('number')
        })
      })
  })

  it('get return KRW balance', () => {
    const nonce = Date.now()
    const KRW = 'KRW'
    const path = `/balances/${KRW}`
    return api.get(path)
      .set('API-KEY', API_KEY)
      .set('SIGNATURE', generateSignature(SECRET, nonce, 'GET', path))
      .set('NONCE', nonce)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(({ body }) => {
        expect(body).to.have.property('asset').that.is.equal(KRW)
        expect(body).to.have.property('avail').that.is.a('number')
        expect(body).to.have.property('hold').that.is.a('number')
        expect(body).to.have.property('pendingWithdrawal').that.is.a('number')
      })
  })

})
