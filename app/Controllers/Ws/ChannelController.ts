import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import { inject } from '@adonisjs/core/build/standalone'

// inject repository from container to controller constructor
// we do so because we can extract database specific storage to another class
// and also to prevent big controller methods doing everything
// controler method just gets data (validates it) and calls repository
// also we can then test standalone repository without controller
// implementation is bind into container inside providers/AppProvider.ts
@inject([
  'Repositories/ChannelRepository',
])
export default class MessageController {
  constructor(
    private channelRepository: ChannelRepositoryContract
  ) {}

  public async addUser({ params, auth, socket }: WsContextContract) {
    const user = auth.user!

    const channel = await this.channelRepository.findByName(params.name)

     /* const error = checkForErrors(
       {
         channelShouldBePublic: true,
         userShouldNotBeInChannel: true,
       },
       { channel, user }
     )
     if (error) {
       return { error: error }
     } */
    await this.channelRepository.attachUser(user, channel)
    // await this.channelRepository.updateJoinedAt(user, channel)
    socket.broadcast.emit('userJoined', user)
    return channel
  }
}