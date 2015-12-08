'use strict';

/* Controllers */
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.08
 * Time: 11:11
 */

var jediControllers = angular.module('jediControllers', []);

jediControllers.controller('sithController', ['$scope', '$http', 'appConstants', 'planetData', function ($scope, $http, appConstants, planetData) {
    $scope.planetData = planetData;
    $http.get(appConstants.BASE_URL + appConstants.INITIAL_ID)
        .then(function(response) {
            $scope.populateJediList(response.data);
        });
}]);
