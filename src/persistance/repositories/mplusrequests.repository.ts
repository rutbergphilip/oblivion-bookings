import { MythicPlusRequestEntity } from './../entities/mplusrequest.entity';
import { ConnectionService } from '../connection.service';
import { ObjectId } from 'mongodb';

export class RequestRepository {
  private readonly COLLECTION = 'mplusrequests';

  async get(objectId: ObjectId | string): Promise<MythicPlusRequestEntity> {
    const database = await ConnectionService.get();
    return await database
      .collection<MythicPlusRequestEntity>(this.COLLECTION)
      .findOne({ _id: new ObjectId(objectId) });
  }

  async insert(
    entity: MythicPlusRequestEntity
  ): Promise<MythicPlusRequestEntity> {
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

  async update(
    entity: MythicPlusRequestEntity
  ): Promise<MythicPlusRequestEntity> {
    const database = await ConnectionService.get();
    const updatedEntity = {
      ...entity,
      ...{
        updatedAt: new Date().getTime() / 1000,
      },
    };
    const result = await database
      .collection<MythicPlusRequestEntity>(this.COLLECTION)
      .updateOne({ _id: entity._id }, { $set: updatedEntity });
    return {
      ...updatedEntity,
      _id: result.upsertedId,
    };
  }

  async delete(objectId: ObjectId | string) {
    const database = await ConnectionService.get();
    await database
      .collection<MythicPlusRequestEntity>(this.COLLECTION)
      .deleteOne({ _id: new ObjectId(objectId) });
  }
}
