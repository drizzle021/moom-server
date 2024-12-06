import type {
  ChannelRepositoryContract,
  SerializedChannel,
} from '@ioc:Repositories/ChannelRepository'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class ChannelRepository implements ChannelRepositoryContract {
  public async findByName(channelName: string): Promise<Channel> {
    return await Channel.query()
      .where('name', channelName)
      .preload('users')
      .preload('messages')
      .firstOrFail()
  }

  public async findByUser(user: User): Promise<SerializedChannel[]> {
    const channels = await user
    .related('channels')
    .query()
    .pivotColumns(['created_at'])
    .orderBy('channel_users.created_at', 'desc')

    return channels.map((channel) => {
      const serializedChannel = channel.serialize() as SerializedChannel
      return serializedChannel
    })
    
/*     const channels = await user.related('channels').query()
    return channels.map((channel) => {
      const serializedChannel = channel.serialize() as SerializedChannel
      return serializedChannel
    }) */
  }

  public async create(user: User, is_private: boolean, channelName: string): Promise<Channel> {
    return await user.related('channels').create({
      name: channelName,
      is_private: is_private,
      adminId: user.id,
    })
  }

  public async attachUser(user: User, channel: Channel): Promise<void> {
    await channel.related('users').attach([user.id])
  }

  public async detachUser(user: User, channel: Channel): Promise<void> {
    await channel.related('users').detach([user.id])
  }

  public async deleteByName(channelName: string): Promise<void> {
    await Channel.query().where('name', channelName).delete()
  }

  public async delete(channel: Channel): Promise<void> {
    await channel.delete()
  }
}