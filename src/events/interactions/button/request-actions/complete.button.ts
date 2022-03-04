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

      const boostChannel = <TextChannel>(
        interaction.guild.channels.cache.get(entity.signupsChannelId)
      );
      const boostMessage = boostChannel.messages.cache.get(
        entity.signupsMessageId
      );
      boostMessage.embeds[0].setColor('GREEN');
      const { embeds } = boostMessage;

      boostMessage.edit({
        content: '',
        embeds: embeds,
        components: [],
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
      }, 10000);
    } catch (error) {
      console.error(error);
    }
  }
}
