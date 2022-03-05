import {
  GuildMember,
  MessageComponentInteraction,
  OverwriteResolvable,
  PermissionString,
} from 'discord.js';
import { Global } from '../constants/global.enum';
import { Roles } from '../constants/roles.enum';

export class RequestUtils {
  static channelPermissions = (
    interaction: MessageComponentInteraction,
    customer: GuildMember
  ): OverwriteResolvable[] => {
    const adminPermissions: PermissionString[] = [
      'VIEW_CHANNEL',
      'SEND_MESSAGES',
      'MANAGE_MESSAGES',
      'MANAGE_CHANNELS',
      'READ_MESSAGE_HISTORY',
    ];

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
        id: <string>Global.BOTID,
        allow: adminPermissions,
      },
      {
        id: Roles.ADMIN,
        allow: adminPermissions,
      },
      {
        id: Roles.STAFF,
        allow: adminPermissions,
      },
      {
        id: Roles.MODERATOR,
        allow: adminPermissions,
      },
      {
        id: Roles.MARKET_ASSISTANT,
        allow: adminPermissions,
      },
    ];
  };
}
