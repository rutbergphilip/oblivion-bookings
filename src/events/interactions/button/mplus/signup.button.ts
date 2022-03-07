import { Colors } from './../../../../constants/colors.enum';
import { Factions } from './../../../../constants/factions.enum';
import { RolePermissions } from '../../../../permissions/role.permission';
import { Roles } from './../../../../constants/roles.enum';
import { MythicPlusCache } from './../../../../cache/mplus.cache';
import { ButtonInteraction, TextChannel } from 'discord.js';
import { MythicPlusRequestRepository } from '../../../../persistance/repositories/mplusrequests.repository';
import { Emojis } from '../../../../constants/emojis.enum';

export class SignupButton {
  static async run(interaction: ButtonInteraction) {
    await interaction.reply({
      content: `${Emojis.LOADING} Processing...`,
      ephemeral: true,
    });

    const user = interaction.guild.members.cache.get(interaction.user.id);
    const buttonArguments = interaction.customId.split('-');
    const boostId = buttonArguments[2];
    const buttonType = buttonArguments[0];

    const boost = MythicPlusCache.get(boostId);
    if (!boost) {
      return interaction.editReply({
        content: `${Emojis.X} Mythic Plus request not found.`,
      });
    }

    const repository = new MythicPlusRequestRepository();
    const entity = await repository.get(boost.boostId);

    const signupsMessage = interaction.channel.messages.cache.get(
      entity.signupsMessageId
    );
    try {
      switch (true) {
        case buttonType === 'tank':
          // if (
          //   !user.roles.cache.has(Roles.TANK) &&
          //   !RolePermissions.isMarketAssistantOrAbove(user)
          // ) {
          //   interaction.editReply({
          //     content: `You're missing the <@&${Roles.TANK}> role.`,
          //   });
          //   return;
          // }
          await boost.tankClicked(interaction, user);
          break;
        case buttonType === 'healer':
          // if (
          //   !user.roles.cache.has(Roles.HEALER) &&
          //   !RolePermissions.isMarketAssistantOrAbove(user)
          // ) {
          //   interaction.editReply({
          //     content: `You're missing the <@&${Roles.HEALER}> role.`,
          //   });
          //   return;
          // }
          await boost.healerClicked(interaction, user);
          break;
        case buttonType === 'dps':
          // if (
          //   !user.roles.cache.has(Roles.DPS) &&
          //   !RolePermissions.isMarketAssistantOrAbove(user)
          // ) {
          //   interaction.editReply({
          //     content: `You're missing the <@&${Roles.DPS}> role.`,
          //   });
          //   return;
          // }
          await boost.dpsClicked(interaction, user);
          break;
        case buttonType === 'teamtake':
          if (
            ((boost.faction === Factions.HORDE &&
              !user.roles.cache.hasAny(
                Roles.H_ALL_STAR_LEADER,
                Roles.H_VERIFIED_LEADER
              )) ||
              (boost.faction === Factions.ALLIANCE &&
                !user.roles.cache.hasAny(
                  Roles.A_ALL_STAR_LEADER,
                  Roles.A_VERIFIED_LEADER
                ))) &&
            !RolePermissions.isMarketAssistantOrAbove(user)
          ) {
            interaction.editReply({
              content: `You're missing team leader role(s)`,
            });
            return;
          }
          await boost.teamClicked(interaction, user);
          break;
        case buttonType === 'collector':
          await boost.handlerClicked(interaction, user);
          break;
        case buttonType === 'keyholder':
          await boost.keyholderClicked(interaction, user);
          break;
        default:
          return;
      }
    } catch (error) {
      console.error(error);
    } finally {
      await boost.throttle(signupsMessage);
      if (boost.isReady()) {
        signupsMessage.embeds[0].setColor(Colors.BOOST_IN_PROGRESS);
        signupsMessage.edit({
          content: `Booking is now ready!`,
          embeds: signupsMessage.embeds,
          components: [],
        });

        repository.update({
          ...entity,
          ...{
            hasStarted: true,
            isTeamTaken: boost.isTeamTaken,
            picked: {
              teamLeaderId: boost.picked.teamLeaderId,
              handlerId: boost.picked.handlerId,
              keyHolderId: boost.picked.keyHolderId,
              tankId: boost.picked.tankId,
              healerId: boost.picked.healerId,
              dpsOneId: boost.picked.dpsOneId,
              dpsTwoId: boost.picked.dpsTwoId,
            },
          },
        });

        const requestChannel = <TextChannel>(
          (interaction.guild.channels.cache.get(entity.requestChannelId) ||
            (await interaction.guild.channels.fetch(entity.requestChannelId)))
        );
        const signupsChannel = <TextChannel>(
          (interaction.guild.channels.cache.get(entity.signupsChannelId) ||
            (await interaction.guild.channels.fetch(entity.signupsChannelId)))
        );

        const openForAllMessage =
          signupsChannel.messages.cache.get(entity.openForAllMessageId) ||
          (await signupsChannel.messages
            .fetch(entity.openForAllMessageId)
            .catch(() => null));

        if (openForAllMessage) {
          openForAllMessage.delete();
        }

        await requestChannel.permissionOverwrites.edit(
          boost.picked.handlerId || boost.picked.teamLeaderId,
          {
            MANAGE_MESSAGES: false,
            READ_MESSAGE_HISTORY: true,
            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
          }
        );
      }
    }
  }
}
