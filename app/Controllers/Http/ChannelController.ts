import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import { inject } from '@adonisjs/core/build/standalone'
//import { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'


@inject(['Repositories/ChannelRepository'])
export default class ChannelController {
    constructor(private channelRepository: ChannelRepositoryContract) {}
    
    //public async loadChannels({}: HttpContextContract) {
      //  return this.channelRepository.getAll()
    //}

    public async getUserChannels({ auth }: HttpContextContract) {
      return await this.channelRepository.findByUser(auth.user!)
    }
    
    public async getChannel({ params, response }: HttpContextContract) {
        try {
          return await this.channelRepository.findByName(params.name)
        } catch (e) {
          return response.status(200).send({
            msg: e.message,
          })
        }
      }

    public async addChannel({ request, auth, response }: HttpContextContract) {
        const data = request.all()
        //console.log(auth.user)

        console.log(data)
        //console.log()

        try{
            const newChannel = await this.channelRepository.create(
                auth.user!,
                data.is_private,
                data.name,
                //data.admin_id
            )
            const user = auth.user!
            //await newChannel.load('messages')
            //await newChannel.load('users')
//            await user.related('channels').attach([newChannel.id])
            return newChannel
        } catch (e) {
            console.log(e)
            return response.status(200).send({msg: e.message,})
        }
    }

    public async tryToJoinChannel({ params, auth }: HttpContextContract) {
        let channel
        try {
          channel = await this.channelRepository.findByName(params.name)
          console.log(channel)
          console.log(params.name)
        } catch (e) {
          // new channel will be created
          return {
            success: true,
            channel: null,
          }
        }
        // const user = auth.user!
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
    
        // const kickCount = await this.kickRepository.countUserKicks(
        //   user.id,
        //   channel.id
        // )
        // if (kickCount > 2) {
        //   return {
        //     error: 'You are banned from this channel',
        //   }
        // }
        // return existing channel
        return {
          success: true,
          channel,
        }
      }




}
