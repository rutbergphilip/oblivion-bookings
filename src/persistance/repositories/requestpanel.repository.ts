import { RequestEmbedEntity } from '../entities/requestembed.entity';
import { ConnectionService } from '../connection.service';
import { ObjectId } from 'mongodb';
import { Snowflake } from 'discord-api-types';

export class GlobalRepository {
  private readonly COLLECTION = 'global';

  async get(): Promise<RequestEmbedEntity> {
    const database = await ConnectionService.get();
    return await database
      .collection<RequestEmbedEntity>(this.COLLECTION)
      .findOne({ name: 'requests' });
  }

  async insert(entity: RequestEmbedEntity): Promise<RequestEmbedEntity> {
    const database = await ConnectionService.get();
    const insertEntity = {
      ...entity,
      ...{
        createdAt: new Date().getTime() / 1000,
        updatedAt: new Date().getTime() / 1000,
      },
    };
    const result = await database
      .collection(this.COLLECTION)
      .insertOne(insertEntity);
    return {
      ...insertEntity,
      _id: result.insertedId,
    };
  }

  async update(entity: RequestEmbedEntity): Promise<RequestEmbedEntity> {
    const database = await ConnectionService.get();
    const updatedEntity = {
      ...entity,
      ...{
        updatedAt: new Date().getTime() / 1000,
      },
    };
    const result = await database
      .collection<RequestEmbedEntity>(this.COLLECTION)
      .updateOne({ _id: entity._id }, { $set: updatedEntity });
    return {
      ...updatedEntity,
      _id: result.upsertedId,
    };
  }
}
