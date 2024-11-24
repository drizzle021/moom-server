import type { UserRepositoryContract } from '@ioc:Repositories/UserRepository'
import User from 'App/Models/User'

export default class UserRepository implements UserRepositoryContract {
  public async findByNickname(name: string): Promise<User | null> {
    return await User.query().where('nickname', name).first()
  }
}
