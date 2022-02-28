import { ActionPermissions } from './../../../../permissions/actions.permission';
import { MythicPlusBoost } from './../../../../template/mplusboost.template';
import { Roles } from './../../../../constants/roles.enum';
import { MythicPlusCache } from './../../../../cache/mplus.cache';
import { ObjectId } from 'mongodb';
import { IRequestBuilder } from '../../../../interfaces/requestbuilder.interface';
import {
  ButtonInteraction,
  GuildMember,
  MessageEmbed,
  MessageOptions,
  TextChannel,
} from 'discord.js';
import { RequestRepository } from '../../../../persistance/repositories/mplusrequests.repository';
import { Channels } from '../../../../constants/channels.enum';
import { ChannelTypes } from 'discord.js/typings/enums';
import { Emojis } from '../../../../constants/emojis.enum';
import { APIInteractionGuildMember, ComponentType } from 'discord-api-types';

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

    const repository = new RequestRepository();
    const entity = await repository.get(boost.boostId);

    const boostMessage = interaction.channel.messages.cache.get(
      entity.signupsMessageId
    );
    try {
      switch (true) {
        case buttonType === 'tank':
          if (
            !user.roles.cache.has(Roles.TANK) &&
            !ActionPermissions.isMarketAssistantOrAbove(user)
          ) {
            interaction.editReply({ content: `Insufficient permissions.` });
            return;
          }
          boost.tankClicked(interaction, user);
          break;
        case buttonType === 'healer':
          if (
            !user.roles.cache.has(Roles.HEALER) &&
            !ActionPermissions.isMarketAssistantOrAbove(user)
          ) {
            interaction.editReply({ content: `Insufficient permissions.` });
            return;
          }
          boost.handlerClicked(interaction, user);
          break;
        case buttonType === 'dps':
          if (
            !user.roles.cache.has(Roles.DPS) &&
            !ActionPermissions.isMarketAssistantOrAbove(user)
          ) {
            interaction.editReply({ content: `Insufficient permissions.` });
            return;
          }
          boost.dpsClicked(interaction, user);
          break;
        case buttonType === 'teamtake':
          if (
            !user.roles.cache.hasAny(
              Roles.H_ALL_STAR_LEADER,
              Roles.H_VERIFIED_LEADER,
              Roles.A_ALL_STAR_LEADER,
              Roles.A_VERIFIED_LEADER
            ) &&
            !ActionPermissions.isMarketAssistantOrAbove(user)
          ) {
            interaction.editReply({ content: `Insufficient permissions.` });
            return;
          }
          boost.teamClicked(interaction, user);
          break;
        case buttonType === 'collector':
          boost.handlerClicked(interaction, user);
          break;
        case buttonType === 'keyholder':
          boost.keyholderClicked(interaction, user);
          break;
        default:
          return;
      }
    } catch (error) {
      console.error(error);
    } finally {
      boost.throttle(boostMessage);
      if (boost.isBoostReady()) {
        boostMessage.components.forEach((component) => {
          component.components.forEach((subComponent) => {
            subComponent.setDisabled(true);
          });
        });
        boostMessage.edit({
          content: boostMessage.content,
          embeds: boostMessage.embeds,
          components: boostMessage.components,
        });

        entity.hasStarted = true;
        entity.picked = {
          teamLeaderId: boost.picked.teamLeaderId,
          handlerId: boost.picked.handlerId,
          keyHolderId: boost.picked.keyHolderId,
          tankId: boost.picked.tankId,
          healerId: boost.picked.healerId,
          dpsOneId: boost.picked.dpsOneId,
          dpsTwoId: boost.picked.dpsTwoId,
        };

        repository.update(entity);
      }
    }
  }
}
