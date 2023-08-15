/* global */

import { EdgeCurrencyInfo } from 'edge-core-js/types'

import { makeOuterPlugin } from '../common/innerPlugin'
import { PiratechainTools } from './PiratechainTools'
import { PiratechainNetworkInfo } from './piratechainTypes'

const networkInfo: PiratechainNetworkInfo = {
  rpcNode: {
    networkName: 'mainnet',
    defaultHost: 'lightd1.pirate.black',
    defaultPort: 443
  },
  defaultBirthday: 2040000,
  defaultNetworkFee: '10000',
  transactionQueryLimit: 999
}

const currencyInfo: EdgeCurrencyInfo = {
  // Basic currency information:
  currencyCode: 'ARRR',
  displayName: 'Pirate Chain',
  pluginId: 'piratechain',
  requiredConfirmations: 10,
  walletType: 'wallet:piratechain',

  defaultSettings: {},

  addressExplorer: '',
  transactionExplorer: 'https://explorer.pirate.black/tx/%s',

  denominations: [
    // An array of Objects of the possible denominations for this currency
    {
      name: 'ARRR',
      multiplier: '100000000',
      symbol: 'P'
    }
  ],
  metaTokens: [], // Deprecated

  unsafeBroadcastTx: true
}

export const piratechain = makeOuterPlugin<
  PiratechainNetworkInfo,
  PiratechainTools
>({
  currencyInfo,
  networkInfo,

  async getInnerPlugin() {
    return await import('./PiratechainTools')
  }
})
