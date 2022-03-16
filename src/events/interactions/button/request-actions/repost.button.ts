import { MythicPlusBoost } from './../../../../template/mplusboost.template';
import { Colors } from './../../../../constants/colors.enum';
import { ActionRowBuilder } from './../../../../build/rows.build';
import { Roles } from './../../../../constants/roles.enum';
import { Factions } from './../../../../constants/factions.enum';
import { RequestActionPermissions } from './../../../../permissions/requestactions.permissions';
import { ButtonInteraction, TextChannel, Message } from 'discord.js';
import { MythicPlusRequestRepository } from '../../../../persistance/repositories/mplusrequests.repository';
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
      const repository = new MythicPlusRequestRepository();
      const entity = await repository.get(interaction.customId.split('-')[1]);

      await interaction.reply({
        content: `${Emojis.LOADING} Reposting request...`,
      });

      const signupsChannel = entity.signupsChannelId
        ? <TextChannel>(
            (interaction.guild.channels.cache.get(entity.signupsChannelId) ||
              (await interaction.guild.channels.fetch(entity.signupsChannelId)))
          )
        : null;
      if (!signupsChannel) {
        return interaction.reply({
          content: `${Emojis.X} You cannot repost a run that has not yet begun.`,
        });
      }

      const requestChannel = <TextChannel>(
        (interaction.channel.partial
          ? await interaction.channel.fetch()
          : interaction.channel)
      );

      let signupsMessage: Message =
        signupsChannel.messages.cache.get(entity.signupsMessageId) ||
        (await signupsChannel.messages.fetch(entity.signupsMessageId));

      const openForAllMessage: Message = entity.openForAllMessageId
        ? signupsChannel.messages.cache.get(entity.openForAllMessageId) ||
          (await signupsChannel.messages
            .fetch(entity.openForAllMessageId)
            .catch(() => null))
        : null;

      const { embeds } = signupsMessage;
      embeds[0]
        .setDescription(`${Emojis.TEAMLEADER} Team Leader`)
        .setColor(Colors.BOOST_CREATING);

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

      requestChannel.permissionOverwrites.delete(
        entity.picked.handlerId || entity.picked.teamLeaderId
      );

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
          openForAllMessageId: '',
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
