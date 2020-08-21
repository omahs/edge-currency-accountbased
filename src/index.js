/**
 * Created by paul on 8/8/17.
 */
// @flow

import 'regenerator-runtime/runtime'

import { makeBinancePlugin } from './binance/bnbPlugin.js'
import { makeEosPlugin } from './eos/eosInfo.js'
import { makeTelosPlugin } from './eos/telosInfo.js'
import { makeEthereumClassicPlugin } from './ethereum/etcInfo.js'
import { makeEthereumPlugin } from './ethereum/ethInfo.js'
import { makeRskPlugin } from './ethereum/rskInfo.js'
import { makeFioPlugin } from './fio/fioPlugin'
import { makeHederaPlugin } from './hedera/hederaPlugin'
import { makeNeoPlugin } from './neo/neoPlugin.js'
import { makeOnePlugin } from './one/onePlugin.js'
import { makeStellarPlugin } from './stellar/stellarPlugin.js'
import { makeTezosPlugin } from './tezos/tezosPlugin.js'
import { makeRipplePlugin } from './xrp/xrpPlugin.js'

const plugins = {
  eos: makeEosPlugin,
  telos: makeTelosPlugin,
  ethereum: makeEthereumPlugin,
  ethereumclassic: makeEthereumClassicPlugin,
  fio: makeFioPlugin,
  // "ripple" is network name. XRP is just an asset:
  ripple: makeRipplePlugin,
  stellar: makeStellarPlugin,
  tezos: makeTezosPlugin,
  rsk: makeRskPlugin,
  binance: makeBinancePlugin,
  neo: makeNeoPlugin,
  one: makeOnePlugin,
  hedera: makeHederaPlugin
}

if (
  typeof window !== 'undefined' &&
  typeof window.addEdgeCorePlugins === 'function'
) {
  window.addEdgeCorePlugins(plugins)
}

export default plugins
