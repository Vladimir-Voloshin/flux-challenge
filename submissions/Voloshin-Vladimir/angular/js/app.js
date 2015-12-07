/**
 * User: Voloshin Vladimir
 * Date: 19.11.15
 * Time: 11:11
 */

var app = angular.module('mainSection', []);
app.controller('sithController', function($scope) {});

angular.module('mainSection', [
        'ngWebSocket'
    ])
    .factory('planetData', function($websocket) {
        var dataStream = $websocket('ws://localhost:4000');
        var collection = [];

        dataStream.onMessage(function(message) {
            collection.push(JSON.parse(message.data));
        });

        dataStream.onMessage(function(message) {
            planetData = JSON.parse(message.data)
            this.scope.id = planetData.id;
            this.scope.currentPlanet = planetData.name;
        });

        var methods = {
            collection: collection,
            get: function() {
                dataStream.send(JSON.stringify({ action: 'get' }));
            }
        };

        return methods;
    })
    .controller('sithController', function ($scope, planetData) {
        $scope.planetData = planetData;
    });
