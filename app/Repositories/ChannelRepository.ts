import type {
    ChannelRepositoryContract,
  } from '@ioc:Repositories/ChannelRepository'
  import Channel from 'App/Models/Channel'
  import User from 'App/Models/User'

  export default class ChannelRepository implements ChannelRepositoryContract {
    public async create(
        user: User,
        is_private: boolean,
        channelName: string
      ): Promise<Channel> {
        return await user.related('channels').create({
          name: channelName,
          is_private: is_private,
          adminId: user.id,
        })
      }
  }