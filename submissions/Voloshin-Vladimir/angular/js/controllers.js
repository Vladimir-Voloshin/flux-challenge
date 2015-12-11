'use strict';

/* Controllers */
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.08
 * Time: 11:11
 */

angular.module('mainSection')
    .controller('sithController', ['$rootScope', '$http', 'appConstants', 'Common', function ($scope, $http, appConstants, $common) {
    $http.get(appConstants.BASE_URL + appConstants.INITIAL_ID)
        .then(function(response) {
            $common.populateJediList(response.data);
        });

        $scope.scrollJediList = function(direction){
            if(($scope.disableScrollUp != '' && direction) || ($scope.disableScrollDown != '' && !direction)){
                console.log(1);
                return;
            }
            $common.scrollJediList(direction);
        }
}]);
