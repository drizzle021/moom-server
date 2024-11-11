import { DateTime } from 'luxon'
import { BaseModel, 
  BelongsTo, 
  belongsTo, 
  column,
  beforeSave,
} from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Channel from 'App/Models/Channel'

import { v4 as uuidv4 } from 'uuid';

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public createdBy: string

  @column()
  public channelId: string

  @column()
  public content: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'createdBy',
  })
  public author: BelongsTo<typeof User>

  @belongsTo(() => Channel, {
    foreignKey: 'channelId',
  })
  public channel: BelongsTo<typeof Channel>

  // generate uuids
  @beforeSave() 
  public static async addUuid (message: Message) {
    if (!message.id) { 
      message.id = uuidv4();
    }
  }
}
