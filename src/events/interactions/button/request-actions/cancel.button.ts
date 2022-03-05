import { MythicPlusRequestEntity } from './../../../../persistance/entities/mplusrequest.entity';
import { RequestActionPermissions } from './../../../../permissions/requestactions.permissions';
import {
  ButtonInteraction,
  Message,
  MessageOptions,
  TextChannel,
} from 'discord.js';
import { RequestRepository } from '../../../../persistance/repositories/mplusrequests.repository';
import { Emojis } from '../../../../constants/emojis.enum';
import { MythicPlusCache } from '../../../../cache/mplus.cache';

export class CancelButton {
  private static entity: MythicPlusRequestEntity;

  static async run(interaction: ButtonInteraction) {
    if (!(await RequestActionPermissions.isEligable(interaction))) {
      return interaction.reply({
        content: `${Emojis.X} Insufficient permissions.`,
      });
    }

    try {
      const repository = new RequestRepository();
      this.entity = await repository.get(interaction.customId.split('-')[1]);

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

      await repository.delete(this.entity._id);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(async () => {
        interaction.channel.delete().catch(console.error);

        const signupsChannel = <TextChannel>(
          (interaction.guild.channels.cache.get(this.entity.signupsChannelId) ||
            (await interaction.guild.channels.fetch(
              this.entity.signupsChannelId
            )))
        );

        if (!signupsChannel) {
          return;
        }

        const signupsMessage =
          signupsChannel.messages?.cache?.get(this.entity.signupsMessageId) ||
          (await signupsChannel.messages?.fetch(this.entity.signupsMessageId));
        const openForAllMessage =
          signupsChannel.messages?.cache?.get(
            this.entity.openForAllMessageId
          ) ||
          (await signupsChannel.messages?.fetch(
            this.entity.openForAllMessageId
          ));

        if (signupsMessage) {
          signupsMessage.delete().catch(console.error);
        }
        if (openForAllMessage) {
          openForAllMessage.delete().catch(console.error);
        }
      }, 10000);
    }
  }
}
