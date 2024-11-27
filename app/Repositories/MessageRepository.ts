import { ModelPaginatorContract } from "@ioc:Adonis/Lucid/Orm"
import type { MessageRepositoryContract, SerializedMessage } from "@ioc:Repositories/MessageRepository"
import Channel from "App/Models/Channel"
import Message from "App/Models/Message"

export default class MessageRepository implements MessageRepositoryContract {
  public async getAll(channelName: string): Promise<SerializedMessage[]> {
    const channel = await Channel.query()
      .where("name", channelName)
      .preload("messages", (messagesQuery) => messagesQuery.preload("author"))
      .firstOrFail()

    return channel.messages.map(
      (message) => message.serialize() as SerializedMessage
    )
  }


  public async findAllByChannel(
    channel: Channel,
    page: number = 1,
    beforeDate: Date = new Date(),
    limit: number = 20
  ): Promise<ModelPaginatorContract<Message>> {
    console.log('kkkkkkkk ' + channel)
    return await Message.query()
      .where('channelId', channel.id)
      .andWhere('created_at', '<=', beforeDate)
      .preload('author')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)
  }


  public async create(
    channelName: string,
    userId: number,
    content: string
  ): Promise<SerializedMessage> {
    const channel = await Channel.findByOrFail("name", channelName)
    const message = await channel
      .related("messages")
      .create({ createdBy: userId, content })
    await message.load("author")

    return message.serialize() as SerializedMessage
  }
}