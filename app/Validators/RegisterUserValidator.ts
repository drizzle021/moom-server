import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RegisterUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    email: schema.string({}, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email' })
    ]),
    password: schema.string({}, [
      rules.minLength(8),
      //rules.confirmed('passwordConfirmation')
    ]),
    name: schema.string({}, [
      rules.alpha(),
    ]),
    surname: schema.string({}, [
      rules.alpha(),
    ]),
    nickname: schema.string({}, [
      rules.alphaNum(),
      rules.unique({ table: 'users', column: 'nickname' })
    ]),
    icon: schema.file.optional({ 
      size: '4mb',
      extnames: ['jpg', 'png', 'jpeg'], 
    }),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = { 
    'username.required': 'Username is required', 
    'email.required': 'Email is required', 
    'email.email': 'Email must be a valid email address', 
    'password.required': 'Password is required', 
    'icon.file.extname': 'You can only upload images', 
    'icon.file.size': 'Image size must be under 2MB',
  }
}
