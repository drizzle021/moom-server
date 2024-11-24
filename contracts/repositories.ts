// here we are declaring our MessageRepository types for Repositories/MessageRepository
// container binding. See providers/AppProvider.ts for how we are binding the implementation
declare module "@ioc:Repositories/MessageRepository" {
  export interface SerializedMessage {
    createdBy: number,
    content: string,
    channelId: number,
    createdAt: string,
    updatedAt: string,
    id: number,
    author: {
      id: number,
      email: string,
      createdAt: string,
      updatedAt: string,
    }
  }
  
  export interface MessageRepositoryContract {
    getAll(channelName: string): Promise<SerializedMessage[]>
    create(
      channelName: string,
      userId: number,
      content: string
    ): Promise<SerializedMessage>
  }
  
  const MessageRepository: MessageRepositoryContract
  export default MessageRepository
}

declare module '@ioc:Repositories/UserRepository' {
  import User from 'App/Models/User'

  export interface UserRepositoryContract {
    findByNickname(name: string): Promise<User | null>
  }

  export const UserRepository: UserRepositoryContract
}

declare module '@ioc:Repositories/ChannelRepository' {
  import User from 'App/Models/User'
  import Channel from 'App/Models/Channel'


  export interface SerializedChannel {
    id: number
    name: string
    //joinedAt: string
  }

  export interface ChannelRepositoryContract {
    findByName(channelName: string): Promise<Channel>
    findByUser(user: User): Promise<SerializedChannel[]>
    create(user: User, is_private: boolean, channelName: string): Promise<Channel>
    updateJoinedAt(user: User, channel: Channel): Promise<void>
    attachUser(user: User, channel: Channel): Promise<void>
    detachUser(user: User, channel: Channel): Promise<void>
    deleteByName(channelName: string): Promise<void>
    delete(channel: Channel): Promise<void>
  }

  export const ChannelRepository: ChannelRepositoryContract
}
  /* 
  export interface SerializedChannel {
    id: number
    name: string
    createdAt: string
    updatedAt: string
    picture: string
    is_private: boolean
    adminId: number

  }

  export interface ChannelRepositoryContract {
    getAll(): Promise<SerializedChannel[]>
    create(
      user: User, 
      is_private: boolean, 
      channelName: string, 
      adminId: number, 
    //  picture: string
    ): Promise<SerializedChannel>
  }

  const ChannelRepository: ChannelRepositoryContract */
  //export default ChannelRepository
//}
