import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'



export default class ChannelController {
    constructor(
        private channelRepository: ChannelRepositoryContract,
      ) {}
  async addChannel({ request, auth, response }: HttpContextContract) {
    const data = request.all()

    try{
        const newChannel = await this.channelRepository.create(
            auth.user!,
            data.public,
            data.name
        )

        const user = auth.user!

        await user.related('channels').attach([newChannel.id])
        return newChannel
    } catch (e) {
        return response.status(200).send({
          msg: e.message,
        })
    }
    }
}
