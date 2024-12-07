import { KickRepositoryContract } from '@ioc:Repositories/KickRepository'
import Kick from 'App/Models/Kick'

export default class KickRepository implements KickRepositoryContract {
  public async create(kickerId: number, userId: number, channelId: number): Promise<Kick> {
    return await Kick.create({kickerId, userId, channelId})
  }

  public async checkIfAlreadyKicked(kickerId: number, userId: number, channelId: number): Promise<Kick | null> {
    return await Kick.query()
      .where('kicker_id', kickerId)
      .andWhere('user_id', userId)
      .andWhere('channel_id', channelId)
      .first()
  }

  public async countUserKicks(userId: number, channelId: number): Promise<number> {
    const kickQuery = await Kick.query()
      .where('user_id', userId)
      .andWhere('channel_id', channelId)
      .count('* as count')
    return kickQuery[0].$extras.count
  }

  public async unban(userId: number, channelId: number): Promise<void> {
    await Kick.query()
      .where('user_id', userId)
      .andWhere('channel_id', channelId)
      .delete()
  }
}