import { inject } from '@adonisjs/core/build/standalone'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import { UserRepositoryContract } from '@ioc:Repositories/UserRepository'
// import { KickRepositoryContract } from '@ioc:Repositories/KickRepository'
// import { checkForErrors } from 'App/Helpers'

// inject repository from container to controller constructor
// we do so because we can extract database specific storage to another class
// and also to prevent big controller methods doing everything
// controler method just gets data (validates it) and calls repository
// also we can then test standalone repository without controller
// implementation is bind into container inside providers/AppProvider.ts
@inject([
  'Repositories/ChannelRepository',
  'Repositories/UserRepository',
  'Repositories/KickRepository',
])
export default class ChannelController {
  constructor(
    private channelRepository: ChannelRepositoryContract,
    private userRepository: UserRepositoryContract,
    // private kickRepository: KickRepositoryContract
  ) {}

  public async addUser({ params, auth, socket }: WsContextContract) {
    const user = auth.user!
    const channel = await this.channelRepository.findByName(params.name)
    // const error = checkForErrors(
    //   {
    //     channelShouldBePublic: true,
    //     userShouldNotBeInChannel: true,
    //   },
    //   { channel, user }
    // )
    // if (error) {
    //   return { error: error }
    // }
    await this.channelRepository.attachUser(user, channel)
    await this.channelRepository.updateJoinedAt(user, channel)
    socket.broadcast.emit('userJoined', user)
    return channel
  }

//   public async removeUser({ params, auth, socket }: WsContextContract) {
//     const channelName = params.name
//     const user = auth.user!
//     const channel = await this.channelRepository.findByName(channelName)
//     if (channel.adminId === user.id) {
//       await this.channelRepository.delete(channel)
//       socket.nsp.emit('channelDeleted', channel.name)
//     } else {
//       await this.channelRepository.detachUser(user, channel)
//       socket.broadcast.emit('userLeft', user)
//     }
//   }

//   public async deleteChannel({ auth, params, socket }: WsContextContract) {
//     const channelName = params.name
//     const user = auth.user!
//     const channel = await this.channelRepository.findByName(channelName)
//     const errParams = {
//       userShouldBeAdmin: true,
//     }
//     const error = checkForErrors(errParams, {
//       channel,
//       user,
//     })
//     if (error) {
//       return { error: error }
//     }
//     await this.channelRepository.delete(channel)
//     socket.nsp.emit('channelDeleted', channel.name)
//   }

  public async inviteUser({ auth, socket }: WsContextContract, channelParam: string, userParam: string) {
    const channel = await this.channelRepository.findByName(channelParam)
    const userToGetInvited = await this.userRepository.findByNickname(userParam)
    // const error = checkForErrors(
    //   {
    //     userShouldExist: true,
    //     userShouldNotBeInChannel: true,
    //   },
    //   {
    //     channel: channel,
    //     user: userToGetInvited,
    //   }
    // )
    // if (error) {
    //   return { error: error }
    // }
    const isUserAdmin = channel.adminId === auth.user!.id

    if (!isUserAdmin && !channel.is_private) {
      return { error: 'You are not admin of this channel.' }
    }

    // const kickCount = await this.kickRepository.countUserKicks(
    //   userToGetInvited!.id,
    //   channel.id
    // )
    // if (!isUserAdmin) {
    //   if (kickCount > 2) {
    //     return {
    //       error: 'This user is banned from this channel',
    //     }
    //   }
    // } else {
    //   // unban user
    //   await this.kickRepository.deleteAllByUserIdAndChannelId(
    //     userToGetInvited!.id,
    //     channel.id
    //   )
    // }

    await this.channelRepository.attachUser(userToGetInvited!, channel)
    socket.broadcast.emit('newInvite', userToGetInvited, channel)
    socket.nsp.emit('invitedUserJoined', userToGetInvited, channel)
    return {
      success: true,
    }
  }



  public async typing(
    { params, auth, socket }: WsContextContract,
    message: string
  ) {
    socket.broadcast.emit('typing', {
      user: auth.user!.nickname,
      channel: params.name,
      content: message,
    })
  }
}