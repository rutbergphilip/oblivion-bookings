import { ObjectId } from 'mongodb';
import { Factions } from '../constants/factions.enum';
import { RequestTypes } from '../constants/request.enum';

export interface IMythicPlusBoost {
  type: RequestTypes;
  faction: Factions;
  customerId: string;
  boostId: string | ObjectId;
  isComplete: boolean;
  isOpenForAll: boolean;
  isTeamTaken?: boolean;
  hasStarted?: boolean;
  requestChannelId?: string;
  signupsChannelId?: string;
  picked?: {
    teamLeaderId: string;
    tankId: string;
    healerId: string;
    dpsOneId: string;
    dpsTwoId: string;
    keyHolderId: string;
    handlerId: string;
  };
  queues?: {
    teamLeaderQueue: string[];
    tankQueue: string[];
    healerQueue: string[];
    dpsQueue: string[];
    keyHolderQueue: string[];
    handlerQueue: string[];
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

export interface IQueues {
  teamLeaderQueue: string[];
  tankQueue: string[];
  healerQueue: string[];
  dpsQueue: string[];
  keyHolderQueue: string[];
  handlerQueue: string[];
}
