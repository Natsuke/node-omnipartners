
import Request from './Request'
import appendHashToData from './utils/appendHashToData'

export default class Api {
  defaultTimeout = 30 * 1000
  defaultHost = null

  constructor (config) {
    this.config = config
  }

  get host () {
    return this.config.host || this.defaultHost
  }

  async post (uri, data, options = {}) {
    return this.fetch({
      method: 'post',
      uri: this.host + uri,
      body: JSON.stringify(
        appendHashToData(data, this.config.key, this.config.secret, options)
      )
    }, options)
  }

  async get (uri, qs, options = {}) {
    return this.fetch({
      method: 'get',
      uri: this.host + uri,
      qs: appendHashToData(qs, this.config.key, this.config.secret, options)
    }, options)
  }

  async fetch (requestOptions, options = {}) {
    const req = new Request({
      timeout: this.config.timeout || this.defaultTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...requestOptions
    })

    if (this.config.onRequest) {
      this.config.onRequest(req)
    }

    await req.fetch()
    await req.response.validateStatus({
      errorMap: options.errorMap,
      validStatus: [ 0 ]
    })

    return req.response.json()
  }
}
