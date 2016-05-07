/// <reference path="../typings/main.d.ts" />

import debug = require('debug');
const EventEmitter = require('events');
const logEvents = debug('TelegramBotApi:events');
const log = debug('TelegramBotApi:update');
const _extend = require('lodash/extend');

import TelegramBotApiMethods from './telegram-bot-methods'

logEvents('init');

/**
 * @class TelegramBotApi
 */
export default class TelegramBotApi extends TelegramBotApiMethods{
  public events = new EventEmitter();

  public options = {
    gzip: true,
    autoChatAction: true,
    autoUpdate: false,
    updateInterval: 1000,
    updateLimit: 50,
    updatePoolingTimeout: 0
  }

  /**
   * create a TelegramBotApi
   * @param {string} token
   * @param {Object} options
   */
  constructor(token?: string, options?: {
    gzip?: boolean,
    autoChatAction?: boolean,
    autoUpdate?: boolean,
    updateInterval?: number,
    updateLimit?: number,
    updatePoolingTimeout?: number
  }) {
    super(token, options);
    _extend(this.options, options);

    logEvents('constructor');

    if (this.options.autoUpdate) {
      this.startAutoUpdate();
    }
  }

  /**
   * Add event listener to events
   * @param  {string} eventName
   * @param  {Function} listener
   */
  on(eventName: string, listener: Function) {
    logEvents(`on ${eventName}`);
    this.events.addListener(eventName, listener);
  }

  /**
   * Add one time event listener to events
   * @param  {string} eventName
   * @param  {Function} listener
   */
  once(eventName: string, listener: Function) {
    logEvents(`once ${eventName}`);
    this.events.once(eventName, listener);
  }

  /**
   * Remove special listener from events
   * @param  {string} eventName
   * @param  {Function} listener
   */
  off(eventName: string, listener: Function) {
    logEvents(`off ${eventName}`);
    this.events.removeListener(eventName, listener);
  }

  /**
   * Remove all listeners form events
   * @param  {string} eventName
   * @param  {Function} listener
   */
  offAll(eventName?: string) {
    logEvents(`offAll ${eventName}`);
    if (eventName) {
      this.events.removeAllListeners(eventName);
    } else {
      this.events.removeAllListeners();
    }
  }

  /**
   * Emit special event
   * @param  {string} eventName
   * @param  {Function} listener
   */
  emit(eventName: string, ...args) {
    logEvents(`Emit ${eventName}`);
    this.events.emit(eventName, ...args);
  }

  private _setTimeout: NodeJS.Timer;

  private _updateOffset: number = 0;

  static async _getUpdates(_this: TelegramBotApi) {
    log('_getUpdates');

    try {
      let data = await _this.getUpdates({
        offset: _this._updateOffset,
        limit: _this.options.updateLimit,
        timeout: _this.options.updatePoolingTimeout
      });

      if(data && data.ok && data.result && data.result.length) {
        log('new update');

        data.result.forEach((item) => {
          _this._updateOffset = item.update_id + 1;
          setImmediate(() => {
            let itemData = item;
            _this.emit('update', itemData);

            let eventName;
            if ('inline_query' in item) {itemData = item.inline_query; eventName = 'inline_query';}
            if ('chosen_inline_result' in item) {itemData = item.chosen_inline_result; eventName = 'chosen_inline_result';}
            if ('callback_query' in item) {itemData = item.callback_query; eventName = 'callback_query';}
            if ('message' in item) {
              itemData = item.message;
              eventName = 'message';

              if ('new_chat_member' in itemData) eventName = 'new_chat_member';
              if ('left_chat_member' in itemData) eventName = 'left_chat_member';
              if ('new_chat_title' in itemData) eventName = 'new_chat_title';
              if ('new_chat_photo' in itemData) eventName = 'new_chat_photo';
              if ('delete_chat_photo' in itemData) eventName = 'delete_chat_photo';
              if ('group_chat_created' in itemData) eventName = 'group_chat_created';
              if ('supergroup_chat_created' in itemData) eventName = 'supergroup_chat_created';
              if ('channel_chat_created' in itemData) eventName = 'channel_chat_created';
              if ('migrate_to_chat_id' in itemData) eventName = 'migrate_to_supergroup';
              if ('migrate_from_chat_id' in itemData) eventName = 'migrate_to_supergroup';
              if ('pinned_message' in itemData) eventName = 'pinned_message';
            }

            _this.emit(`update.${eventName}`, itemData);

            if (eventName === 'message') {
              let messageType;
              if ('text' in itemData) messageType = 'text';
              if ('audio' in itemData) messageType = 'audio';
              if ('document' in itemData) messageType = 'document';
              if ('photo' in itemData) messageType = 'photo';
              if ('sticker' in itemData) messageType = 'sticker';
              if ('video' in itemData) messageType = 'video';
              if ('voice' in itemData) messageType = 'voice';
              if ('contact' in itemData) messageType = 'contact';
              if ('location' in itemData) messageType = 'location';
              if ('venue' in itemData) messageType = 'venue';
              if ('pinned_message' in itemData) messageType = 'pinned_message';

              _this.emit(`update.${eventName}.${messageType}`, itemData);
            }

          });
        });
      }
    }
    catch (err) {
      log('_getUpdates:Error', err);
    }

    if (_this.options.autoUpdate) {
      _this._startGetUpdates();
    }
    else {
      log('autoUpdate canceled');
    }
  }

  private _startGetUpdates() {
    this._setTimeout = setTimeout(TelegramBotApi._getUpdates, this.options.updateInterval, this);
  }

  startAutoUpdate(updateInterval: number = this.options.updateInterval) {
    log('startAutoUpdate');
    this.stopAutoUpdate();
    this.options.autoUpdate = true;
    this.options.updateInterval = updateInterval;
    this._startGetUpdates();
  }

  stopAutoUpdate() {
    log('stopAutoUpdate');
    clearTimeout(this._setTimeout);
    this.options.autoUpdate = false;
  }
}
