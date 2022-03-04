import { MythicPlusRequestCollector } from '../../../../collectors/mplusrequest.collector';
import { Factions } from '../../../../constants/factions.enum';
import { MythicPlusRequestBuilder } from '../../../../build/mplusRequest.build';
import { ButtonInteraction, MessageEmbed } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';
import { Emojis } from '../../../../constants/emojis.enum';
import { Channels } from '../../../../constants/channels.enum';
import { RequestUtils } from '../../../../utils/requests.utils';

export class HordeButton {
  static async run(interaction: ButtonInteraction) {
    try {
      await interaction.reply({
        content: `${Emojis.LOADING} creating ticket...`,
        ephemeral: true,
      });

      const customer = interaction.guild.members.cache.get(interaction.user.id);
      const ticketChannel = await interaction.guild.channels.create(
        `mplus-request-${customer.user.username}`,
        {
          type: ChannelTypes.GUILD_TEXT,
          parent: Channels.CATEGORY_MPLUS_REQUESTS_HORDE,
          permissionOverwrites: RequestUtils.channelPermissions(
            interaction,
            customer
          ),
        }
      );

      const { embeds, components, entity } =
        await MythicPlusRequestBuilder.build(customer, Factions.HORDE);
      const ticketMessage = await ticketChannel.send({
        embeds: embeds,
        components: components,
      });
      await ticketMessage.edit({
        embeds: [
          new MessageEmbed(embeds[0]).setFooter({
            text: `🆔: ${entity._id}`,
          }),
        ],
        components: components,
      });
      ticketMessage.pin();
      await (await ticketChannel.send({ content: '``` ```' })).pin();

      await interaction.editReply({
        content: `${Emojis.SUCCESS} Request ticket created! ${ticketChannel}`,
      });

      await new MythicPlusRequestCollector(interaction, ticketMessage).start();
    } catch (error) {
      console.error(error);
    }
  }
}
