'use strict';

/* Services */
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.08
 * Time: 11:11
 */

angular.module("mainSection")
    .factory('currentPlanetService', ['$q', '$rootScope', '$websocket', 'appConstants', 'jediStore', function ($q, $scope, $websocket, constants, jediStore) {
        var dataStream = $websocket('ws://localhost:4000');
        var collection = [];

        dataStream.onMessage(function (message) {
            var planetData = JSON.parse(message.data);
            this.scope.currentPlanet = planetData.name;

            if (jediStore._jedi !== undefined) {
                jediStore._localJedi = false;
                for (var i = 0; i < jediStore._jedi.length; i++) {
                    if (jediStore._jedi[i].homeworld.id == planetData.id) {
                        if (jediStore._jedi.length == constants.ROWS_AMOUNT) {
                            jediStore._pendingRequestsCount = 0;
                            if (jediStore._activeRequest !== undefined && jediStore._activeRequest != null) {
                                jediStore._canceller.resolve();
                                jediStore._canceller = $q.defer();
                            }
                            jediStore._jedi[i].style = ' red';
                            $scope.disableScrollUp = $scope.disableScrollDown = ' css-button-disabled';
                            jediStore._localJedi = true;
                        }
                    } else {
                        jediStore._jedi[i].style = '';
                    }
                }
                if (jediStore._localJedi) {
                    return;
                }
            }
            if (jediStore._jedi.length == constants.ROWS_AMOUNT) {
                $scope.disableScrollUp = $scope.disableScrollDown = '';
                if (jediStore._jedi[jediStore._jedi.length - 1].apprentice === undefined) {
                    $scope.disableScrollDown = ' css-button-disabled';
                }
                if (jediStore._jedi[0].master === undefined) {
                    $scope.disableScrollUp = ' css-button-disabled';
                }
            }
        });

        var methods = {
            collection: collection,
            get: function () {
                dataStream.send(JSON.stringify({action: 'get'}));
            }
        };

        return methods;
    }]);































