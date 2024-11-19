import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import { inject } from '@adonisjs/core/build/standalone'
//import { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'


@inject(['Repositories/ChannelRepository'])
export default class ChannelController {
    constructor(private channelRepository: ChannelRepositoryContract) {}
    
    public async loadChannels({}: HttpContextContract) {
        return this.channelRepository.getAll()
    }


    public async addChannel({ request, auth, response }: HttpContextContract) {
        const data = request.all()

        try{
            const newChannel = await this.channelRepository.create(
                auth.user!,
                data.is_private,
                data.channelName,
                data.admin_id,
                data.picture
            )
            console.log(data.name)
            const user = auth.user!

            await user.related('channels').attach([newChannel.id])
            return newChannel
        } catch (e) {
            return response.status(200).send({msg: e.message,})
        }
    }
}
