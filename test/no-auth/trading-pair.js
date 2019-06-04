const assert = require('assert').strict
const expect = require('chai').expect
const supertest = require('supertest')

const api = supertest('https://api.gopax.co.kr')

const TIMESTAMP_REGEXP = /^\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z$/

describe('Trading pairs', () => {

  it('get trading-pairs', () => {
    return api.get('/trading-pairs')
      .expect(200)
      .then(({ body }) => {
        assert.deepStrictEqual(body, require('../data/trading-pairs'))
      })
  })

  it('get BTC-KRW ticker', () => {
    return api.get('/trading-pairs/BTC-KRW/ticker')
      .expect(200)
      .then(({ body }) => {
        expect(body).to.have.property('price').that.is.a('number')
        expect(body).to.have.property('ask').that.is.a('number')
        expect(body).to.have.property('bid').that.is.a('number')
        expect(body).to.have.property('volume').that.is.a('number')
        expect(body).to.have.property('time').that.is.match(TIMESTAMP_REGEXP)
      })
  })

  it('get BTC-KRW orderbook', () => {
    return api.get('/trading-pairs/BTC-KRW/book')
      .expect(200)
      .then(({ body }) => {
        expect(body).to.have.property('bid').that.is.an('array')
        expect(body).to.have.property('ask').that.is.an('array')

        const { bid, ask } = body
        bid.forEach(eachBid => {
          expect(eachBid).to.be.an('array').with.lengthOf(3)
          const [bidId, bidPrice, bidAmount] = eachBid
          expect(bidId).to.be.a('string')
          expect(bidPrice).to.be.a('number')
          expect(bidAmount).to.be.a('number')
        })

        ask.forEach(eachAsk => {
          expect(eachAsk).to.be.an('array').with.lengthOf(3)
          const [askId, askPrice, askAmount] = eachAsk
          expect(askId).to.be.a('string')
          expect(askPrice).to.be.a('number')
          expect(askAmount).to.be.a('number')
        })
      })
  })

  it('get BTC-KRW orderbook (level = 1)', () => {
    return api.get('/trading-pairs/BTC-KRW/book')
      .query({ level: 1 })
      .expect(200)
      .then(({ body }) => {
        expect(body).to.have.property('sequence').that.is.a('number')
        expect(body).to.have.property('bid').that.is.an('array').with.lengthOf(1)
        expect(body).to.have.property('ask').that.is.an('array').with.lengthOf(1)
      })
  })

  it('get BTC-KRW orderbook (level = 2)', () => {
    return api.get('/trading-pairs/BTC-KRW/book')
      .query({ level: 2 })
      .expect(200)
      .then(({ body }) => {
        expect(body).to.have.property('sequence').that.is.a('number')
        expect(body).to.have.property('bid').that.is.an('array').with.lengthOf(50)
        expect(body).to.have.property('ask').that.is.an('array').with.lengthOf(50)
      })
  })

  it('get BTC-KRW trades', () => {
    return api.get('/trading-pairs/BTC-KRW/trades')
      .expect(200)
      .then(({ body: trades }) => {
        expect(trades).to.be.an('array')
        trades.forEach(trade => {
          expect(trade).to.have.property('time').that.is.match(TIMESTAMP_REGEXP)
          expect(trade).to.have.property('date').that.is.a('number')
          expect(trade).to.have.property('id').that.is.a('number')
          expect(trade).to.have.property('price').that.is.a('number')
          expect(trade).to.have.property('amount').that.is.a('number')
          expect(trade).to.have.property('side').that.to.satisfy(side => {
            return side === 'sell' || side === 'buy'
          })
        })
      })
  })

  let pastmax, latestmin
  it('get BTC-KRW trades (limit = 100)', () => {
    const limit = 100
    return api.get('/trading-pairs/BTC-KRW/trades')
      .query({ limit })
      .expect(200)
      .then(({ body }) => {
        expect(body).to.be.an('array').that.is.lengthOf(limit)

        pastmax = body[0].id
        latestmin = body[1].id
      })
  })

  // TODO pastmax?
  it('get BTC-KRW trades (with pastmax)', () => {
    return api.get('/trading-pairs/BTC-KRW/trades')
      .query({ pastmax })
      .expect(200)
      .then(({ body }) => {
        expect(body).to.be.an('array')
        expect(body[0].id).to.be.below(pastmax)
      })
  })

  // TODO latestmin
  it('get BTC-KRW trades (with latestmin)', () => {
    return api.get('/trading-pairs/BTC-KRW/trades')
      .query({ latestmin })
      .expect(200)
      .then(({ body }) => {
        expect(body).to.be.an('array')
        expect(body[0].id).to.be.above(latestmin)
      })
  })

  // TODO 유닉스 타임스탬프? 예시의 리스폰스 타임값이 이상하고 임의의 타임스탬프 값을 넣을 경우 범위 문제 발생하는 듯
  // 아래의 candles API와 비교
  // it('get BTC-KRW trades (with after)', () => {
  //   // const after = Date.now() - (100 * 60 * 1000)
  //   const after = 1521000077
  //   console.log(after)
  //   return api.get('/trading-pairs/BTC-KRW/trades')
  //     .query({ after })
  //     .expect(200)
  //     .then(res => {
  //       console.log(res)
  //       // console.log(body)
  //       expect(body).to.be.an('array')
  //       expect(body[0].id).to.not.equal(latestmin)
  //     })
  // })

  it('get BTC-KRW trade stats', () => {
    return api.get('/trading-pairs/BTC-KRW/stats')
      .expect(200)
      .then(({ body }) => {
        expect(body).to.have.property('open').that.is.a('number')
        expect(body).to.have.property('high').that.is.a('number')
        expect(body).to.have.property('low').that.is.a('number')
        expect(body).to.have.property('close').that.is.a('number')
        expect(body).to.have.property('volume').that.is.a('number')
        expect(body).to.have.property('time').that.is.match(TIMESTAMP_REGEXP)
      })
  })

  it('get BTC-KRW candles', () => {
    const minutes = 10
    const start = Date.now() - (minutes * 60 * 1000)
    const end = Date.now()
    const interval = 1
    return api.get('/trading-pairs/BTC-KRW/candles')
      .query({ start, end, interval })
      .expect(200)
      .then(({ body }) => {
        expect(body).to.be.an('array').with.lengthOf(minutes / interval + 1)
        body.forEach(eachCandle => {
          expect(eachCandle).to.be.an('array').with.lengthOf(6)
          const [time, low, high, open, close, volume] = eachCandle
          expect(time).to.be.a('number')
          expect(low).to.be.a('number')
          expect(high).to.be.a('number')
          expect(open).to.be.a('number')
          expect(close).to.be.a('number')
          expect(volume).to.be.a('number')
        })
      })
  })

  it('get all trade 24 hour stats', () => {
    return api.get('/trading-pairs/stats')
      .expect(200)
      .then(({ body }) => {
        const tradingPairs = require('../data/trading-pairs')
        body.forEach((pair, idx) => {
          expect(pair).to.have.property('name').that.is.equal(tradingPairs[idx].name)
          expect(pair).to.have.property('open').that.is.a('number')
          expect(pair).to.have.property('high').that.is.a('number')
          expect(pair).to.have.property('low').that.is.a('number')
          expect(pair).to.have.property('close').that.is.a('number')
          expect(pair).to.have.property('volume').that.is.a('number')
          expect(pair).to.have.property('time').that.is.match(TIMESTAMP_REGEXP)
        })
      })
  })

})
