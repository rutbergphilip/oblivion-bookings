import { RolePermissions } from './role.permission';
import { MythicPlusRequestRepository } from './../persistance/repositories/mplusrequests.repository';
import { ButtonInteraction } from 'discord.js';

export class RequestActionPermissions {
  static async isEligable(interaction: ButtonInteraction): Promise<boolean> {
    const requestIdArgs = interaction.customId.split('-');
    const repository = new MythicPlusRequestRepository();
    const entity = await repository.get(requestIdArgs[1]);
    const user = interaction.guild.members.cache.get(interaction.user.id);

    const { isComplete, hasStarted, picked, bookingSentAt, customerId } =
      entity;
    const isMarketAssistantOrAbove =
      RolePermissions.isMarketAssistantOrAbove(user);
    const isHandler = picked?.handlerId === user.id;
    const isTeamLeader = picked?.teamLeaderId === user.id;
    const isCustomer = customerId === user.id;
    const fiveMinutesHavePassed = new Date().getTime() - bookingSentAt > 300000;

    return (
      isMarketAssistantOrAbove ||
      !isComplete ||
      isHandler ||
      isTeamLeader ||
      (!hasStarted &&
        fiveMinutesHavePassed &&
        isCustomer &&
        requestIdArgs[0] === 'cancel')
    );
  }
}
