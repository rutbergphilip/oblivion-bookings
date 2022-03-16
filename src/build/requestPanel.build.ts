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
    const requestPanel = await repository.get<RequestEmbedEntity>(
      'requestPanel'
    );

    try {
      const guild = client.guilds.cache.get(Global.GUILD_ID);

      const channel = <TextChannel>(
        (guild.channels.cache.get(Channels.REQUEST_MPLUS) ||
          (await guild.channels.fetch(Channels.REQUEST_MPLUS)))
      );

      const message = requestPanel?.id
        ? channel.messages.cache.get(requestPanel.id) ||
          (await channel.messages.fetch(requestPanel.id).catch(() => null))
        : null;

      this.message = !message
        ? await channel.send({
            embeds: [this.getEmbed()],
            components: [ActionRowBuilder.buildRequestPanelActionRow()],
          })
        : message;

      if (requestPanel) {
        return await repository.update({
          ...requestPanel,
          ...{
            id: this.message.id,
          },
        });
      }

      return await repository.insert({
        id: this.message.id,
        name: 'requestPanel',
      });
    } catch (error) {
      console.error(error);
    }
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
