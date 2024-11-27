// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { inject } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
// import { checkForErrors } from 'App/Helpers'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
@inject(['Repositories/MessageRepository', 'Repositories/ChannelRepository'])
export default class MessagesController {
  constructor(
    private messageRepository: MessageRepositoryContract,
    private channelRepository: ChannelRepositoryContract
  ) {}

  public async loadMessages({ params, request, auth }: HttpContextContract) {
    const channel = await this.channelRepository.findByName(params.name)
    const query = request.qs()
    // falsy values will be converted to 1
    const page = query.page || 1
    // null or undefined will be converted
    const date = query.date ?? new Date().toISOString()

    console.log('akakakakakak')
    return this.messageRepository.findAllByChannel(channel, page, date)
  }
}