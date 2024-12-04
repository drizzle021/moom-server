import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Channel from 'App/Models/Channel'

export default class Kick extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public channelId: number

  @column()
  public userId: number

  @column()
  public kickerId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'kickerId',
  })
  public kicker: BelongsTo<typeof User>

  @belongsTo(() => Channel, {
    foreignKey: 'channelId',
  })
  public channel: BelongsTo<typeof Channel>
}