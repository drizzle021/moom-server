import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext';
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


    if (!isUserAdmin && channel.is_private) {
      return { error: 'You are not admin of this channel.' }
    }

    // CHECK AND UNBAN USER
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

  
  public async revokeUser({ auth, socket }: WsContextContract, channelParam: string, userParam: string) {
    const user = auth.user!
    const channel = await this.channelRepository.findByName(channelParam)
    const userToKick = await this.userRepository.findByNickname(userParam)

    if(userToKick==null){
      return
    }

    console.log(channel + userParam)

    if (channel.adminId === user.id) {
      await this.channelRepository.detachUser(userToKick, channel)
      socket.broadcast.emit('userLeft', userToKick)

    }
  }

  public async leaveChannel({ params, auth, socket }: WsContextContract) {
    const user = auth.user!
    const channel = await this.channelRepository.findByName(params.name)

    if (channel.adminId === user.id) {
      await this.channelRepository.delete(channel)
      socket.nsp.emit('channelDeleted', channel.name)
    } else {
      await this.channelRepository.detachUser(user, channel)
      socket.broadcast.emit('userLeft', user)
    }
  }


  public async deleteChannel({ auth, params, socket }: WsContextContract) {
    const channelName = params.name
    const channel = await this.channelRepository.findByName(channelName)

    if (channel.adminId === auth.user!.id){
      console.log('delete')
      await this.channelRepository.delete(channel)
      socket.nsp.emit('channelDeleted', channel.name)
    }

    // hova kellene kiirni hogy nem admin    ?
    if (channel.adminId !== auth.user!.id) {
      const error = 'User is not admin'
      console.log(error)
      return { error: error }
    }

  }



  public async kickUser({ auth, socket, params }: WsContextContract, ...args: any[]) {
    const kicker = auth.user!
    const userParam = ''
    const isRevoke = ''
    const channel = await this.channelRepository.findByName(params.name)
    console.log('channel to kick from: ' + channel)
    console.log('user ' + userParam)
    const userToKick = await this.userRepository.findByNickname(userParam)
    console.log('user to kick: ' + userToKick)

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
    if (channel.adminId === userToKick!.id) {
      return {
        error: 'You cannot kick admin.',
      }
    }
    if (userToKick!.id === kicker.id) {
      return {
        error: 'You can not kick yourself.',
      }
    }
    // ak je to revoke alebo kanal nie je public, tak musi byt pouzivatel admin
    if ((isRevoke || channel.is_private) && channel.adminId !== kicker.id) {
      return {
        error: 'You are not admin of this channel.',
      }
    }

    // ak ten co niekoho kickuje je admin
    if (channel.adminId === kicker.id) {
      const kickCount = await this.kickRepository.countUserKicks(
        userToKick!.id,
        channel.id
      )
      // ak to nie je revoke tak je to ban.
      if (!isRevoke) {
        // vytvorime pocet kickov tak aby boli 3
        for (let i = kickCount; i < 3; i++) {
          await this.kickRepository.create(
            kicker.id,
            userToKick!.id,
            channel.id
          )
        }
      }
    } else {
      const wasAlreadyKicked = await this.kickRepository.findByTriple(
        kicker.id,
        userToKick!.id,
        channel.id
      )
      if (wasAlreadyKicked) {
        return {
          error: 'You have already kicked this user once.',
        }
      }
      //vytvori sa jeden zaznam
      await this.kickRepository.create(kicker.id, userToKick!.id, channel.id)
    }
    await this.channelRepository.detachUser(userToKick!, channel)
    socket.nsp.emit('userKick', userToKick)
    return {
      success: true,
    }
  }

}
