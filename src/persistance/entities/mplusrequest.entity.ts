import { BaseEntity } from './base.entity';
import { RequestTypes } from '../../constants/request.enum';

export interface MythicPlusRequestEntity extends BaseEntity {
  type: RequestTypes;
  isComplete: boolean;
  requestId?: string;
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
  faction: string;
  boostInfo?: {
    keys: {
      dungeon: string;
      level: string;
      timed: boolean;
    }[];
    armorStack: string;
    paymentRealm: string;
  };
}
