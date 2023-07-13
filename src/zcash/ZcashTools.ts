import { div } from 'biggystring'
import { entropyToMnemonic, validateMnemonic } from 'bip39'
import { Buffer } from 'buffer'
import {
  EdgeCurrencyInfo,
  EdgeCurrencyTools,
  EdgeEncodeUri,
  EdgeIo,
  EdgeMetaToken,
  EdgeParsedUri,
  EdgeTokenMap,
  EdgeWalletInfo,
  JsonObject
} from 'edge-core-js/types'
import { Tools as ToolsType } from 'react-native-zcash'

import { PluginEnvironment } from '../common/innerPlugin'
import { asIntegerString } from '../common/types'
import { encodeUriCommon, parseUriCommon } from '../common/uriHelpers'
import { getDenomInfo } from '../common/utils'
import {
  asZcashPrivateKeys,
  asZecPublicKey,
  UnifiedViewingKey,
  ZcashNetworkInfo
} from './zcashTypes'

export class ZcashTools implements EdgeCurrencyTools {
  builtinTokens: EdgeTokenMap
  currencyInfo: EdgeCurrencyInfo
  io: EdgeIo
  networkInfo: ZcashNetworkInfo
  Tools: typeof ToolsType

  constructor(env: PluginEnvironment<ZcashNetworkInfo>) {
    const { builtinTokens, currencyInfo, io, networkInfo } = env
    this.builtinTokens = builtinTokens
    this.currencyInfo = currencyInfo
    this.io = io
    this.networkInfo = networkInfo

    const RNAccountbased = env.nativeIo['edge-currency-accountbased']
    if (RNAccountbased == null) {
      throw new Error('Need opts')
    }
    const { Tools } = RNAccountbased[this.networkInfo.nativeSdk]

    this.Tools = Tools
  }

  async getNewWalletBirthdayBlockheight(): Promise<number> {
    try {
      return await this.Tools.getBirthdayHeight(
        this.networkInfo.rpcNode.defaultHost,
        this.networkInfo.rpcNode.defaultPort
      )
    } catch (e: any) {
      return this.networkInfo.defaultBirthday
    }
  }

  async isValidAddress(address: string): Promise<boolean> {
    return await this.Tools.isValidAddress(address)
  }

  // will actually use MNEMONIC version of private key
  async importPrivateKey(
    userInput: string,
    opts: JsonObject = {}
  ): Promise<Object> {
    const { pluginId } = this.currencyInfo
    const isValid = validateMnemonic(userInput)
    if (!isValid)
      throw new Error(`Invalid ${this.currencyInfo.currencyCode} mnemonic`)

    // Get current network height for the birthday height
    const currentNetworkHeight = await this.getNewWalletBirthdayBlockheight()

    let height = currentNetworkHeight

    const { birthdayHeight } = opts
    if (birthdayHeight != null) {
      asIntegerString(birthdayHeight)

      const birthdayHeightInt = parseInt(birthdayHeight)

      if (birthdayHeightInt > currentNetworkHeight) {
        throw new Error('InvalidBirthdayHeight') // must be less than current block height (assuming query was successful)
      }
      height = birthdayHeightInt
    }

    return {
      [`${pluginId}Mnemonic`]: userInput,
      [`${pluginId}BirthdayHeight`]: height
    }
  }

  async createPrivateKey(walletType: string): Promise<Object> {
    if (walletType !== this.currencyInfo.walletType) {
      throw new Error('InvalidWalletType')
    }

    const entropy = Buffer.from(this.io.random(32)).toString('hex')
    const mnemonic = entropyToMnemonic(entropy)
    return await this.importPrivateKey(mnemonic)
  }

  async checkPublicKey(publicKey: JsonObject): Promise<boolean> {
    try {
      asZecPublicKey(publicKey)
      return true
    } catch (err) {
      return false
    }
  }

  async derivePublicKey(walletInfo: EdgeWalletInfo): Promise<Object> {
    const { pluginId } = this.currencyInfo
    const zcashPrivateKeys = asZcashPrivateKeys(pluginId)(walletInfo.keys)
    if (walletInfo.type !== this.currencyInfo.walletType) {
      throw new Error('InvalidWalletType')
    }

    const mnemonic = zcashPrivateKeys.mnemonic
    if (typeof mnemonic !== 'string') {
      throw new Error('InvalidMnemonic')
    }
    const unifiedViewingKey: UnifiedViewingKey =
      await this.Tools.deriveViewingKey(
        mnemonic,
        this.networkInfo.rpcNode.networkName
      )
    return {
      birthdayHeight: zcashPrivateKeys.birthdayHeight,
      publicKey: unifiedViewingKey
    }
  }

  async parseUri(
    uri: string,
    currencyCode?: string,
    customTokens?: EdgeMetaToken[]
  ): Promise<EdgeParsedUri> {
    const { pluginId } = this.currencyInfo
    const networks = { [pluginId]: true }

    const {
      edgeParsedUri,
      edgeParsedUri: { publicAddress }
    } = parseUriCommon(
      this.currencyInfo,
      uri,
      networks,
      currencyCode ?? this.currencyInfo.currencyCode,
      customTokens
    )

    if (publicAddress == null || !(await this.isValidAddress(publicAddress))) {
      throw new Error('InvalidPublicAddressError')
    }

    return edgeParsedUri
  }

  async encodeUri(
    obj: EdgeEncodeUri,
    customTokens?: EdgeMetaToken[]
  ): Promise<string> {
    const { pluginId } = this.currencyInfo
    const { nativeAmount, currencyCode, publicAddress } = obj

    if (!(await this.isValidAddress(publicAddress))) {
      throw new Error('InvalidPublicAddressError')
    }

    let amount
    if (nativeAmount != null) {
      const denom = getDenomInfo(
        this.currencyInfo,
        currencyCode ?? this.currencyInfo.currencyCode,
        customTokens
      )
      if (denom == null) {
        throw new Error('InternalErrorInvalidCurrencyCode')
      }
      amount = div(nativeAmount, denom.multiplier, 18)
    }
    const encodedUri = encodeUriCommon(obj, `${pluginId}`, amount)
    return encodedUri
  }
}

export async function makeCurrencyTools(
  env: PluginEnvironment<ZcashNetworkInfo>
): Promise<ZcashTools> {
  return new ZcashTools(env)
}

export { makeCurrencyEngine } from './ZcashEngine'
