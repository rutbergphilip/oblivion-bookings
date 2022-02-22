import { MessageActionRow, MessageButton, MessageSelectMenu } from 'discord.js';
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

  static buildRequestActionRow(
    request: MythicPlusRequestEntity
  ): MessageActionRow {
    return new MessageActionRow().addComponents([
      new MessageButton()
        .setLabel('Complete')
        .setCustomId(`complete-${request._id}`)
        .setStyle('SUCCESS'),
      new MessageButton()
        .setLabel('Cancel')
        .setCustomId(`cancel-${request._id}`)
        .setStyle('DANGER'),
      new MessageButton()
        .setLabel('Repost')
        .setCustomId(`repost-${request._id}`)
        .setStyle('PRIMARY'),
    ]);
  }

  // static buildMenuActionRow(): MessageActionRow {
  //   return new MessageActionRow()
  //     .addComponents(
  //       new MessageSelectMenu()
  //         .addOptions([])
  //     )
  // }
}
