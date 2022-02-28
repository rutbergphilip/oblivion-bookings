import { Factions } from './../../constants/factions.enum';
import { BaseEntity } from './base.entity';
import { RequestTypes } from '../../constants/request.enum';

export interface MythicPlusRequestEntity extends BaseEntity {
  type: RequestTypes;
  faction: Factions;
  isComplete: boolean;
  isOpenForAll: boolean;
  isTeamTaken?: boolean;
  hasStarted?: boolean;
  requestChannelId?: string;
  requestMessageId?: string;
  signupsChannelId?: string;
  signupsMessageId?: string;
  customerId: string;
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
}
