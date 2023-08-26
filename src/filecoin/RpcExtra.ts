import { EdgeFetchFunction } from 'edge-core-js/types'

interface RpcEnvelope<Data> {
  id: number
  jsonrpc: string
  result: Data
}

export type RpcChainHeadResponse = RpcEnvelope<{
  Height: number
}>

export class RpcExtra {
  baseUrl: string
  fetch: EdgeFetchFunction

  constructor(baseUrl: string, fetchFn: EdgeFetchFunction) {
    this.baseUrl = baseUrl
    this.fetch = fetchFn
  }

  async getChainHead(): Promise<RpcChainHeadResponse> {
    const nonce = Math.floor(Math.random() * 10 ** 8)
    const response = await this.fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        id: nonce,
        jsonrpc: '2.0',
        method: 'Filecoin.ChainHead',
        params: null
      })
    })
    const responseText = await response.text()
    const responseBody = JSON.parse(responseText)
    return responseBody
  }
}
