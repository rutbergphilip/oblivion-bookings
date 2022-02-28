import { MythicPlusBoost } from './../template/mplusboost.template';
import { IMythicPlusCache } from '../interfaces/mpluscache.interface';
import { ObjectId } from 'mongodb';

export const MythicPlusCache = new Map<string | ObjectId, MythicPlusBoost>();
