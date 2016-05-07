/// <reference path="../typings/main.d.ts" />
"use strict";
const index_1 = require('../index');
const token = process.env.BOT_TOCKEN || '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
const bot = new index_1.default(token, { autoUpdate: true });
bot.on('update.message.text', (msg) => {
    console.log('update.message', msg);
    bot.sendMessage({
        chat_id: msg.chat.id,
        text: msg.text
    })
        .then(() => {
        console.log('Message sent');
    })
        .catch((err) => {
        console.log('Send Message Error:', err);
    });
});