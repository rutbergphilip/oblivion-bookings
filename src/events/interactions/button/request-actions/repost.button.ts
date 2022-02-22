import { ObjectId } from 'mongodb';
import { IRequestBuilder } from '../../../../interfaces/requestbuilder.interface';
import {
  ButtonInteraction,
  MessageEmbed,
  MessageOptions,
  TextChannel,
} from 'discord.js';
import { RequestRepository } from '../../../../persistance/repositories/mplusrequests.repository';
import { Channels } from '../../../../constants/channels.enum';
import { ChannelTypes } from 'discord.js/typings/enums';
import { Emojis } from '../../../../constants/emojis.enum';

export class RepostButton {
  static async handle(interaction: ButtonInteraction) {
    try {
      const repository = new RequestRepository();
      const entity = await repository.get(interaction.customId.split('-')[1]);

      await interaction.reply({
        content: `${Emojis.LOADING} Reposting request...`,
      });

      const { embeds, components } = interaction.message;
      interaction.channel.messages.cache
        .get(interaction.message.id)
        .edit({ embeds: embeds, components: [] } as MessageOptions);

      const customer = interaction.guild.members.cache.get(entity.customerId);

      const channel = <TextChannel>await interaction.channel.fetch();
      const overwrites = channel.permissionOverwrites.valueOf();

      const ticketChannel = await interaction.guild.channels.create(
        `mplus-request-${customer.user.username}`,
        {
          type: ChannelTypes.GUILD_TEXT,
          parent: Channels.CATEGORY_MPLUS_REQUESTS_HORDE,
          permissionOverwrites: overwrites,
        }
      );

      const ticketMessage = await ticketChannel.send({
        embeds: embeds,
        components: components,
      } as MessageOptions);

      await repository.update({
        ...entity,
        ...{
          requestId: ticketMessage.id,
        },
      });

      await ticketMessage.edit({
        embeds: [
          new MessageEmbed(embeds[0]).setFooter({
            text: `🆔: ${entity._id}`,
          }),
        ],
        components: components,
      } as MessageOptions);

      await interaction.editReply({
        content: `${Emojis.SUCCESS} Request reposted! ${ticketChannel}

This channel will soon be deleted...`,
      });

      setTimeout(() => {
        interaction.channel.delete();
      }, 5000);
    } catch (error) {
      console.error(error);
    }
  }
}
