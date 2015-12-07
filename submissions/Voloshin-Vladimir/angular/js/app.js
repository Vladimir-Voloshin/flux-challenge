/**
 * User: Voloshin Vladimir
 * Date: 19.11.15
 * Time: 11:11
 */

var app = angular.module('mainSection', []);
app.controller('sithController', function($scope) {
    $scope.firstName = "John";
    $scope.lastName = "Doe";
});

angular.module('mainSection', [
        'ngWebSocket'
    ])
    .factory('planetData', function($websocket) {
        // Open a WebSocket connection
        var dataStream = $websocket('ws://localhost:4000');

        var collection = [];

        dataStream.onMessage(function(message) {
            collection.push(JSON.parse(message.data));
        });

        var methods = {
            collection: collection,
            get: function() {
                dataStream.send(JSON.stringify({ action: 'get' }));
            },
            onmessage: function(){
                console.log(collection);
            }
        };

        return methods;
    })
    .controller('SomeController', function ($scope, planetData) {
        $scope.planetData = planetData;
    });



