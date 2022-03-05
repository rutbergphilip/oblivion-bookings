import { Colors } from './../constants/colors.enum';
import { Emojis } from './../constants/emojis.enum';
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
import {
  IMythicPlusBoost,
  IQueues,
} from './../interfaces/mplusboost.interface';

export class MythicPlusBoost {
  readonly type: RequestTypes;
  readonly faction: Factions;
  readonly customerId: string;
  readonly boostId: string | ObjectId;
  private timeout: NodeJS.Timeout;
  picked = {
    teamLeaderId: '',
    tankId: '',
    healerId: '',
    dpsOneId: '',
    dpsTwoId: '',
    keyHolderId: '',
    handlerId: '',
  };
  keyInfo = {
    keyLevel: '',
    amountKeys: '',
    armorStack: '',
    timed: '',
    keys: '',
    paymentRealms: '',
    notes: '',
  };
  queues: IQueues = {
    teamLeaderQueue: [],
    tankQueue: [],
    healerQueue: [],
    dpsQueue: [],
    keyHolderQueue: [],
    handlerQueue: [],
  };
  requestChannelId = '';
  requestMessageId = '';
  signupsChannelId = '';
  signupsMessageId = '';
  openForAllMessageId? = '';
  isComplete = false;
  isOpenForAll = false;
  isTeamTaken = false;
  hasStarted = false;
  currentColor:
    | Colors.BOOST_CREATING
    | Colors.BOOST_IN_PROGRESS
    | Colors.BOOST_COMPLETE
    | Colors.BOOST_CANCELLED = Colors.BOOST_CREATING;

  constructor(
    type: RequestTypes,
    faction: Factions,
    customerId: string,
    boostId: string | ObjectId
  ) {
    this.type = type;
    this.faction = faction;
    this.customerId = customerId;
    this.boostId = boostId;
  }

