import { EdgeFetchFunction } from 'edge-core-js/types'

export interface FilscanAccountInfoResponse {
  result: {
    account_type: 'account'
    account_info: {
      account_basic: {
        account_id: string
        account_address: string
        account_type: 'account'
        account_balance: string
        nonce: number
        code_cid: string
        create_time: string
        latest_transfer_time: string
      }
    }
  }
}

export interface FilscanMessage {
  height: number
  block_time: number
  cid: string
  from: string
  to: string
  value: string
  exit_code: string
  method_name: string
}

export interface FilscanMessagesResponse {
  result: {
    messages_by_account_id_list: FilscanMessage[]
    total_count: 4
  }
}

export interface FilscanMessageDetailsResponse {
  result: {
    MessageDetails: {
      message_basic: {
        height: number
        block_time: number
        cid: string
        from: string
        to: string
        value: string
        exit_code: string
        method_name: string
      }
      blk_cids: string[]
      consume_list: Array<{
        from: string
        to: string
        value: string
        consume_type: string
      }>
      version: number
      nonce: number
      gas_fee_cap: string
      gas_premium: string
      gas_limit: number
      gas_used: string
      base_fee: string
      all_gas_fee: string
      // params_detail: null
      // returns_detail: null
      eth_message: string
    }
  }
}

export class Filscan {
  baseUrl: string
  fetch: EdgeFetchFunction

  constructor(baseUrl: string, fetchFn: EdgeFetchFunction) {
    this.baseUrl = baseUrl
    this.fetch = fetchFn
  }

  async getAccountInfo(accountId: string): Promise<FilscanAccountInfoResponse> {
    const response = await this.fetch(`${this.baseUrl}/AccountInfoByID`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        account_id: accountId
      })
    })
    const responseText = await response.text()
    const responseBody = JSON.parse(responseText)
    return responseBody
  }

  async getAccountMessages(
    accountId: string,
    index: number,
    limit: number = 20
  ): Promise<FilscanMessagesResponse> {
    const response = await this.fetch(`${this.baseUrl}/MessagesByAccountID`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        account_id: accountId,
        address: '',
        filters: {
          index,
          page: 0,
          limit: 20,
          method_name: ''
        }
      })
    })
    const responseText = await response.text()
    const responseBody = JSON.parse(responseText)
    return responseBody
  }

  async getMessageDetails(
    messageCid: string
  ): Promise<FilscanMessageDetailsResponse> {
    const response = await this.fetch(`${this.baseUrl}/MessageDetails`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        message_cid: messageCid
      })
    })
    const responseText = await response.text()
    const responseBody = JSON.parse(responseText)
    return responseBody
  }
}
