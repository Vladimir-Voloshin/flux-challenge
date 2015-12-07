(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDE5LjExLjE1XG4gKiBUaW1lOiAxMToxMVxuICovXG5cbnZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnbWFpblNlY3Rpb24nLCBbXSk7XG5hcHAuY29udHJvbGxlcignc2l0aENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUpIHt9KTtcblxuYW5ndWxhci5tb2R1bGUoJ21haW5TZWN0aW9uJywgW1xuICAgICAgICAnbmdXZWJTb2NrZXQnXG4gICAgXSlcbiAgICAuZmFjdG9yeSgncGxhbmV0RGF0YScsIGZ1bmN0aW9uKCR3ZWJzb2NrZXQpIHtcbiAgICAgICAgdmFyIGRhdGFTdHJlYW0gPSAkd2Vic29ja2V0KCd3czovL2xvY2FsaG9zdDo0MDAwJyk7XG4gICAgICAgIHZhciBjb2xsZWN0aW9uID0gW107XG5cbiAgICAgICAgZGF0YVN0cmVhbS5vbk1lc3NhZ2UoZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICAgICAgY29sbGVjdGlvbi5wdXNoKEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRhdGFTdHJlYW0ub25NZXNzYWdlKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHBsYW5ldERhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSlcbiAgICAgICAgICAgIHRoaXMuc2NvcGUuaWQgPSBwbGFuZXREYXRhLmlkO1xuICAgICAgICAgICAgdGhpcy5zY29wZS5jdXJyZW50UGxhbmV0ID0gcGxhbmV0RGF0YS5uYW1lO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgbWV0aG9kcyA9IHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb24sXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGRhdGFTdHJlYW0uc2VuZChKU09OLnN0cmluZ2lmeSh7IGFjdGlvbjogJ2dldCcgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBtZXRob2RzO1xuICAgIH0pXG4gICAgLmNvbnRyb2xsZXIoJ3NpdGhDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgcGxhbmV0RGF0YSkge1xuICAgICAgICAkc2NvcGUucGxhbmV0RGF0YSA9IHBsYW5ldERhdGE7XG4gICAgfSk7XG4iXX0=
