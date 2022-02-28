import { Roles } from './../constants/roles.enum';
import { GuildMember } from 'discord.js';

export class ActionPermissions {
  static isAdmin(member: GuildMember): boolean {
    return member.roles.cache.has(Roles.ADMIN);
  }

  static isStaffOrAbove(member: GuildMember): boolean {
    return member.roles.cache.has(Roles.STAFF) || this.isAdmin(member);
  }

  static isModeratorOrAbove(member: GuildMember): boolean {
    return (
      member.roles.cache.has(Roles.MODERATOR) || this.isStaffOrAbove(member)
    );
  }

  static isMarketAssistantOrAbove(member: GuildMember): boolean {
    return (
      member.roles.cache.has(Roles.MARKET_ASSISTANT) ||
      this.isModeratorOrAbove(member)
    );
  }

  static isHordeLeader(member: GuildMember): boolean {
    return member.roles.cache.hasAny(
      Roles.H_ALL_STAR_LEADER,
      Roles.H_VERIFIED_LEADER
    );
  }

  static isAllianceLeader(member: GuildMember): boolean {
    return member.roles.cache.hasAny(
      Roles.A_ALL_STAR_LEADER,
      Roles.A_VERIFIED_LEADER
    );
  }
}
