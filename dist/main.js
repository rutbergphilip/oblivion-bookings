"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const button_factory_1 = require("./events/interactions/button/button.factory");
const requestEmbed_build_1 = require("./build/requestEmbed.build");
const discord_js_1 = require("discord.js");
const rest_1 = require("@discordjs/rest");
require('dotenv').config();
class Main {
    constructor() {
        this.rest = new rest_1.REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
        this.client = new discord_js_1.Client({
            restTimeOffset: 0,
            intents: new discord_js_1.Intents([
                discord_js_1.Intents.FLAGS.GUILDS,
                discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
                discord_js_1.Intents.FLAGS.GUILD_PRESENCES,
                discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
                discord_js_1.Intents.FLAGS.GUILD_INVITES,
                discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                discord_js_1.Intents.FLAGS.GUILD_INTEGRATIONS,
            ]),
            partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.on('ready', () => __awaiter(this, void 0, void 0, function* () {
                this.client.user.setActivity({
                    name: 'Starting...',
                    type: 1 /* STREAMING */,
                });
                yield requestEmbed_build_1.RequestEmbedBuilder.build(this.client);
                console.log('Ready!');
                this.client.user.setActivity({
                    name: 'Making your life easier...',
                    type: 5 /* COMPETING */,
                });
            }));
            this.client.on('interactionCreate', (interaction) => __awaiter(this, void 0, void 0, function* () {
                console.log('Interaction created!');
                const factory = new button_factory_1.ButtonFactory();
                switch (true) {
                    case interaction.isButton():
                        yield factory.allocateTask(interaction);
                        break;
                }
            }));
            this.client.on('messageCreate', (message) => __awaiter(this, void 0, void 0, function* () {
                console.log('Message created!');
                if (message.partial) {
                    message = yield message.fetch();
                }
            }));
            this.client
                .login(process.env.DISCORD_TOKEN)
                .catch((err) => console.error('Shit went wrong', err));
        });
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const main = new Main();
    yield main.start().catch((err) => console.error('Shit went wrong', err));
}))();
