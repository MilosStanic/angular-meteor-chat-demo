angular.module ('chatapp').directive('navbar', function (){
    var ctrl = function ($mdMedia, $mdSidenav, $rootScope){
    	var vm = this;

        vm.screenIsSmall = $mdMedia('sm');

        vm.toggleLeft = function() {
			$mdSidenav('left')
				.open();
		};
        
        vm.isAdmin = function(){
            if($rootScope.currentUser) {
                if($rootScope.currentUser.roles) {
                    if(_.contains($rootScope.currentUser.roles, 'super-admin')) return true;
                    else return false;
                }
            }            
        };
    };
    return {
        restrict: "E",
        templateUrl: 'client/navbar/navbar.ng.html',
        controller: ctrl, 
        controllerAs: 'nc',
        bindToController: true
    }    
});