import { RequestEmbedEntity } from './persistance/entities/requestembed.entity';
import { GlobalRepository } from './persistance/repositories/global.repository';
import { ButtonFactory } from './events/interactions/button/button.factory';
import { RequestPanelBuilder } from './build/requestPanel.build';
import { Client, Intents, ButtonInteraction } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { ActivityTypes } from 'discord.js/typings/enums';
require('dotenv').config();

class Main {
  private readonly client: Client;
  private readonly rest: REST;
  private requestPanelId: string;

  constructor() {
    this.rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
    this.client = new Client({
      restTimeOffset: 0,
      intents: new Intents([
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_INVITES,
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
      });

      this.requestPanelId = (
        await new GlobalRepository().get<RequestEmbedEntity>('request')
      ).id;

      await RequestPanelBuilder.build(this.client);

      console.log('Ready!');
      this.client.user.setActivity({
        name: 'your requests',
        type: ActivityTypes.LISTENING,
      });
    });

    this.client.on('interactionCreate', async (interaction) => {
      const factory = new ButtonFactory();
      switch (true) {
        case interaction.isButton():
          await factory.run(interaction as ButtonInteraction);
          break;
      }
    });

    this.client.on('messageCreate', async (message) => {
      if (message.partial) {
        message = await message.fetch();
      }
      if (message.type === 'CHANNEL_PINNED_MESSAGE') {
        message.delete();
      }
    });

    this.client.on('messageDelete', async (message) => {
      if (message.id === this.requestPanelId) {
        this.requestPanelId = (await RequestPanelBuilder.build(this.client)).id;
      }
    });

    this.client
      .login(process.env.DISCORD_TOKEN)
      .catch((err) => console.error('Shit went wrong', err));
  }
}

(async () => {
  const main = new Main();
  await main.start().catch((err) => console.error('Shit went wrong', err));
})();
