import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { inject } from '@adonisjs/core/build/standalone'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import { UserRepositoryContract } from '@ioc:Repositories/UserRepository'
import { KickRepositoryContract } from '@ioc:Repositories/KickRepository'

// inject repository from container to controller constructor
// we do so because we can extract database specific storage to another class
// and also to prevent big controller methods doing everything
// controler method just gets data (validates it) and calls repository
// also we can then test standalone repository without controller
// implementation is bind into container inside providers/AppProvider.ts
@inject([
  'Repositories/MessageRepository',
  'Repositories/ChannelRepository',
  'Repositories/UserRepository',
  'Repositories/KickRepository',
])
export default class MessageController {
  constructor(
    private messageRepository: MessageRepositoryContract,
    private channelRepository: ChannelRepositoryContract,
    private userRepository: UserRepositoryContract,
    private kickRepository: KickRepositoryContract
  ) {}


  public async loadMessages({ params }: WsContextContract) {
    return this.messageRepository.getAll(params.name)
  }

  public async addMessage({ params, socket, auth }: WsContextContract, content: string) {
    const message = await this.messageRepository.create(
      params.name,
      auth.user!.id,
      content
    )
    // broadcast message to other users in channel
    socket.broadcast.emit('message', message)
    // return message to sender
    return message
  }

  public async inviteUser({ auth, socket }: WsContextContract, channelParam: string, userParam: string) {
    const channel = await this.channelRepository.findByName(channelParam)
    const userToInvite = await this.userRepository.findByNickname(userParam)

    const isUserAdmin = channel.adminId === auth.user!.id

    if (!isUserAdmin && !channel.is_private) {
      return { error: 'You are not admin of this channel.' }
    }

    // CHECK AND UNBAN USER
    const kickCount = await this.kickRepository.countUserKicks(userToInvite!.id, channel.id)
    // USER IS BANNED
    if (!isUserAdmin) {
      if (kickCount > 2) {
        return {
          error: 'This user is banned from this channel',
        }
      }
    } 
    // UNBAN USER
    else {
      await this.kickRepository.unban(userToInvite!.id,channel.id)
    }

    await this.channelRepository.attachUser(userToInvite!, channel)
    socket.nsp.emit('userInvited', userToInvite, channel)

    return {
      success: true,
    }
  }
}