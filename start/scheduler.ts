import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import Ws from '@ioc:Ruby184/Socket.IO/Ws'

const channelActivityCheck = async () => {
  const channels = await Channel.query()
  for (const c of channels) {
    const lastMessage = await Message.query()
      .where('channel_id', c.id)
      .orderBy('created_at', 'desc')
      .firstOrFail()
    let lastDate = c.createdAt
    if (lastMessage !== null) {
        lastDate = lastMessage.createdAt
    }
    const diff = Math.abs(lastDate.diffNow(['days']).days)
    if (diff > 30) {
      const nsp = Ws.io.of(`channels/${c.name}`)
      await c.delete()
      nsp.emit('channelDeleted', c.name)
    }
  }
}

const schedule = require('node-schedule')
schedule.scheduleJob('0 3 * * *', channelActivityCheck)
void channelActivityCheck()