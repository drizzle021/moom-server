import { DateTime } from 'luxon'
import { BaseModel,
  column,
  HasMany,
  hasMany,
  belongsTo,
  BelongsTo,
 } from '@ioc:Adonis/Lucid/Orm'
import Message from 'App/Models/Message'
import User from 'App/Models/User'



export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public adminId: number

  @column()
  public is_private: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Message, {
    foreignKey: 'channelId',
  })
  public messages: HasMany<typeof Message>

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'adminId',

  })
  public admin: BelongsTo<typeof User>


}
