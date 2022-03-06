import { RequestEmbedEntity } from './../persistance/entities/requestembed.entity';
import { Logos } from '../constants/logos.enum';
import { Colors } from '../constants/colors.enum';
import { Global } from '../constants/global.enum';
import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { GlobalRepository } from '../persistance/repositories/global.repository';
import { ActionRowBuilder } from './rows.build';
import { Channels } from '../constants/channels.enum';

export class RequestPanelBuilder {
  private static message: Message;

  static async build(client: Client): Promise<RequestEmbedEntity> {
    const repository = new GlobalRepository();
    const requestPanel = await repository.get<RequestEmbedEntity>('requests');

    const channel = <TextChannel>(
      client.guilds.cache
        .get(Global.TEST_GUILDID)
        .channels.cache.get(Channels.REQUEST_MPLUS)
    );

    const message = await channel.messages.fetch(requestPanel?.id);

    this.message = !message
      ? await channel.send({
          embeds: [this.getEmbed()],
          components: [ActionRowBuilder.buildRequestPanelActionRow()],
        })
      : message;

    if (requestPanel) {
      await repository.update({
        ...requestPanel,
        ...{
          id: this.message.id,
        },
      });
      return;
    }

    return await repository.insert({
      id: this.message.id,
      name: 'requests',
    });
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
