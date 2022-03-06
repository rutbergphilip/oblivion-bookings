import { MythicPlusCache } from './../../../../cache/mplus.cache';
import { RequestActionPermissions } from './../../../../permissions/requestactions.permissions';
import {
  ButtonInteraction,
  Message,
  MessageOptions,
  TextChannel,
} from 'discord.js';
import { RequestRepository } from '../../../../persistance/repositories/mplusrequests.repository';
import { Emojis } from '../../../../constants/emojis.enum';

export class CancelButton {
  static async run(interaction: ButtonInteraction) {
    if (!(await RequestActionPermissions.isEligable(interaction))) {
      return interaction.reply({
        content: `${Emojis.X} Insufficient permissions.`,
      });
    }

    const repository = new RequestRepository();
    const entity = await repository.get(interaction.customId.split('-')[1]);

    try {
      await interaction.reply({
        content: `Request canceled.

This channel will soon be deleted...`,
      });

      await interaction.channel.messages.cache
        .get(interaction.message.id)
        .edit({
          embeds: interaction.message.embeds,
          components: [],
        } as MessageOptions);

      await repository.delete(entity._id);
      MythicPlusCache.delete(entity._id);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(async () => {
        interaction.channel.delete().catch(console.error);

        const signupsChannel = <TextChannel>(
          (interaction.guild.channels.cache.get(entity.signupsChannelId) ||
            (await interaction.guild.channels.fetch(entity.signupsChannelId)))
        );

        if (!signupsChannel) {
          return;
        }

        const signupsMessage: Message =
          signupsChannel.messages.cache.get(entity.signupsMessageId) ||
          (await signupsChannel.messages
            .fetch(entity.signupsMessageId)
            .catch(() => null));
        const openForAllMessage: Message =
          signupsChannel.messages.cache.get(entity.openForAllMessageId) ||
          (await signupsChannel.messages
            .fetch(entity.openForAllMessageId)
            .catch(() => null));

        if (signupsMessage) {
          signupsMessage.delete().catch(console.error);
        }
        if (openForAllMessage) {
          openForAllMessage.delete().catch(console.error);
        }
      }, 180000);
    }
  }
}
