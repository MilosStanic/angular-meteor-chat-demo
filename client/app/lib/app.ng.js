
'use strict';
angular.module('chatapp',[
    'angular-meteor'
    ,'ui.router'
    ,'ngMaterial'
    ,'account'
]);

function onReady() {
    angular.bootstrap(document, ['chatapp'], {strictDi: true});
}

if (Meteor.isCordova)
    angular.element(document).on('deviceready', onReady);
else
    angular.element(document).ready(onReady);
