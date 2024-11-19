import type { ChannelRepositoryContract, SerializedChannel} from '@ioc:Repositories/ChannelRepository'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class ChannelRepository implements ChannelRepositoryContract {

  public async getAll(): Promise<SerializedChannel[]> {
    return await Channel.query()
  }

  public async create(
    user: User,
    is_private: boolean,
    channelName: string,
    admin_id: number,
    picture: string
    ): Promise<SerializedChannel> {
      console.log('aaaaaaaaaaa')

      const channel = await user.related('channels').create({
        name: channelName,
        is_private: is_private,
        admin_id: admin_id, // user.id
        picture: picture
      })

      return channel.serialize() as SerializedChannel 
  }
}
