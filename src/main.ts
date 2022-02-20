import { Client, Intents } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { ActivityTypes } from 'discord.js/typings/enums';
require('dotenv').config();

class Main {
  private readonly client: Client;
  private readonly rest: REST;

  constructor() {
    this.rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
    this.client = new Client({
      restTimeOffset: 0,
      intents: new Intents([
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
      ]),
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    });
  }

  async start(): Promise<void> {
    this.client.on('ready', async () => {
      this.client.user.setActivity({
        name: 'Starting...',
        type: ActivityTypes.STREAMING,
      });

      console.log('Ready!');
      this.client.user.setActivity({
        name: 'Making your life easier...',
        type: ActivityTypes.COMPETING,
      });
    });
    this.client
      .login(process.env.DISCORD_TOKEN)
      .catch((err) => console.error('Shit went wrong', err));
  }
}

(async () => {
  const main = new Main();
  await main.start();
})();
