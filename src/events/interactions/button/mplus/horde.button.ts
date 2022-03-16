import { MythicPlusRequestCollector } from '../../../../collectors/mplusrequest.collector';
import { Factions } from '../../../../constants/factions.enum';
import { MythicPlusRequestBuilder } from '../../../../build/mplusRequest.build';
import { ActionRowBuilder } from '../../../../build/rows.build';
import {
  ButtonInteraction,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js';
import { ChannelTypes, MessageComponentTypes } from 'discord.js/typings/enums';
import { Emojis } from '../../../../constants/emojis.enum';
import { Channels } from '../../../../constants/channels.enum';
import { RequestUtils } from '../../../../utils/requests.utils';

export class HordeButton {
  static async run(interaction: ButtonInteraction) {
    const filter = (i: SelectMenuInteraction): boolean => {
      i.deferUpdate();
      return i.user.id === interaction.user.id;
    };

    try {
      await interaction.reply({
        components: [ActionRowBuilder.buildRequestOptionsRow()],
        ephemeral: true,
      });

      interaction.channel
        .awaitMessageComponent({
          filter,
          componentType: MessageComponentTypes.SELECT_MENU,
          time: 30000,
        })
        .then(async (choice: SelectMenuInteraction) => {
          const [value] = choice.values;
          const choiceLabel = (<MessageSelectMenu>(
            choice.message.components[0].components[0]
          )).options.find((option) => option.value === value).label;

          interaction.editReply({
            content: `${Emojis.LOADING} Creating your ${choiceLabel} request ticket...`,
            components: [],
          });
        })
        .catch(async (_) => {
          await interaction.editReply({
            content: `${Emojis.X} Nothing was selected within the timeframe.`,
            components: [],
          });
        });
      return;
      // await interaction.reply({
      //   content: `${Emojis.LOADING} creating ticket...`,
      //   ephemeral: true,
      // });

      const customer = interaction.guild.members.cache.get(interaction.user.id);
      const requestChannel = await interaction.guild.channels.create(
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
        await MythicPlusRequestBuilder.build(
          customer,
          Factions.HORDE,
          requestChannel.id
        );
      const ticketMessage = await requestChannel.send({
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
      await (await requestChannel.send({ content: '``` ```' })).pin();

      await interaction.editReply({
        content: `${Emojis.SUCCESS} Request ticket created! ${requestChannel}`,
      });

      await new MythicPlusRequestCollector(interaction, ticketMessage).start();
    } catch (error) {
      console.error(error);
    }
  }
}
