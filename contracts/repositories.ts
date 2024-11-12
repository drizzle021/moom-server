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


  declare module '@ioc:Repositories/ChannelRepository' {
    import User from 'App/Models/User'
    import Channel from 'App/Models/Channel'
  
    export interface SerializedChannel {
      id: number
      name: string
    }
  
    export interface ChannelRepositoryContract {
      create(user: User, isPublic: boolean, channelName: string): Promise<Channel>
    }
  }
