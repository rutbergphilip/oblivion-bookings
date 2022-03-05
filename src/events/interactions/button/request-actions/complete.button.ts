import { RequestActionPermissions } from './../../../../permissions/requestactions.permissions';
import { ButtonInteraction, MessageOptions, TextChannel } from 'discord.js';
import { RequestRepository } from '../../../../persistance/repositories/mplusrequests.repository';
import { Emojis } from '../../../../constants/emojis.enum';

export class CompleteButton {
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
        content: `${Emojis.SUCCESS} Request completed!

This channel will soon be deleted...`,
      });

      const signupsChannel = <TextChannel>(
        interaction.guild.channels.cache.get(entity.signupsChannelId)
      );
      const signupsMessage =
        signupsChannel.messages.cache.get(entity.signupsMessageId) ||
        (await signupsChannel.messages.fetch(entity.signupsMessageId));
      const openForAllMessage =
        signupsChannel.messages.cache.get(entity.openForAllMessageId) ||
        (await signupsChannel.messages.fetch(entity.openForAllMessageId));
      signupsMessage.embeds[0].setColor('GREEN');
      const { embeds } = signupsMessage;

      signupsMessage.edit({
        content: `${Emojis.SUCCESS} Booking completed!`,
        embeds: embeds,
        components: [],
      });

      if (openForAllMessage) {
        openForAllMessage.delete();
      }

      (
        interaction.channel.messages.cache.get(interaction.message.id) ||
        (await interaction.channel.messages.fetch(interaction.message.id))
      ).edit({
        embeds: interaction.message.embeds,
        components: [],
      } as MessageOptions);

      await repository.update({
        ...entity,
        ...{
          isComplete: true,
        },
      });

      setTimeout(() => {
        interaction.channel.delete();
      }, 10000);
    } catch (error) {
      console.error(error);
    }
  }
}
