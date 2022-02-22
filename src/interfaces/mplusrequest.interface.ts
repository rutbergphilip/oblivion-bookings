import { RequestTypes } from './../constants/request.enum';

export interface IMythicPlusRequest {
  type: RequestTypes;
  customerId: string;
  handlerId?: string;
  team?: {
    name: string;
    leaderId: string;
  }[];
  queues?: {
    tankQueue: string;
    healerQueue: string;
    dpsOneQueue: string;
    dpsTwoQueue: string;
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
