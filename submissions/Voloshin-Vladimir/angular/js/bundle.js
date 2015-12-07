(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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




},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIFVzZXI6IFZvbG9zaGluIFZsYWRpbWlyXG4gKiBEYXRlOiAxOS4xMS4xNVxuICogVGltZTogMTE6MTFcbiAqL1xuXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ21haW5TZWN0aW9uJywgW10pO1xuYXBwLmNvbnRyb2xsZXIoJ3NpdGhDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgJHNjb3BlLmZpcnN0TmFtZSA9IFwiSm9oblwiO1xuICAgICRzY29wZS5sYXN0TmFtZSA9IFwiRG9lXCI7XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ21haW5TZWN0aW9uJywgW1xuICAgICAgICAnbmdXZWJTb2NrZXQnXG4gICAgXSlcbiAgICAuZmFjdG9yeSgncGxhbmV0RGF0YScsIGZ1bmN0aW9uKCR3ZWJzb2NrZXQpIHtcbiAgICAgICAgLy8gT3BlbiBhIFdlYlNvY2tldCBjb25uZWN0aW9uXG4gICAgICAgIHZhciBkYXRhU3RyZWFtID0gJHdlYnNvY2tldCgnd3M6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuXG4gICAgICAgIHZhciBjb2xsZWN0aW9uID0gW107XG5cbiAgICAgICAgZGF0YVN0cmVhbS5vbk1lc3NhZ2UoZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICAgICAgY29sbGVjdGlvbi5wdXNoKEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBtZXRob2RzID0ge1xuICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGF0YVN0cmVhbS5zZW5kKEpTT04uc3RyaW5naWZ5KHsgYWN0aW9uOiAnZ2V0JyB9KSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25tZXNzYWdlOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBtZXRob2RzO1xuICAgIH0pXG4gICAgLmNvbnRyb2xsZXIoJ1NvbWVDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgcGxhbmV0RGF0YSkge1xuICAgICAgICAkc2NvcGUucGxhbmV0RGF0YSA9IHBsYW5ldERhdGE7XG4gICAgfSk7XG5cblxuXG4iXX0=
