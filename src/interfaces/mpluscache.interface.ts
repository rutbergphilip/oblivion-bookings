import { MessageCollector } from 'discord.js';
import { Factions } from './../constants/factions.enum';
import { RequestTypes } from './../constants/request.enum';
export interface IMythicPlusCache {
  type: RequestTypes;
  faction: Factions;
  collector?: MessageCollector;
  hasActiveCollector?: boolean;
  isComplete: boolean;
  requestChannelId?: string;
  signupsChannelId?: string;
  customerId: string;
  handlerId?: string;
  team?: {
    name: string;
    leaderId: string;
  };
  boosters?: {
    tankId: string;
    healerId: string;
    dpsOneId: string;
    dpsTwoId: string;
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
  run?: () => Promise<any>;
}
