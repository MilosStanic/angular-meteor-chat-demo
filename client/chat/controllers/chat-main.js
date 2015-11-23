// Since we don't want all those debug messages
Meteor._debug = (function (super_meteor_debug) {
  return function (error, info) {
    if (!(info && _.has(info, 'msg')))
      super_meteor_debug(error, info);
  }
})(Meteor._debug);

angular.module('chatapp').controller('MainChatCtrl',[ '$meteor', '$scope', '$rootScope', '$timeout',
	function($meteor, $scope, $rootScope, $timeout){
		var vm = this;
		
		vm.featuredUsers = $scope.$meteorCollection(Meteor.users, false).subscribe('users');
		vm.clients = $scope.$meteorCollection(Clients, false).subscribe('clients');
		
		vm.getUserIdFromServer = function() {
			$meteor.call('getuid').then(function(uid){
				console.log('uid from server', uid);
			});
		};

		vm.getSocketIdFromServer = function(uid){
			return $meteor.call('getsid', uid).then(function(result){
				console.log('User', uid, 'has sid', result[0]);
				return result[0].sid;
			})
		}
		
		vm.sid = Streamy.id();
		
		vm.chatsOpen = [];
		vm.messages = [];
		vm.selectedIndex = 0;
		vm.selected = null;
		vm.previous = null;
		
		// query server for a chat partner info and add it to vm.chatsOpen
		vm.openChat = function(chatUser) {
			var newChat = { uid: chatUser._id, nick: chatUser.emails[0].address, messages: [] };						
			console.log('retrieving sid for user', chatUser.emails[0].address, ' with _id', chatUser._id);
			$meteor.call('getsid', chatUser._id).then(function(result){				
				newChat.sid = result[0].sid;
				vm.chatsOpen.push(newChat);
				vm.selectedIndex++;
				console.log('remote user sid', newChat.sid);
			});			
			
		};
		
		vm.sendMessage = function() {
			// send userdata together with body (uid, sid, nick)
			var msgdata = { body: vm.newMessageText, uid: $rootScope.currentUser._id , sid: Streamy.id(), nick: $rootScope.currentUser.emails[0].address};
			//vm.messageForm = {};
			vm.messageForm.$setPristine();
			vm.messageForm.$setUntouched();			
			vm.chatsOpen[vm.selectedIndex].messages.push(msgdata);
			vm.newMessageText = '';
			console.log('sending message to server', msgdata);
			//_.result(_.find(vm.chatsOpen, {}), 'sid');
			vm.getSocketIdFromServer(vm.chatsOpen[vm.selectedIndex].uid).then(function(partnersid){
				console.log('partner sid', partnersid);
				//Streamy.sessions(vm.chatsOpen[vm.selectedIndex].sid).emit('direct_message', msgdata);
				Streamy.sessions(partnersid).emit('direct_message', msgdata);
			});
			
		};
		
		Streamy.on('direct_message', function(data){
			console.log('incoming data', data);
			// check if there is already tab open, if not, open tab
			// then insert message to tab, i.e. active chat
			var tabIndex = _.findIndex(vm.chatsOpen, 'uid', data.uid );
			if (tabIndex >= 0) {
				vm.chatsOpen[tabIndex].messages.push(data);
			} else {
				var newChat = { uid: data.uid, sid: data.sid, nick: data.nick, messages: [data], typing: false};
				//newChat.messages.push(data.body);
				vm.chatsOpen.push(newChat);
			}
			$scope.$apply();
		});	

		vm.whenTyping = function(event) {			
			Streamy.sessions(vm.chatsOpen[vm.selectedIndex].sid).emit('typing', {uid: $rootScope.currentUser._id});
		}

		Streamy.on('typing', function(user){			
			var tabIndex = _.findIndex(vm.chatsOpen, 'uid', user.uid);
			vm.chatsOpen[tabIndex].typing = true;
			$timeout(function(){
				vm.chatsOpen[tabIndex].typing = false;
			}, 2000);
		});
		
		$scope.$watch('selectedIndex', function(current, old){
			vm.previous = vm.selected;
			vm.selected = vm.chatsOpen[current];		
		});
		
		
	}]);
	
