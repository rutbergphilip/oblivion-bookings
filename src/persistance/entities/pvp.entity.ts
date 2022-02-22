import { BaseEntity } from './base.entity';
import { RequestTypes } from '../../constants/request.enum';

export interface PVPRequestEntity extends BaseEntity {
  type: RequestTypes;
  id: string;
}
