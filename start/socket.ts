/*
|--------------------------------------------------------------------------
| Websocket events
|--------------------------------------------------------------------------
|
| This file is dedicated for defining websocket namespaces and event handlers.
|
*/

import Ws from '@ioc:Ruby184/Socket.IO/Ws'

Ws.namespace('/')
  .connected('ActivityController.onConnected')
  .disconnected('ActivityController.onDisconnected')
  .on('changeState', 'ActivityController.changeState')
  .on('inviteUser', 'ChannelController.inviteUser')

  // .connected(({ socket }) => {
  //   console.log('new websocket connection: ', socket.id)
  // })
  // .disconnected(({ socket }, reason) => {
  //   console.log('websocket disconnecting: ', socket.id, reason)
  // })

// this is dynamic namespace, in controller methods we can use params.name
  // .middleware('channel') // check if user can join given channel
Ws.namespace('channels/:name')
  .on('loadMessages', 'MessageController.loadMessages')
  .on('addMessage', 'MessageController.addMessage')
  .on('addUser', 'ChannelController.addUser')
  .on('deleteChannel', 'ChannelController.deleteChannel')
  .on('leaveChannel', 'ChannelController.leaveChannel')
  .on('kickUser', 'ChannelController.kickUser')
  .on('revokeUser', 'ChannelController.revokeUser')

