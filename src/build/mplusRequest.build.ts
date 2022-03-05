import { Colors } from '../constants/colors.enum';
import { Logos } from '../constants/logos.enum';
import { Factions } from '../constants/factions.enum';
import { RequestTypes } from '../constants/request.enum';
import { RequestRepository } from '../persistance/repositories/mplusrequests.repository';
import { GuildMember, MessageEmbed } from 'discord.js';
import { ActionRowBuilder } from './rows.build';
import { Channels } from '../constants/channels.enum';
import { IRequestBuilder } from '../interfaces/requestbuilder.interface';

export class MythicPlusRequestBuilder {
  static async build(
    customer: GuildMember,
    faction: Factions,
    requestChannelId: string
  ): Promise<IRequestBuilder> {
    const repository = new RequestRepository();
    const entity = await repository.insert({
      type: RequestTypes.MPLUS,
      customerId: customer.id,
      isComplete: false,
      faction: faction,
      isOpenForAll: false,
      requestChannelId: requestChannelId,
    });

    return {
      embeds: [this.getEmbed(customer)],
      components: [ActionRowBuilder.buildRequestActionRow(entity._id)],
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
