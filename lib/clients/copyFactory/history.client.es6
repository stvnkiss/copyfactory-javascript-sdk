'use strict';

import MetaApiClient from '../metaApi.client';
import randomstring from 'randomstring';

/**
 * metaapi.cloud CopyFactory history API (trade copying history API) client (see
 * https://metaapi.cloud/docs/copyfactory/)
 */
export default class HistoryClient extends MetaApiClient {

  /**
   * Constructs CopyFactory history API client instance
   * @param {HttpClient} httpClient HTTP client
   * @param {String} token authorization token
   * @param {String} domain domain to connect to, default is agiliumtrade.agiliumtrade.ai
   */
  constructor(httpClient, token, domain = 'agiliumtrade.agiliumtrade.ai') {
    super(httpClient, token, domain);
    this._host = `https://copyfactory-application-history-master-v1.${domain}`;
  }

  /**
   * CopyFactory provider or subscriber user
   * @typedef {Object} CopyFactorySubscriberOrProviderUser
   * @property {String} id profile id
   * @property {String} name user name
   * @property {Array<CopyFactoryStrategyIdAndName>} strategies array of strategy IDs provided by provider
   * or subscribed to by subscriber
   */

  /**
   * CopyFactory strategy id and name
   * @typedef {Object} CopyFactoryStrategyIdAndName
   * @property {String} id unique strategy id
   * @property {String} name human-readable strategy name
   */

  /**
   * CopyFactory transaction
   * @typedef {Object} CopyFactoryTransaction
   * @property {String} id transaction id
   * @property {String} type transaction type (one of DEAL_TYPE_BUY, DEAL_TYPE_SELL, DEAL_TYPE_BALANCE,
   * DEAL_TYPE_CREDIT, DEAL_TYPE_CHARGE, DEAL_TYPE_CORRECTION, DEAL_TYPE_BONUS, DEAL_TYPE_COMMISSION,
   * DEAL_TYPE_COMMISSION_DAILY, DEAL_TYPE_COMMISSION_MONTHLY, DEAL_TYPE_COMMISSION_AGENT_DAILY,
   * DEAL_TYPE_COMMISSION_AGENT_MONTHLY, DEAL_TYPE_INTEREST, DEAL_TYPE_BUY_CANCELED, DEAL_TYPE_SELL_CANCELED,
   * DEAL_DIVIDEND, DEAL_DIVIDEND_FRANKED, DEAL_TAX). See
   * https://www.mql5.com/en/docs/constants/tradingconstants/dealproperties#enum_deal_type
   * @property {Date} time transaction time
   * @property {String} subscriberId CopyFactory subscriber id
   * @property {String} [symbol] symbol traded
   * @property {CopyFactorySubscriberOrProviderUser} subscriberUser strategy subscriber
   * @property {Boolean} demo demo account flag
   * @property {CopyFactorySubscriberOrProviderUser} providerUser strategy provider
   * @property {CopyFactoryStrategyIdAndName} strategy strategy
   * @property {String} [positionId] source position id
   * @property {String} [slavePositionId] slave position id
   * @property {Number} improvement high-water mark strategy balance improvement
   * @property {Number} providerCommission provider commission
   * @property {Number} platformCommission platform commission
   * @property {Number} [incomingProviderCommission] commission paid by provider to underlying providers
   * @property {Number} [incomingPlatformCommission] platform commission paid by provider to underlying providers
   * @property {Number} [quantity] trade volume
   * @property {Number} [lotPrice] trade lot price
   * @property {Number} [tickPrice] trade tick price
   * @property {Number} [amount] trade amount
   * @property {Number} [commission] trade commission
   * @property {Number} swap trade swap
   * @property {Number} profit trade profit
   * @property {CopyFactoryTransactionMetrics} [metrics] trade copying metrics such as slippage and latencies. Measured
   * selectively for copied trades
   */

