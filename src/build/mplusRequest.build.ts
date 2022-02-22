import { Colors } from '../constants/colors.enum';
import { Logos } from '../constants/logos.enum';
import { Factions } from '../constants/factions.enum';
import { RequestTypes } from '../constants/request.enum';
import { Global } from '../constants/global.enum';
import { RequestRepository } from '../persistance/repositories/mplusrequests.repository';
import {
  Client,
  GuildMember,
  Message,
  MessageEmbed,
  MessageOptions,
  TextChannel,
} from 'discord.js';
import { ActionRowBuilder } from './rows.build';
import { Channels } from '../constants/channels.enum';
import { IRequestBuilder } from '../interfaces/requestbuilder.interface';

export class MythicPlusRequestBuilder {
  static async build(
    customer: GuildMember,
    faction: Factions
  ): Promise<IRequestBuilder> {
    const repository = new RequestRepository();
    const entity = await repository.insert({
      type: RequestTypes.MPLUS,
      customerId: customer.id,
      isComplete: false,
      faction: faction,
    });

    return {
      embeds: [this.getEmbed(customer)],
      components: [ActionRowBuilder.buildRequestActionRow(entity)],
      entity: entity,
    };
  }

  static getEmbed(customer: GuildMember): MessageEmbed {
    return new MessageEmbed()
      .setTitle('Mythic Plus Booking Request')
      .setDescription(
        `
Hey there ${customer}, you will be asked a series of questions to help us fulfill your request.
`
      )
      .setThumbnail(Logos.MAIN)
      .setColor(Colors.LIGHT_BLUE);
  }
}
