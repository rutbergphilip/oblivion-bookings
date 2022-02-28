import { ObjectId } from 'mongodb';
import {
  Message,
  MessageOptions,
  MessageEmbed,
  GuildMember,
  ButtonInteraction,
} from 'discord.js';
import { Factions } from './../constants/factions.enum';
import { RequestTypes } from './../constants/request.enum';
import { IMythicPlusBoost } from './../interfaces/mplusboost.interface';

export class MythicPlusBoost implements IMythicPlusBoost {
  readonly type: RequestTypes;
  readonly faction: Factions;
  readonly customerId: string;
  readonly boostId: string | ObjectId;
  private timeout: NodeJS.Timeout;
  picked?: {
    teamLeaderId: string;
    tankId: string;
    healerId: string;
    dpsOneId: string;
    dpsTwoId: string;
    keyHolderId: string;
    handlerId: string;
  };
  keyInfo?: {
    keyLevel: string;
    amountKeys: string;
    armorStack: string;
    timed: string;
    keys: string;
    paymentRealms: string;
    notes: string;
  };
  queues?: {
    teamLeaderQueue?: string[];
    tankQueue: string[];
    healerQueue: string[];
    dpsQueue: string[];
    keyHolderQueue: string[];
    handlerQueue: string[];
  };
  requestChannelId?: string;
  signupsChannelId?: string;
  isComplete: boolean;
  isOpenForAll: boolean;
  isTeamTaken?: boolean;
  hasStarted?: boolean;

  constructor(
    type: RequestTypes,
    faction: Factions,
    customerId: string,
    boostId: string | ObjectId
  ) {
    this.type = type;
    this.faction = faction;
    this.isComplete = false;
    this.isOpenForAll = false;
    this.customerId = customerId;
    this.boostId = boostId;
    this.picked = {
      teamLeaderId: '',
      tankId: '',
      healerId: '',
      dpsOneId: '',
      dpsTwoId: '',
      keyHolderId: '',
      handlerId: '',
    };
    this.keyInfo = {
      keyLevel: '',
      amountKeys: '',
      armorStack: '',
      timed: '',
      keys: '',
      paymentRealms: '',
      notes: '',
    };
    this.queues = {
      teamLeaderQueue: [],
      tankQueue: [],
      healerQueue: [],
      dpsQueue: [],
      keyHolderQueue: [],
      handlerQueue: [],
    };
  }

