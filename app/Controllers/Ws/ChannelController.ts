import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import { UserRepositoryContract } from '@ioc:Repositories/UserRepository'
import { KickRepositoryContract } from '@ioc:Repositories/KickRepository'
import { inject } from '@adonisjs/core/build/standalone'

// import Channel from 'App/Models/Channel'
// import User from 'App/Models/User'

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
    private kickRepository: KickRepositoryContract
  ) {}

  public async addUser({ params, auth, socket }: WsContextContract) {
    const user = auth.user!

    const channel = await this.channelRepository.findByName(params.name)

    const kickCount = await this.kickRepository.countUserKicks(user!.id, channel.id)
    // USER IS BANNED
    if (kickCount > 2) {
      return {
        error: 'This user is banned from this channel',
      }
    }

    await this.channelRepository.attachUser(user, channel)
    await new Promise(resolve => setTimeout(resolve, 2000));
    socket.broadcast.emit('userJoined', user, channel)

    return channel
  }

  public async inviteUser({ auth, socket }: WsContextContract,  channelParam: string, userParam: string) {
    const channel = await this.channelRepository.findByName(channelParam)
    const userToInvite = await this.userRepository.findByNickname(userParam)

    const isUserAdmin = channel.adminId === auth.user!.id

    if (!isUserAdmin && channel.is_private) {
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
    const isrevoke = false
    socket.nsp.emit('userInvited', userToInvite, channel, isrevoke)

    return {
      success: true,
    }
  }

  public async leaveChannel({ params, auth, socket }: WsContextContract) {
    const user = auth.user!
    const channel = await this.channelRepository.findByName(params.name)

    if (channel.adminId === user.id) {
      await this.channelRepository.delete(channel)
      socket.broadcast.emit('channelDeleted', channel.name)
    } else {
      await this.channelRepository.detachUser(user, channel)
      socket.broadcast.emit('userLeft', user, channel)
    }
  }

  public async deleteChannel({ auth, params, socket }: WsContextContract) {
    const channelName = params.name
    const channel = await this.channelRepository.findByName(channelName)

    if (channel.adminId === auth.user!.id) {
      console.log('delete')
      await this.channelRepository.delete(channel)
      socket.broadcast.emit('channelDeleted', channel.name)
    }

    // hova kellene kiirni hogy nem admin    ?
    if (channel.adminId !== auth.user!.id) {
      const error = 'User is not admin'
      console.log(error)
      return { error: error }
    }
  }


  public async revokeUser({ auth, socket }: WsContextContract, channelParam: string, userParam: string) {
    const user = auth.user!
    const channel = await this.channelRepository.findByName(channelParam)
    const userToRevoke = await this.userRepository.findByNickname(userParam)
    if (userToRevoke == null) {
      return
    }

    console.log(channel + userParam)

    if (channel.adminId === user.id) {
      await this.channelRepository.detachUser(userToRevoke, channel)
      const isrevoke = true
      // socket.nsp.emit('userInvited', userToRevoke, channel, isrevoke)

      socket.nsp.emit('userLeft', userToRevoke, channel)
    }
  }

  public async kickUser({ auth, socket }: WsContextContract, channelName: string, user: string) {
    const kicker = auth.user!
    const userToKick = await this.userRepository.findByNickname(user)

    const channel = await this.channelRepository.findByName(channelName)
    const channel_private = channel.is_private
    console.log(channel_private)
    console.log('channel to kick from: ' + channel.name + ' <' + channel.is_private + '>')
    console.log('kicker: ' + kicker.nickname)
    console.log('user to kick: ' + userToKick?.nickname)

    // const error = checkForErrors(
    //   {
    //     userShouldExist: true,
    //     userShouldBeInChannel: true,
    //   },
    //   {
    //     channel: channel,
    //     user: userToKick,
    //   }
    // )
    // if (error) {
    //   return { error: error }
    // }

    // DONT KICK ADMIN
    if (channel.adminId === userToKick!.id) {
      return {
        error: 'You cannot kick admin.',
      }
    }

    // DONT KICK YOURSELF
    if (userToKick!.id === kicker.id) {
      return {
        error: 'You can not kick yourself.',
      }
    }

    // IF ADMIN IS KICKER -> DOES NOT MATTER IF PUBLIC OR PRIVATE -> BAN
    if (kicker.id === channel.adminId){
      const kickCount = await this.kickRepository.countUserKicks(userToKick!.id, channel.id)

      // CREATE 3 records in kickrepository -> BAN
      for (let i = kickCount; i < 3; i++) {
        await this.kickRepository.create(kicker.id, userToKick!.id, channel.id)
      }

      // REMOVE USER
      await this.channelRepository.detachUser(userToKick!, channel)
      socket.nsp.emit('userLeft', userToKick, channel)
      
      // return {
      //   success: true
      // }
    }

    // NOT ADMIN -> CHANNEL IS PRIVATE -> CAN NOT KICK
    if (kicker.id !== channel.adminId && channel_private) {
      return {
        error: 'You are not admin, and the channel is private.',
      }
    }

    // NOT ADMIN -> CHANNEL IS PUBLIC -> COUNT KICKS 3?
    if (kicker.id !== channel.adminId && !channel_private) {
      const alreadyKicked = await this.kickRepository.checkIfAlreadyKicked(kicker.id, userToKick!.id, channel.id)
      if (alreadyKicked) {
        return {
          error: 'You have already kicked this user.',
        }
      }
      // CREATE A KICK
      await this.kickRepository.create(kicker.id, userToKick!.id, channel.id)

      // REMOVE USER
      await this.channelRepository.detachUser(userToKick!, channel)
      socket.nsp.emit('userLeft', userToKick, channel)
      
      // return {
      //   success: true
      // }
    }

  }
}
