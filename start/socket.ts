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

Ws.namespace('channels/:name')
  .on('loadMessages', 'MessageController.loadMessages')
  .on('addMessage', 'MessageController.addMessage')
  .on('addUser', 'ChannelController.addUser')
  .on('deleteChannel', 'ChannelController.deleteChannel')
  .on('leaveChannel', 'ChannelController.leaveChannel')
  .on('kickUser', 'ChannelController.kickUser')
  .on('revokeUser', 'ChannelController.revokeUser')
  .on('currentlyTyping', 'ChannelController.currentlyTyping')

