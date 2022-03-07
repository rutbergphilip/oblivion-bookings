import { Colors } from '../constants/colors.enum';
import { Logos } from '../constants/logos.enum';
import { Factions } from '../constants/factions.enum';
import { RequestTypes } from '../constants/request.enum';
import { MythicPlusRequestRepository } from '../persistance/repositories/mplusrequests.repository';
import { GuildMember, MessageEmbed } from 'discord.js';
import { ActionRowBuilder } from './rows.build';
import { IRequestBuilder } from '../interfaces/requestbuilder.interface';

export class MythicPlusRequestBuilder {
  static async build(
    customer: GuildMember,
    faction: Factions,
    requestChannelId: string
  ): Promise<IRequestBuilder> {
    const repository = new MythicPlusRequestRepository();
    const entity = await repository.insert({
      type: RequestTypes.MPLUS,
      customerId: customer.id,
      isComplete: false,
      faction: faction,
      isOpenForAll: false,
      isTeamTaken: false,
      requestChannelId: requestChannelId,
    });

    return {
      embeds: [this.getEmbed(customer, faction)],
      components: [ActionRowBuilder.buildRequestActionRow(entity._id)],
      entity: entity,
    };
  }

  static getEmbed(customer: GuildMember, faction: Factions): MessageEmbed {
    return new MessageEmbed()
      .setTitle(
        `${faction
          .charAt(0)
          .toUpperCase()
          .concat(
            faction.substring(1, faction.length).toLowerCase()
          )} Mythic Plus Booking Request`
      )
      .setDescription(
        `
Hey there ${customer}, you will be asked a series of questions to help us fulfill your request.
`
      )
      .setThumbnail(Logos.MAIN)
      .setColor(Colors.LIGHT_BLUE);
  }
}