  async throttle(message: Message) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      await message.edit(this.buildEmbed(message));
    }, 2000);
  }

  private buildEmbed(message: Message): MessageOptions {
    const embed = message.embeds[0];
    const components = message.components;
    const content = message.content;

    const template = !this.isTeamTaken
      ? `
${Emojis.TANK} ${this.picked.tankId ? '<@' + this.picked.tankId + '>' : ''}
${Emojis.HEALER} ${
          this.picked.healerId ? '<@' + this.picked.healerId + '>' : ''
        }
${Emojis.DPS} ${this.picked.dpsOneId ? '<@' + this.picked.dpsOneId + '>' : ''}
${Emojis.DPS} ${this.picked.dpsTwoId ? '<@' + this.picked.dpsTwoId + '>' : ''}

${Emojis.KEYSTONE} ${
          this.picked.keyHolderId ? '<@' + this.picked.keyHolderId + '>' : ''
        }

${Emojis.COLLECTOR} ${
          this.picked.handlerId ? '<@' + this.picked.handlerId + '>' : ''
        }`
      : `
${Emojis.TEAMLEADER} Team Leader ${
          this.picked.teamLeaderId ? '<@' + this.picked.teamLeaderId + '>' : ''
        }`;

    return {
      content: content,
      embeds: [new MessageEmbed(embed).setDescription(template)],
      components: components,
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
      interaction.editReply({
        content: "You've been added to the tank queue",
      });
      if (
        this.picked.keyHolderId &&
        !this.picked.tankId &&
        this.isUniqueSignup(user.id)
      ) {
        this.picked.tankId = user.id;
      } else if (
        this.queues.keyHolderQueue.includes(user.id) &&
        !this.picked.tankId &&
        this.isUniqueSignup(user.id)
      ) {
        this.picked.tankId = user.id;
        this.picked.keyHolderId = user.id;
        this.fillSlots();
      }
    } else {
      this.queues.tankQueue.splice(this.queues.tankQueue.indexOf(user.id), 1);
      interaction.editReply({
        content: "You've been removed from the tank queue",
      });

      if (this.picked.tankId === user.id) {
        this.picked.tankId = '';
        this.fillSlots();
      }

      if (this.picked.keyHolderId === user.id) {
        this.picked.keyHolderId = '';
        if (this.pickAnotherKeyholder()) {
          this.fillSlots();
        }
      }
    }
  }

  healerClicked(interaction: ButtonInteraction, user: GuildMember) {
    if (!this.queues.healerQueue.includes(user.id)) {
      this.queues.healerQueue.push(user.id);
      interaction.editReply({
        content: "You've been added to the healer queue",
      });

      if (this.isTeamTaken) {
        return;
      }

      if (
        this.picked.keyHolderId &&
        !this.picked.healerId &&
        this.isUniqueSignup(user.id)
      ) {
        this.picked.healerId = user.id;
      } else if (
        this.queues.keyHolderQueue.includes(user.id) &&
        !this.picked.healerId &&
        this.isUniqueSignup(user.id)
      ) {
        this.picked.healerId = user.id;
        this.picked.keyHolderId = user.id;
        this.fillSlots();
      }
    } else {
      this.queues.healerQueue.splice(
        this.queues.healerQueue.indexOf(user.id),
        1
      );
      interaction.editReply({
        content: "You've been removed from the healer queue",
      });

      if (this.picked.healerId === user.id) {
        this.picked.healerId = '';
        for (const healerInQueue of this.queues.healerQueue) {
          if (this.isUniqueSignup(user.id)) {
            this.picked.healerId = healerInQueue;
            break;
          }
        }
      }

      if (this.picked.keyHolderId === user.id) {
        this.picked.keyHolderId = '';
        if (this.pickAnotherKeyholder()) {
          this.fillSlots();
        }
      }
    }
  }

  dpsClicked(interaction: ButtonInteraction, user: GuildMember) {
    if (!this.queues.dpsQueue.includes(user.id)) {
      this.queues.dpsQueue.push(user.id);
      interaction.editReply({
        content: "You've been added to the dps queue",
      });

      if (this.isTeamTaken) {
        return;
      }

      if (
        this.picked.keyHolderId &&
        [this.picked.dpsOneId, this.picked.dpsTwoId].includes('') &&
        this.isUniqueSignup(user.id)
      ) {
        this.picked.dpsOneId === ''
          ? (this.picked.dpsOneId = user.id)
          : (this.picked.dpsTwoId = user.id);
      } else if (
        !this.picked.keyHolderId &&
        this.queues.keyHolderQueue.includes(user.id) &&
        [this.picked.dpsOneId, this.picked.dpsTwoId].includes('') &&
        this.isUniqueSignup(user.id)
      ) {
        this.picked.dpsOneId === ''
          ? (this.picked.dpsOneId = user.id)
          : (this.picked.dpsTwoId = user.id);
        this.picked.keyHolderId = user.id;
        this.fillSlots();
      }
    } else {
      this.queues.dpsQueue.splice(this.queues.dpsQueue.indexOf(user.id), 1);
      interaction.editReply({
        content: "You've been removed from the dps queue",
      });

      if (this.picked.dpsOneId === user.id) {
        this.picked.dpsOneId = '';
        for (const dpsInQueue of this.queues.dpsQueue) {
          if (this.isUniqueSignup(dpsInQueue)) {
            this.picked.dpsOneId = dpsInQueue;
            break;
          }
        }
      } else if (this.picked.dpsTwoId === user.id) {
        this.picked.dpsTwoId = '';
        for (const dpsInQueue of this.queues.dpsQueue) {
          if (this.isUniqueSignup(dpsInQueue)) {
            this.picked.dpsTwoId = dpsInQueue;
            break;
          }
        }
      }

      if (this.picked.keyHolderId === user.id) {
        this.picked.keyHolderId = '';
        if (this.pickAnotherKeyholder()) {
          this.fillSlots();
        }
      }
    }
  }

  keyholderClicked(interaction: ButtonInteraction, user: GuildMember) {
    if (!this.queues.keyHolderQueue.includes(user.id)) {
      this.queues.keyHolderQueue.push(user.id);
      interaction.editReply({
        content: "You've been added to the keyholder queue",
      });

      if (this.picked.keyHolderId && !this.isUniqueSignup(user.id)) {
        return;
      }

      if (this.pickAnotherKeyholder()) {
        this.fillSlots();
      }
    } else {
      this.queues.keyHolderQueue.splice(
        this.queues.keyHolderQueue.indexOf(user.id),
        1
      );
      interaction.editReply({
        content: "You've been removed from the keyholder queue",
      });
      if (this.picked.keyHolderId === user.id) {
        this.picked.keyHolderId = '';
        if (this.pickAnotherKeyholder()) {
          this.fillSlots();
        }
      }
    }
  }

  handlerClicked(interaction: ButtonInteraction, user: GuildMember) {
    if (!this.queues.handlerQueue.includes(user.id)) {
      this.queues.handlerQueue.push(user.id);
      interaction.editReply({
        content: "You've been added to the handler queue",
      });
      if (!this.picked.handlerId) {
        this.picked.handlerId = user.id;
      }
    } else {
      this.queues.handlerQueue.splice(
        this.queues.handlerQueue.indexOf(user.id),
        1
      );
      interaction.editReply({
        content: "You've been removed from the handler queue",
      });
      if (this.picked.handlerId === user.id) {
        this.picked.handlerId =
          this.queues.handlerQueue.length > 0
            ? this.queues.handlerQueue[0]
            : '';
      }
    }
  }

  private clearSlots() {
    this.picked.tankId = '';
    this.picked.healerId = '';
    this.picked.dpsOneId = '';
    this.picked.dpsTwoId = '';
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

  isUniqueSignup(userId: string) {
    return [
      this.picked.tankId,
      this.picked.healerId,
      this.picked.dpsOneId,
      this.picked.dpsTwoId,
    ].every((sign) => sign !== userId);
  }

  isReady(): boolean {
    return (
      Object.values(this.picked)
        .slice(1)
        .every((slot) => slot !== '') || this.isTeamTaken
    );
  }

  private pickAnotherKeyholder() {
    for (const userId of this.queues.keyHolderQueue) {
      const noneIsUser = [
        this.picked.tankId,
        this.picked.healerId,
        this.picked.dpsOneId,
        this.picked.dpsTwoId,
      ].every((id) => id !== userId);

      if (this.queues.tankQueue.includes(userId)) {
        if (noneIsUser) {
          this.picked.tankId = userId;
          this.picked.keyHolderId = userId;
          return true;
        } else if (this.picked.tankId === userId) {
          this.picked.keyHolderId = userId;
          return true;
        }
      } else if (this.queues.healerQueue.includes(userId)) {
        if (noneIsUser) {
          this.picked.healerId = userId;
          this.picked.keyHolderId = userId;
          return true;
        } else if (this.picked.healerId === userId) {
          this.picked.keyHolderId = userId;
          return true;
        }
      } else if (this.queues.dpsQueue.includes(userId)) {
        if ([this.picked.dpsOneId, this.picked.dpsTwoId].includes(userId)) {
          this.picked.keyHolderId = userId;
          return true;
        }

        this.picked.keyHolderId = userId;
        this.picked.dpsTwoId = userId;
        return true;
      }
    }
    this.clearSlots();
    return false;
  }
}
