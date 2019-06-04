const crypto = require('crypto')

function generateSignature(secret, nonce, method, path, body = null) {
  const requestPath = path.split('?')[0]
  const _body = body ? JSON.stringify(body) : ''
  const what = `${nonce}${method}${requestPath}${_body}`
  const key = Buffer.from(secret, 'base64')
  const hmac = crypto.createHmac('sha512', key)
  return hmac.update(what).digest('base64')
}

module.exports = generateSignature
