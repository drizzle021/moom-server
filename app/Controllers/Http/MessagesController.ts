import { inject } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
@inject(['Repositories/MessageRepository', 'Repositories/ChannelRepository'])
export default class MessagesController {
  constructor(
    private messageRepository: MessageRepositoryContract,
  ) {}

  public async loadMessages({ params, request }: HttpContextContract) {
    const query = request.qs()

    const page = query.page || 1
    
    return await this.messageRepository.findPaginated(params.name, page)
  }
}