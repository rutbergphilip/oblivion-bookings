import { MessageCollector } from 'discord.js';
import { Factions } from '../constants/factions.enum';
import { RequestTypes } from '../constants/request.enum';

export interface IMythicPlusBoost {
  faction: Factions;
  isComplete: boolean;
  isOpenForAll: boolean;
  requestChannelId?: string;
  signupsChannelId?: string;
  customerId: string;
  handlerId?: string;
  team?: {
    name: string;
    teamId: string;
    leaderId: string;
  };
  boosters?: {
    tankId: string;
    healerId: string;
    dpsOneId: string;
    dpsTwoId: string;
  };
  teamQueue?: {
    teamName: string;
    teamId: string;
    leaderId: string;
  }[];
  queues?: {
    tankQueue: string[];
    healerQueue: string[];
    dpsQueue: string[];
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
}
