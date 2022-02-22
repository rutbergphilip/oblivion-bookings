import { MythicPlusRequestEntity } from './../persistance/entities/mplusrequest.entity';
import { APIEmbed } from 'discord-api-types';
import {
  BaseMessageComponentOptions,
  MessageActionRow,
  MessageActionRowOptions,
  MessageEmbed,
  MessageEmbedOptions,
} from 'discord.js';

export interface IRequestBuilder {
  embeds?: (MessageEmbed | MessageEmbedOptions | APIEmbed)[];
  components?: (
    | MessageActionRow
    | (Required<BaseMessageComponentOptions> & MessageActionRowOptions)
  )[];
  entity?: MythicPlusRequestEntity;
}
