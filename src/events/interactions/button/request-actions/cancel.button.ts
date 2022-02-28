import { RequestActionPermissions } from './../../../../permissions/requestactions.permissions';
import { ButtonInteraction, MessageOptions } from 'discord.js';
import { RequestRepository } from '../../../../persistance/repositories/mplusrequests.repository';
import { Emojis } from '../../../../constants/emojis.enum';
import { ActionPermissions } from '../../../../permissions/actions.permission';

export class CancelButton {
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
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        interaction.channel.delete().catch(console.error);
      }, 5000);
    }
  }
}
