/* global Tracker */
/* global Streamy */
Streamy.DirectMessages.allow = function(data, from, to) {
  // from is the socket object
  // to is the recipient socket object
  // data contains raw data you can access:
  //  - the message via data.__msg
  //  - the message data via data.__data

  return true;
};

/**
 * Called upon a client connection, insert the user
 */
Streamy.onConnect(function(socket) {   
  Tracker.autorun(function() {
    var uid = Streamy.userId(socket); // uid will be null if the user is not logged in, otherwise, it will take the userId value
    if(uid) {
      console.log("New userId state for", Streamy.id(socket), uid);
      Clients.update({ uid: uid }, 
                      { $set: { sid: Streamy.id(socket)}}, 
                      { upsert: true});
    }
  });  
});

/**
 * Upon disconnect, clear the client database
 */
Streamy.onDisconnect(function(socket) {
  Clients.remove({
    'sid': Streamy.id(socket)
  });

  console.log('removed socket', Streamy.id(socket));
  // Inform the lobby
  Streamy.broadcast('__leave__', {
    'sid': Streamy.id(socket),
    'room': 'lobby'
  });
});

/**
 * When the nick is set by the  client, update the collection accordingly
 */
Streamy.on('nick_set', function(data, from) {
  if(!data.handle)
    throw new Meteor.Error('Empty nick');

  Clients.update({
    'sid': Streamy.id(from)
  }, {
    $set: { 'nick': data.handle }
  });

  // Ack so the user can proceed to the rooms page
  Streamy.emit('nick_ack', { 'nick': data.handle }, from);

  // Inform the lobby
  Streamy.broadcast('__join__', {
    'sid': Streamy.id(from),
    'room': 'lobby'
  });
});

/*Streamy.on('direct_message', function(data, from){
  //console.log('from', from, 'data', data);
  console.log('emitting incoming_message', data);
  Streamy.sessions(from).emit('incoming_message', data);
})*/

/**
 * Only publish clients with not empty nick
 */
Meteor.publish('clients', function() {
  return Clients.find({
    'nick': { $ne: null }
  });
});

Meteor.methods({
  getuid: function() {
    return Meteor.userId();
  }, 
  getsid: function(uid) {
    console.log('getting sid for uid', uid);
    return Clients.find( { 'uid': uid }, {sid: 1, _id: 0}).fetch();
  }, 
  getmysid: function(uid) {
    return Streamy.id()
  }
});

