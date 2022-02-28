import { Factions } from './../constants/factions.enum';
import { MythicPlusRequestBuilder } from './../build/mplusRequest.build';
import {
  ButtonInteraction,
  Collection,
  GuildMember,
  Message,
  MessageComponentInteraction,
  MessageEmbed,
  MessageOptions,
  OverwriteResolvable,
  TextChannel,
} from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';
import { Global } from '../constants/global.enum';
import { Roles } from '../constants/roles.enum';
import { Channels } from '../constants/channels.enum';
import { RequestRepository } from '../persistance/repositories/mplusrequests.repository';

export class RequestUtils {
  static channelPermissions = (
    interaction: MessageComponentInteraction,
    customer: GuildMember
  ): OverwriteResolvable[] => {
    return [
      {
        id: interaction.guildId,
        deny: ['VIEW_CHANNEL'],
      },
      {
        id: customer.id,
        allow: ['VIEW_CHANNEL'],
      },
      {
        id: <string>Global.SELFID,
        allow: ['VIEW_CHANNEL'],
      },
      {
        id: Roles.ADMIN,
        allow: [
          'VIEW_CHANNEL',
          'SEND_MESSAGES',
          'MANAGE_MESSAGES',
          'MANAGE_CHANNELS',
          'READ_MESSAGE_HISTORY',
        ],
      },
      {
        id: Roles.STAFF,
        allow: [
          'VIEW_CHANNEL',
          'SEND_MESSAGES',
          'MANAGE_MESSAGES',
          'MANAGE_CHANNELS',
          'READ_MESSAGE_HISTORY',
        ],
      },
      {
        id: Roles.MODERATOR,
        allow: [
          'VIEW_CHANNEL',
          'SEND_MESSAGES',
          'MANAGE_MESSAGES',
          'MANAGE_CHANNELS',
          'READ_MESSAGE_HISTORY',
        ],
      },
      {
        id: Roles.MARKET_ASSISTANT,
        allow: [
          'VIEW_CHANNEL',
          'SEND_MESSAGES',
          'MANAGE_MESSAGES',
          'MANAGE_CHANNELS',
          'READ_MESSAGE_HISTORY',
        ],
      },
    ];
  };
}
