import { DateTime } from 'luxon'
import { BaseModel,
  column,
  HasMany,
  hasMany,
  beforeSave,
  belongsTo,
  BelongsTo,
 } from '@ioc:Adonis/Lucid/Orm'
import Message from 'App/Models/Message'
import User from 'App/Models/User'

import { v4 as uuidv4 } from 'uuid';

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public adminId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Message, {
    foreignKey: 'channelId',
  })
  public messages: HasMany<typeof Message>

  @belongsTo(() => User, {
    foreignKey: 'adminId',

  })
  public admin: BelongsTo<typeof User>

  // generate uuids
  @beforeSave() 
  public static async addUuid (channel: Channel) {
    if (!channel.id) { 
      channel.id = uuidv4();
    }
  }
}
