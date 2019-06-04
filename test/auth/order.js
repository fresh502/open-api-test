const expect = require('chai').expect
const supertest = require('supertest')

const generateSignature = require('../lib/generateSignature')

const api = supertest('https://api.gopax.co.kr')

const API_KEY = process.env.API_KEY
const SECRET = process.env.SECRET

const TIMESTAMP_REGEXP = /^\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z$/

describe('Orders', () => {

  let orderId
  it('post order (BTC-KRW)', () => {
    const nonce = Date.now()
    const path = '/orders'
    const type = 'limit'
    const side = 'buy'
    const price = 1000000
    const amount = 0.001
    const tradingPairName = 'BTC-KRW'
    const requestBody = { type, side, price, amount, tradingPairName }
    return api.post(path)
      .set('API-KEY', API_KEY)
      .set('SIGNATURE', generateSignature(SECRET, nonce, 'POST', path, requestBody))
      .set('NONCE', nonce)
      .set('Content-Type', 'application/json')
      .send(requestBody)
      .expect(200)
      .then(({ body }) => {
        expect(body).to.have.property('id').that.is.a('string')
        expect(body).to.have.property('price').that.is.equal(price)
        expect(body).to.have.property('amount').that.is.equal(amount)
        expect(body).to.have.property('tradingPairName').that.is.equal(tradingPairName)
        expect(body).to.have.property('side').that.is.equal(side)
        expect(body).to.have.property('type').that.is.equal(type)
        expect(body).to.have.property('createdAt').that.is.match(TIMESTAMP_REGEXP)

        orderId = Number(body.id)
      })
  })

  it('get orders', () => {
    const nonce = Date.now()
    const path = '/orders'
    return api.get(path)
      .set('API-KEY', API_KEY)
      .set('SIGNATURE', generateSignature(SECRET, nonce, 'GET', path))
      .set('NONCE', nonce)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(({ body }) => {
        body.forEach(order => {
          expect(order).to.have.property('id').that.is.a('string')
          expect(order).to.have.property('status').that.is.a('string')
          expect(order).to.have.property('side').that.to.satisfy(side => {
            return side === 'buy' || side === 'sell'
          })
          expect(order).to.have.property('type').that.is.a('string')
          expect(order).to.have.property('price').that.is.a('number')
          expect(order).to.have.property('amount').that.is.a('number')
          expect(order).to.have.property('remaining').that.is.a('number')
          expect(order).to.have.property('tradingPairName').that.is.match(/.+-.+/)
          expect(order).to.have.property('createdAt').that.is.match(TIMESTAMP_REGEXP)
          expect(order).to.have.property('updatedAt').that.is.match(TIMESTAMP_REGEXP)
        })
      })
  })

  it('get specific order', () => {
    const nonce = Date.now()
    const path = `/orders/${orderId}`
    return api.get(path)
      .set('API-KEY', API_KEY)
      .set('SIGNATURE', generateSignature(SECRET, nonce, 'GET', path))
      .set('NONCE', nonce)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(({ body }) => {
        expect(body).to.have.property('id').that.is.a('string')
        expect(body).to.have.property('status').that.is.a('string')
        expect(body).to.have.property('side').that.is.equal('buy')
        expect(body).to.have.property('type').that.is.a('string')
        expect(body).to.have.property('price').that.is.a('number')
        expect(body).to.have.property('amount').that.is.a('number')
        expect(body).to.have.property('remaining').that.is.a('number')
        expect(body).to.have.property('tradingPairName').that.is.match(/.+-.+/)
        expect(body).to.have.property('createdAt').that.is.match(TIMESTAMP_REGEXP)
        expect(body).to.have.property('updatedAt').that.is.match(TIMESTAMP_REGEXP)
      })
  })

  it('delete specific order', () => {
    const nonce = Date.now()
    const path = `/orders/${orderId}`
    return api.delete(path)
      .set('API-KEY', API_KEY)
      .set('SIGNATURE', generateSignature(SECRET, nonce, 'DELETE', path))
      .set('NONCE', nonce)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then(({ body }) => {
        expect(body).to.be.empty
      })

  })

})
