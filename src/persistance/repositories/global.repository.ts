import { RequestEmbedEntity } from '../entities/requestembed.entity';
import { ConnectionService } from '../connection.service';
import { WithId } from 'mongodb';

export class GlobalRepository<T> {
  private readonly COLLECTION = 'global';

  async get<T>(query: string): Promise<WithId<T>> {
    const database = await ConnectionService.get();
    return await database
      .collection(this.COLLECTION)
      .findOne<WithId<T>>({ name: query });
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
