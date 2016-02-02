'use strict';

/* Controllers */
/**
 * User: Voloshyn Vladymyr
 * Date: 2015.12.08
 * Time: 11:11
 */

angular.module("mainSection")
    .controller('sithController', ['$rootScope', '$http', 'appConstants', 'jediStore', 'currentPlanetService', function ($scope, $http, appConstants, jediStore, currentPlanet) {
    $http.get(appConstants.BASE_URL + appConstants.INITIAL_ID)
        .then(function(response) {
            jediStore.populateJediList(response.data);
        });

        $scope.scrollJediList = function(direction){
            if(($scope.disableScrollUp != '' && direction) || ($scope.disableScrollDown != '' && !direction)){
                return;
            }
            jediStore.scrollJediList(direction);
        }
}]);
