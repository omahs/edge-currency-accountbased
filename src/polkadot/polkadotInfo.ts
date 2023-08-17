import { EdgeCurrencyInfo } from 'edge-core-js/types'

import { makeOuterPlugin } from '../common/innerPlugin'
import type { PolkadotTools } from './PolkadotTools'
import type { PolkadotNetworkInfo } from './polkadotTypes'

const networkInfo: PolkadotNetworkInfo = {
  rpcNodes: ['wss://rpc.polkadot.io'],
  genesisHash:
    '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  subscanBaseUrl: 'https://polkadot.api.subscan.io/api',
  subscanQueryLimit: 100,
  existentialDeposit: '10000000000',
  lengthFeePerByte: '1000000'
}

export const currencyInfo: EdgeCurrencyInfo = {
  currencyCode: 'DOT',
  displayName: 'Polkadot',
  pluginId: 'polkadot',
  walletType: 'wallet:polkadot',

  // Explorers:
  addressExplorer: 'https://polkadot.subscan.io/account/%s',
  transactionExplorer: 'https://polkadot.subscan.io/extrinsic/%s',

  denominations: [
    {
      name: 'DOT',
      multiplier: '10000000000',
      symbol: ''
    }
  ],

  // No memo support:
  memoOptions: [],

  // Deprecated:
  defaultSettings: {},
  metaTokens: []
}

export const polkadot = makeOuterPlugin<PolkadotNetworkInfo, PolkadotTools>({
  currencyInfo,
  networkInfo,

  checkEnvironment: () => {
    if (global.BigInt == null) {
      throw new Error('Polkadot requires bigint support')
    }
  },

  async getInnerPlugin() {
    return await import(
      /* webpackChunkName: "polkadot" */
      './PolkadotTools'
    )
  }
})
