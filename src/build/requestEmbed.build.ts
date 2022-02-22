import { Logos } from '../constants/logos.enum';
import { Colors } from '../constants/colors.enum';
import { Global } from '../constants/global.enum';
import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { GlobalRepository } from '../persistance/repositories/requestpanel.repository';
import { ActionRowBuilder } from './rows.build';
import { Channels } from '../constants/channels.enum';

export class RequestEmbedBuilder {
  private static message: Message;

  static async build(client: Client): Promise<void> {
    const repository = new GlobalRepository();
    const storedMessage = await repository.get();

    const channel = <TextChannel>(
      client.guilds.cache
        .get(Global.TEST_GUILDID)
        .channels.cache.get(Channels.REQUEST_MPLUS)
    );

    const message = (await channel.messages.fetch()).find(
      (m: Message) => m.id === storedMessage?.id
    );

    this.message = !message
      ? await channel.send({
          embeds: [this.getEmbed()],
          components: [ActionRowBuilder.buildRequestPanelActionRow()],
        })
      : message;

    if (storedMessage) {
      await repository.update({
        ...storedMessage,
        ...{
          id: this.message.id,
        },
      });
    } else {
      await repository.insert({
        id: this.message.id,
        name: 'requests',
      });
    }
    return;
  }

  static getEmbed(): MessageEmbed {
    return new MessageEmbed()
      .setTitle('Mythic Plus Booking Request')
      .setDescription(
        `
Looking for a high key timed?
Or maybe wanna chill and get the weekly chore out of the way?

Request your Mythic Plus Key below!
`
      )
      .setColor(Colors.LIGHT_BLUE)
      .setFooter({
        text: 'Oblivion Marketplace',
        iconURL: Logos.MAIN,
      });
  }
}