  throttle(message: Message) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      await message.edit(this.buildEmbed(message));
    }, 2000);
  }

  private buildEmbed(message: Message): MessageOptions {
    const embed = message.embeds[0];
    const component = message.components[0];
    const content = message.content;

    const boosterTemplate = `
Tank: <@${this.picked.tankId}>
Healer: <@${this.picked.healerId}>
Dps1: <@${this.picked.dpsOneId}>
Dps2: <@${this.picked.dpsTwoId}>

Handler: <@${this.picked.handlerId}>`;

    const teamTemplate = `
Team Leader: <@${this.picked.teamLeaderId}>`;

    return {
      content: content,
      embeds: [
        new MessageEmbed(embed).setDescription(
          this.isTeamTaken ? teamTemplate : boosterTemplate
        ),
      ],
      components: [component],
    };
  }

  teamClicked(interaction: ButtonInteraction, user: GuildMember) {
    if (!this.queues.teamLeaderQueue.includes(user.id)) {
      this.queues.teamLeaderQueue.push(user.id);
      interaction.editReply({
        content: 'Your team has been added to the team queue',
      });
      if (!this.picked.teamLeaderId) {
        this.picked.teamLeaderId = user.id;
        this.picked.handlerId = user.id;
        this.isTeamTaken = true;
      }
    } else {
      this.queues.teamLeaderQueue.splice(
        this.queues.teamLeaderQueue.indexOf(user.id),
        1
      );
      interaction.editReply({
        content: 'Your team has been removed from the team queue',
      });
      if (this.picked.teamLeaderId === user.id) {
        this.picked.teamLeaderId =
          this.queues.teamLeaderQueue.length > 0
            ? this.queues.teamLeaderQueue[0]
            : '';

        this.isTeamTaken = this.picked.teamLeaderId ? true : false;
      }
    }
  }

  tankClicked(interaction: ButtonInteraction, user: GuildMember) {
    if (!this.queues.tankQueue.includes(user.id)) {
      this.queues.tankQueue.push(user.id);
      interaction.reply({
        content: "You've been added to the tank queue",
        ephemeral: true,
      });
      if (!this.picked.tankId && !this.isTeamTaken && this.picked.keyHolderId) {
        this.picked.tankId = user.id;
      }
    } else {
      this.queues.tankQueue.splice(this.queues.tankQueue.indexOf(user.id), 1);
      interaction.reply({
        content: "You've been removed from the tank queue",
        ephemeral: true,
      });
      if (this.picked.tankId === user.id) {
        this.picked.tankId =
          this.queues.tankQueue.length > 0 ? this.queues.tankQueue[0] : '';
      }
    }
  }

  healerClicked(interaction: ButtonInteraction, user: GuildMember) {
    if (!this.queues.healerQueue.includes(user.id)) {
      this.queues.healerQueue.push(user.id);
      interaction.reply({
        content: "You've been added to the healer queue",
        ephemeral: true,
      });
      if (
        !this.picked.healerId &&
        !this.isTeamTaken &&
        this.picked.keyHolderId
      ) {
        this.picked.healerId = user.id;
      }
    } else {
      this.queues.healerQueue.splice(
        this.queues.healerQueue.indexOf(user.id),
        1
      );
      interaction.reply({
        content: "You've been removed from the healer queue",
        ephemeral: true,
      });
      if (this.picked.healerId === user.id) {
        this.picked.healerId =
          this.queues.healerQueue.length > 0 ? this.queues.healerQueue[0] : '';
      }
    }
  }

  dpsClicked(interaction: ButtonInteraction, user: GuildMember) {
    if (!this.queues.dpsQueue.includes(user.id)) {
      this.queues.teamLeaderQueue.push(user.id);
      interaction.reply({
        content: "You've been added to the dps queue",
        ephemeral: true,
      });
      if (
        [this.picked.dpsOneId, this.picked.dpsTwoId].includes('') &&
        !this.isTeamTaken &&
        this.picked.keyHolderId
      ) {
        if (this.picked.dpsOneId === '') {
          this.picked.dpsOneId = user.id;
        } else {
          this.picked.dpsTwoId = user.id;
        }
      }
    } else {
      this.queues.dpsQueue.splice(this.queues.dpsQueue.indexOf(user.id), 1);
      interaction.reply({
        content: "You've been removed from the dps queue",
        ephemeral: true,
      });
      if ([this.picked.dpsOneId, this.picked.dpsTwoId].includes(user.id)) {
        if (this.picked.dpsOneId === user.id) {
          this.picked.dpsOneId =
            this.queues.dpsQueue.length > 0 ? this.queues.dpsQueue[0] : '';
        } else {
          this.picked.dpsTwoId =
            this.queues.dpsQueue.length > 0 ? this.queues.dpsQueue[0] : '';
        }
      }
    }
  }

  keyholderClicked(interaction: ButtonInteraction, user: GuildMember) {
    if (!this.queues.keyHolderQueue.includes(user.id)) {
      this.queues.keyHolderQueue.push(user.id);
      interaction.reply({
        content: "You've been added to the keyholder queue",
        ephemeral: true,
      });
      if (!this.picked.keyHolderId) {
        this.picked.keyHolderId = user.id;
        this.fillSlots();
      }
    } else {
      this.queues.keyHolderQueue.splice(
        this.queues.keyHolderQueue.indexOf(user.id),
        1
      );
      interaction.reply({
        content: "You've been removed from the keyholder queue",
        ephemeral: true,
      });
      if (this.picked.keyHolderId === user.id) {
        this.picked.keyHolderId =
          this.queues.keyHolderQueue.length > 0
            ? this.queues.keyHolderQueue[0]
            : '';
      }
    }
  }

  handlerClicked(interaction: ButtonInteraction, user: GuildMember) {
    if (!this.queues.handlerQueue.includes(user.id)) {
      this.queues.handlerQueue.push(user.id);
      interaction.reply({
        content: "You've been added to the handler queue",
        ephemeral: true,
      });
      if (!this.picked.handlerId) {
        this.picked.handlerId = user.id;
      }
    } else {
      this.queues.handlerQueue.splice(
        this.queues.handlerQueue.indexOf(user.id),
        1
      );
      interaction.reply({
        content: "You've been removed from the handler queue",
        ephemeral: true,
      });
      if (this.picked.handlerId === user.id) {
        this.picked.handlerId =
          this.queues.handlerQueue.length > 0
            ? this.queues.handlerQueue[0]
            : '';
      }
    }
  }

  private fillSlots() {
    if (!this.picked.tankId && this.queues.tankQueue.length > 0) {
      for (const tank of this.queues.tankQueue) {
        if (
          ![
            this.picked.tankId,
            this.picked.healerId,
            this.picked.dpsOneId,
            this.picked.dpsTwoId,
          ].some((slot) => slot === tank)
        ) {
          this.picked.tankId = tank;
          break;
        }
      }
    }

    if (!this.picked.healerId && this.queues.healerQueue.length > 0) {
      for (const healer of this.queues.healerQueue) {
        if (
          ![
            this.picked.tankId,
            this.picked.healerId,
            this.picked.dpsOneId,
            this.picked.dpsTwoId,
          ].some((slot) => slot === healer)
        ) {
          this.picked.healerId = healer;
          break;
        }
      }
    }

    if (
      !this.picked.dpsOneId &&
      !this.picked.dpsTwoId &&
      this.queues.dpsQueue.length > 0
    ) {
      for (const dps of this.queues.dpsQueue) {
        if (
          ![
            this.picked.tankId,
            this.picked.healerId,
            this.picked.dpsOneId,
            this.picked.dpsTwoId,
          ].some((slot) => slot === dps)
        ) {
          if (this.picked.dpsOneId === '') {
            this.picked.dpsOneId = dps;
          } else {
            this.picked.dpsTwoId = dps;
          }
          break;
        }
      }
    }
  }

  isBoostReady(): boolean {
    return (
      ([
        this.picked.tankId,
        this.picked.healerId,
        this.picked.dpsOneId,
        this.picked.dpsTwoId,
        this.picked.handlerId,
      ].every((id) => id) &&
        this.picked.keyHolderId !== '') ||
      this.isTeamTaken
    );
  }

  startBoost() {}
}
