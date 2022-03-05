import { MythicPlusBoost } from './../../../../template/mplusboost.template';
import { Colors } from './../../../../constants/colors.enum';
import { ActionRowBuilder } from './../../../../build/rows.build';
import { Roles } from './../../../../constants/roles.enum';
import { Factions } from './../../../../constants/factions.enum';
import { RequestActionPermissions } from './../../../../permissions/requestactions.permissions';
import { ButtonInteraction, TextChannel } from 'discord.js';
import { RequestRepository } from '../../../../persistance/repositories/mplusrequests.repository';
import { Emojis } from '../../../../constants/emojis.enum';
import { MythicPlusCache } from '../../../../cache/mplus.cache';

export class RepostButton {
  static async run(interaction: ButtonInteraction) {
    if (!(await RequestActionPermissions.isEligable(interaction))) {
      return interaction.reply({
        content: `${Emojis.X} Insufficient permissions.`,
      });
    }
    try {
      const repository = new RequestRepository();
      const entity = await repository.get(interaction.customId.split('-')[1]);

      await interaction.reply({
        content: `${Emojis.LOADING} Reposting request...`,
      });

      const signupsChannel = <TextChannel>(
        (interaction.guild.channels.cache.get(entity.signupsChannelId) ||
          (await interaction.guild.channels.fetch(entity.signupsChannelId)))
      );

      let signupsMessage =
        signupsChannel.messages.cache.get(entity.signupsMessageId) ||
        (await signupsChannel.messages.fetch(entity.signupsMessageId));
      const openForAllMessage =
        signupsChannel.messages.cache.get(entity.openForAllMessageId) ||
        (await signupsChannel.messages
          .fetch(entity.openForAllMessageId)
          .catch(() => null));
      const { embeds } = signupsMessage;
      embeds[0].description = `${Emojis.TEAMLEADER} Team Leader`;

      signupsMessage.delete();

      if (openForAllMessage) {
        openForAllMessage.delete();
      }

      signupsMessage = await signupsChannel.send({
        content: `<@&${
          entity.faction === Factions.HORDE
            ? Roles.H_MPLUS_MEMBER
            : Roles.A_MPLUS_MEMBER
        }>`,
        embeds: embeds,
        components: ActionRowBuilder.buildMythicPlusMembersSignupsRow(
          entity._id
        ),
      });

      let boost = MythicPlusCache.get(entity._id);
      if (!boost) {
        boost = new MythicPlusBoost(
          entity.type,
          entity.faction,
          entity.customerId,
          entity._id
        );
        boost.signupsChannelId = entity.signupsChannelId;
        boost.signupsMessageId = entity.signupsMessageId;
        MythicPlusCache.set(entity._id, boost);
      } else {
        boost.currentColor = Colors.BOOST_CREATING;
        boost.picked = {
          tankId: '',
          healerId: '',
          dpsOneId: '',
          dpsTwoId: '',
          keyHolderId: '',
          handlerId: '',
          teamLeaderId: '',
        };
        boost.queues = {
          tankQueue: [],
          healerQueue: [],
          dpsQueue: [],
          keyHolderQueue: [],
          handlerQueue: [],
          teamLeaderQueue: [],
        };
        boost.hasStarted = false;
        boost.isOpenForAll = true;
        boost.isTeamTaken = false;
      }
      boost.throttle(signupsMessage);

      await repository.update({
        ...entity,
        ...{
          picked: {
            tankId: '',
            healerId: '',
            dpsOneId: '',
            dpsTwoId: '',
            keyHolderId: '',
            handlerId: '',
            teamLeaderId: '',
          },
          hasStarted: false,
          isOpenForAll: true,
          isTeamTaken: false,
          bookingSentAt: new Date().getTime(),
          signupsMessageId: signupsMessage.id,
        },
      });

      interaction.editReply({
        content: `${Emojis.SUCCESS} Request reposted in ${signupsChannel}!`,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
