import { RequestActionPermissions } from './../../../../permissions/requestactions.permissions';
import { ButtonInteraction, TextChannel } from 'discord.js';
import { RequestRepository } from '../../../../persistance/repositories/mplusrequests.repository';
import { Emojis } from '../../../../constants/emojis.enum';

export class RepostButton {
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
        content: `${Emojis.LOADING} Reposting request...`,
      });

      const boostChannel = <TextChannel>(
        interaction.guild.channels.cache.get(entity.signupsChannelId)
      );
      let boostMessage = boostChannel.messages.cache.get(
        entity.signupsMessageId
      );
      const { content, embeds, components } = boostMessage;

      boostMessage.delete();

      boostMessage = await boostChannel.send({
        content: content,
        embeds: embeds,
        components: components,
      });

      await repository.update({
        ...entity,
        ...{
          signupsMessageId: boostMessage.id,
        },
      });

      interaction.editReply({
        content: `${Emojis.SUCCESS} Request reposted in ${boostChannel}!`,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
