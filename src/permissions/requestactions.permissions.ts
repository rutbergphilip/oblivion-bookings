import { ActionPermissions } from './actions.permission';
import { RequestRepository } from './../persistance/repositories/mplusrequests.repository';
import { ButtonInteraction } from 'discord.js';

export class RequestActionPermissions {
  static async isEligable(interaction: ButtonInteraction): Promise<boolean> {
    const repository = new RequestRepository();
    const entity = await repository.get(interaction.customId.split('-')[1]);
    const user = interaction.guild.members.cache.get(interaction.user.id);

    const { isComplete } = entity;
    const isMarketAssistantOrAbove =
      ActionPermissions.isMarketAssistantOrAbove(user);
    const isCustomer = entity.customerId === user.id;
    const isHandler = entity.picked?.handlerId === user.id;

    return isMarketAssistantOrAbove || isCustomer || !isComplete || isHandler;
  }
}
