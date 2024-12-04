import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import { inject } from '@adonisjs/core/build/standalone'
//import { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
// import Channel from 'App/Models/Channel'
// import User from 'App/Models/User'

@inject(['Repositories/ChannelRepository'])
export default class ChannelController {
    constructor(private channelRepository: ChannelRepositoryContract) {}
    
    //public async loadChannels({}: HttpContextContract) {
      //  return this.channelRepository.getAll()
    //}



    public async checkIfUserIsAdmin({ params, auth }: HttpContextContract) {
      const channel = await this.channelRepository.findByName(params.name)
      return channel.adminId === auth.user!.id
    }



    public async getUserChannels({ auth }: HttpContextContract) {
      return await this.channelRepository.findByUser(auth.user!)
    }
    
    public async getChannel({ params, response, request }: HttpContextContract) {
        try {
          /* c.users.forEach(user=>
            { user.icon = user.icon ? `${request.protocol()}://${request.host()}/uploads/${user.icon}` : null
          }) */
          return await this.channelRepository.findByName(params.name)
        } catch (e) {
          return response.status(200).send({
            msg: e.message,
          })
        }
      }

    public async addChannel({ request, auth, response }: HttpContextContract) {
        const data = request.all()

        try{
            const newChannel = await this.channelRepository.create(
                auth.user!,
                data.is_private,
                data.name,
                //data.admin_id
            )
            //const user = auth.user!
            await newChannel.load('messages')
            await newChannel.load('users')
            
            return newChannel
        } catch (e) {
            console.log(e)
            return response.status(500).send({msg: e.message,})
        }
    }

    public async tryToJoinChannel({ params, auth }: HttpContextContract) {
        let channel
        const usertofind = auth.user!
        
        try {
          channel = await this.channelRepository.findByName(params.name)

        } catch (e) {
          // new channel will be created
          return {
            success: true,
            channel: null,
          }
        }

        if (!channel.isPublic) {
          const error = 'Channel is not public'
          return { error: error }
        }


        const check = channel.users.find((user) => user.id === usertofind.id)
        if (check){
          const error = 'User is already in the channel'
          return {error : error}
        }

        // LOOK AT KICKS IN CASE OF PERMANENT BAN
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
