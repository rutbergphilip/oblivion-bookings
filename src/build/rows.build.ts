import { MessageActionRow, MessageButton, MessageSelectMenu } from 'discord.js';
import { ObjectId } from 'mongodb';
import { MythicPlusRequestEntity } from '../persistance/entities/mplusrequest.entity';

export class ActionRowBuilder {
  static buildRequestPanelActionRow(): MessageActionRow {
    return new MessageActionRow().addComponents([
      new MessageButton()
        .setLabel('Horde')
        .setCustomId('horde-request')
        .setStyle('DANGER'),
      new MessageButton()
        .setLabel('Alliance')
        .setCustomId('alliance-request')
        .setStyle('PRIMARY'),
    ]);
  }

  static buildRequestActionRow(requestId: string | ObjectId): MessageActionRow {
    return new MessageActionRow().addComponents([
      new MessageButton()
        .setLabel('Complete')
        .setCustomId(`complete-${requestId}`)
        .setStyle('SUCCESS'),
      new MessageButton()
        .setLabel('Cancel')
        .setCustomId(`cancel-${requestId}`)
        .setStyle('DANGER'),
      new MessageButton()
        .setLabel('Repost')
        .setCustomId(`repost-${requestId}`)
        .setStyle('PRIMARY'),
    ]);
  }

  static buildMythicPlusTeamsSignupsRow(
    requestId: string | ObjectId
  ): MessageActionRow {
    return new MessageActionRow().addComponents([
      new MessageButton()
        .setLabel('Team Take')
        .setCustomId(`teamtake-signup-${requestId}`)
        .setStyle('PRIMARY'),
    ]);
  }

  static buildMythicPlusMembersSignupsRow(
    requestId: string | ObjectId
  ): MessageActionRow[] {
    return [
      new MessageActionRow().addComponents([
        new MessageButton()
          .setLabel('Tank')
          .setCustomId(`tank-signup-${requestId}`)
          .setStyle('PRIMARY'),
        new MessageButton()
          .setLabel('Healer')
          .setCustomId(`healer-signup-${requestId}`)
          .setStyle('SUCCESS'),
        new MessageButton()
          .setLabel('DPS')
          .setCustomId(`dps-signup-${requestId}`)
          .setStyle('DANGER'),
        new MessageButton()
          .setLabel('Key Holder')
          .setCustomId(`keyholder-signup-${requestId}`)
          .setStyle('SECONDARY'),
        new MessageButton()
          .setLabel('Collector')
          .setCustomId(`collector-signup-${requestId}`)
          .setStyle('SECONDARY'),
      ]),
      new MessageActionRow().addComponents([
        new MessageButton()
          .setLabel('Team Take')
          .setCustomId(`teamtake-signup-${requestId}`)
          .setStyle('PRIMARY'),
      ]),
    ];
  }
}