  /**
   * Trade copying metrics such as slippage and latencies
   * @typedef {Object} CopyFactoryTransactionMetrics
   * @property {Number} [tradeCopyingLatency] trade copying latency, measured in milliseconds based on transaction time
   * provided by broker
   * @property {Number} [tradeCopyingSlippageInBasisPoints] trade copying slippage, measured in basis points (0.01
   * percent) based on transaction price provided by broker
   * @property {Number} [tradeCopyingSlippageInAccountCurrency] trade copying slippage, measured in account currency
   * based on transaction price provided by broker
   * @property {Number} [mtAndBrokerSignalLatency] trade signal latency introduced by broker and MT platform, measured
   * in milliseconds
   * @property {Number} [tradeAlgorithmLatency] trade algorithm latency introduced by CopyFactory servers, measured in
   * milliseconds
   * @property {Number} [mtAndBrokerTradeLatency] trade latency for a copied trade introduced by broker and MT platform,
   * measured in milliseconds
   */

  /**
   * Returns list of transactions on the strategies the current user provides to other users
   * https://metaapi.cloud/docs/copyfactory/restApi/api/history/getProvidedTransactions/
   * @param {Date} from time to load transactions from
   * @param {Date} till time to load transactions till
   * @param {Array<string>} [strategyIds] list of strategy ids to filter transactions by
   * @param {Array<string>} [subscriberIds] the list of CopyFactory subscriber account ids to filter by
   * @param {number} [offset] pagination offset. Default value is 0
   * @param {number} [limit] pagination limit. Default value is 1000
   * @return {Promise<Array<CopyFactoryTransaction>>} promise resolving with transactions found
   */
  async getProvidedTransactions(from, till, strategyIds, subscriberIds, offset, limit) {
    if (this._isNotJwtToken()) {
      return this._handleNoAccessError('getProvidedTransactions');
    }
    let qs = {
      from,
      till
    };
    if (strategyIds) {
      qs.strategyId = strategyIds;
    }
    if (subscriberIds) {
      qs.subscriberId = subscriberIds;
    }
    if (offset !== undefined) {
      qs.offset = offset;
    }
    if (limit) {
      qs.limit = limit;
    }
    const opts = {
      url: `${this._host}/users/current/provided-transactions`,
      method: 'GET',
      headers: {
        'auth-token': this._token
      },
      qs,
      json: true
    };
    let transactions = await this._httpClient.request(opts);
    transactions.forEach(t => t.time = new Date(t.time));
    return transactions;
  }

  /**
   * Returns list of trades on the strategies the current user subscribed to
   * https://metaapi.cloud/docs/copyfactory/restApi/api/history/getSubscriptionTransactions/
   * @param {Date} from time to load transactions from
   * @param {Date} till time to load transactions till
   * @param {Array<String>} [strategyIds] list of strategy ids to filter transactions by
   * @param {Array<string>} [subscriberIds] the list of CopyFactory subscriber account ids to filter by
   * @param {Number} offset pagination offset. Default value is 0
   * @param {Number} limit pagination limit. Default value is 1000
   * @return {Promise<Array<CopyFactoryTransaction>>} promise resolving with transactions found
   */
  async getSubscriptionTransactions(from, till, strategyIds, subscriberIds, offset, limit) {
    if (this._isNotJwtToken()) {
      return this._handleNoAccessError('getSubscriptionTransactions');
    }
    let qs = {
      from,
      till
    };
    if (strategyIds) {
      qs.strategyId = strategyIds;
    }
    if (subscriberIds) {
      qs.subscriberId = subscriberIds;
    }
    if (offset !== undefined) {
      qs.offset = offset;
    }
    if (limit) {
      qs.limit = limit;
    }
    const opts = {
      url: `${this._host}/users/current/subscription-transactions`,
      method: 'GET',
      headers: {
        'auth-token': this._token
      },
      qs,
      json: true
    };
    let transactions = await this._httpClient.request(opts);
    transactions.forEach(t => t.time = new Date(t.time));
    return transactions;
  }

}
