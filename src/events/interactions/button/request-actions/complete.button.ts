import { ObjectId } from 'mongodb';
import { ButtonInteraction, MessageOptions } from 'discord.js';
import { RequestRepository } from '../../../../persistance/repositories/mplusrequests.repository';
import { Emojis } from '../../../../constants/emojis.enum';

export class CompleteButton {
  static async handle(interaction: ButtonInteraction) {
    try {
      const repository = new RequestRepository();
      const entity = await repository.get(interaction.customId.split('-')[1]);

      await interaction.reply({
        content: `${Emojis.SUCCESS} Request completed!

This channel will soon be deleted...`,
      });

      await interaction.channel.messages.cache
        .get(interaction.message.id)
        .edit({ embeds: [], components: [] } as MessageOptions);

      await repository.update({
        ...entity,
        ...{
          isComplete: true,
        },
      });

      setTimeout(() => {
        interaction.channel.delete();
      }, 5000);
    } catch (error) {
      console.error(error);
    }
  }
}
