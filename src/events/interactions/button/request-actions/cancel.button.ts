import { ObjectId } from 'mongodb';
import { ButtonInteraction, MessageOptions } from 'discord.js';
import { RequestRepository } from '../../../../persistance/repositories/mplusrequests.repository';
import { Emojis } from '../../../../constants/emojis.enum';

export class CancelButton {
  static async handle(interaction: ButtonInteraction) {
    try {
      const repository = new RequestRepository();
      const entity = await repository.get(interaction.customId.split('-')[1]);

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

      await repository.delete(entity.requestId);

      setTimeout(() => {
        interaction.channel.delete();
      }, 5000);
    } catch (error) {
      console.error(error);
    }
  }
}
