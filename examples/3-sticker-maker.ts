/// <reference path="../typings/main.d.ts" />

import TelegramBot from '../index';

const token = process.env.TEST_TOKEN || '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11'
const bot = new TelegramBot(token, {autoUpdate: true});

bot.on('update.message.text', (msg) => {
  console.log('new text message recived');
  // console.log(msg);

  if (msg.text.match(/^hi/i)) {
    bot.sendSticker({
      chat_id: msg.chat.id,
      sticker: './hi.png'
    })
    .then(() => {
      console.log('Messages sent.');
    })
    .catch((err) => {
      console.log('Send Message Error:', err);
    });
  }
});

console.log('Bot actived, say hi to the bot');

// Run command:
// BOT_TOCKEN=your_bot_token node 2-upload-photo.js
