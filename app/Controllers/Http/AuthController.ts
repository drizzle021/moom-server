import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import RegisterUserValidator from 'App/Validators/RegisterUserValidator'
import { cuid } from '@ioc:Adonis/Core/Helpers'

export default class AuthController {
  async register({ request }: HttpContextContract) {
    const data = await request.validate(RegisterUserValidator)

    const icon = request.file('icon')
    let iconPath = ''
    if (icon) { 
      const fileName = `${cuid()}.${icon.extname}`
      
      await icon.moveToDisk('', {
         name: fileName,
         overwrite: true
        }) 


    // save full path with backend prefix
    iconPath = `${request.protocol()}://${request.host()}/uploads/${fileName}`
    }
    const user = await User.create({...data, icon:iconPath})
    // join user to general channel
    const general = await Channel.findByOrFail('name', 'general')
    await user.related('channels').attach([general.id])
    return user
  }

  async login({ auth, request }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    return auth.use('api').attempt(email, password)
  }

  async logout({ auth }: HttpContextContract) {
    return auth.use('api').logout()
  }

  async me({ auth }: HttpContextContract) {
    await auth.user!.load('channels')
    return auth.user
  }
}
