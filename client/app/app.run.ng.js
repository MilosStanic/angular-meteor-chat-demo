
angular.module("chatapp").run(function($rootScope, $state) {
    $rootScope.$on("$stateChangeError", function(event, next, previous, error) {
        // We can catch the error thrown when the $requireUser promise is rejected
        // and redirect the user back to the main page
        //if (error === "AUTH_REQUIRED") {
        //    $state.go("home");
        //}
    });

});
