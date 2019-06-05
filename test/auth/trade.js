const expect = require('chai').expect
const supertest = require('supertest')

const generateSignature = require('../lib/generateSignature')

const api = supertest('https://api.gopax.co.kr')

const API_KEY = process.env.API_KEY
const SECRET = process.env.SECRET

const TIMESTAMP_REGEXP = /^\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z$/

describe('Trades', () => {

  const limit = 100
  let pastmax, latestmin

  it('get trades', () => {
    const nonce = Date.now()
    const path = '/trades'

    return api.get(path)
      .set('API-KEY', API_KEY)
      .set('SIGNATURE', generateSignature(SECRET, nonce, 'GET', path))
      .set('NONCE', nonce)
      .expect(200)
      .then(({ body }) => {
        expect(body.length).to.be.below(limit + 1)
        body.forEach(trade => {
          expect(trade).to.have.property('id').that.is.a('number')
          expect(trade).to.have.property('orderId').that.is.a('number')
          expect(trade).to.have.property('baseAmount').that.is.a('number')
          expect(trade).to.have.property('quoteAmount').that.is.a('number')
          expect(trade).to.have.property('fee').that.is.a('number')
          expect(trade).to.have.property('price').that.is.a('number')
          expect(trade).to.have.property('timestamp').that.is.match(TIMESTAMP_REGEXP)
          expect(trade).to.have.property('side').that.to.satisfy(side => {
            return side === 'buy' || side === 'sell'
          })
          expect(trade).to.have.property('tradingPairName').that.is.match(/.+-.+/)
        })

        pastmax = body[0].id
        latestmin = body[1].id
      })
  })

  // limit가 적용되지 않음
  // it('get trades (limit = 10)', () => {
  //   const nonce = Date.now()
  //   const limit = 10
  //   const path = `/trades`
  //
  //   return api.get(path)
  //     .set('API-KEY', API_KEY)
  //     .set('SIGNATURE', generateSignature(SECRET, nonce, 'GET', path))
  //     .set('NONCE', nonce)
  //     .query({ limit })
  //     .expect(200)
  //     .then(({ body }) => {
  //       expect(body.length).to.be.below(limit + 1)
  //       body.forEach(trade => {
  //         expect(trade).to.have.property('id').that.is.a('number')
  //         expect(trade).to.have.property('orderId').that.is.a('number')
  //         expect(trade).to.have.property('baseAmount').that.is.a('number')
  //         expect(trade).to.have.property('quoteAmount').that.is.a('number')
  //         expect(trade).to.have.property('fee').that.is.a('number')
  //         expect(trade).to.have.property('price').that.is.a('number')
  //         expect(trade).to.have.property('timestamp').that.is.match(TIMESTAMP_REGEXP)
  //         expect(trade).to.have.property('side').that.to.satisfy(side => {
  //           return side === 'buy' || side === 'sell'
  //         })
  //         expect(trade).to.have.property('tradingPairName').that.is.match(/.+-.+/)
  //       })
  //     })
  // })


  it('get trades (with pastmax)', () => {
    const nonce = Date.now()
    const path = `/trades`

    return api.get(path)
      .set('API-KEY', API_KEY)
      .set('SIGNATURE', generateSignature(SECRET, nonce, 'GET', path))
      .set('NONCE', nonce)
      .query({ pastmax })
      .expect(200)
      .then(({ body: [firstTrade] }) => {
        expect(firstTrade.id).to.be.below(pastmax)
      })
  })

  it('get trades (with latestmin)', () => {
    const nonce = Date.now()
    const path = `/trades`

    return api.get(path)
      .set('API-KEY', API_KEY)
      .set('SIGNATURE', generateSignature(SECRET, nonce, 'GET', path))
      .set('NONCE', nonce)
      .query({ latestmin })
      .expect(200)
      .then(({ body: [firstTrade] }) => {
        expect(firstTrade.id).to.be.above(latestmin)
      })
  })

  // after, before 타임스탬프 문제
  // it('get trades (with after)', () => {
  //   const nonce = Date.now()
  //   const path = `/trades`
  //   const after = Date.now()
  //
  //   return api.get(path)
  //     .set('API-KEY', API_KEY)
  //     .set('SIGNATURE', generateSignature(SECRET, nonce, 'GET', path))
  //     .set('NONCE', nonce)
  //     .query({ after })
  //     .expect(200)
  //     .then(res => {
  //
  //     })
  // })

  // after, before 타임스탬프 문제
  // it('get trades (with after)', () => {
  //   const nonce = Date.now()
  //   const path = `/trades`
  //   const before = Date.now()
  //
  //   return api.get(path)
  //     .set('API-KEY', API_KEY)
  //     .set('SIGNATURE', generateSignature(SECRET, nonce, 'GET', path))
  //     .set('NONCE', nonce)
  //     .query({ before })
  //     .expect(200)
  //     .then(res => {
  //
  //     })
  // })
})
