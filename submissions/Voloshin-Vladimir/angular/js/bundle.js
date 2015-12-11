(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.02
 * Time: 11:11
 */

var app = angular
    .module('mainSection', [
        'ngWebSocket',
        'jediPlanetServices'
    ]);

app.run(function($rootScope) {
    $rootScope._jedi = [];
    $rootScope._activeRequest;
    $rootScope._localJedi = 1;
    $rootScope._pendingRequestsCount;
    $rootScope.disableScrollUp = $rootScope.disableScrollDown = ' css-button-disabled';
});

},{}],2:[function(require,module,exports){
'use strict';

/* Directives */
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.08
 * Time: 11:11
 */

angular.module("mainSection")
    .constant("appConstants", {
        "BASE_URL":             'http://localhost:3000/dark-jedis/',
        "INITIAL_ID":           3616,
        "JEDI_MOVED_TO_PLANET": 4,
        "JEDI_POPULATE_LIST":   1,
        "JEDI_SCROLLUP":        2,
        "JEDI_SCROLLDOWN":      3,
        "ROWS_AMOUNT":          5,
        "SCROLL_PER_CLICK":     2
});
},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
'use strict';

/* Services */
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.08
 * Time: 11:11
 */

var jediPlanetServices = angular.module('jediPlanetServices', ['ngWebSocket']);

jediPlanetServices
    .factory('Planet', ['$websocket', function ($websocket) {
        var dataStream = $websocket('ws://localhost:4000');
        var collection = [];

        dataStream.onMessage(function (message) {
            var planetData = JSON.parse(message.data);
            this.scope.currentPlanet = planetData.name;

            if (this.scope._jedi !== undefined) {
                this.scope._localJedi = false;
                for (var i = 0; i < this.scope._jedi.length; i++) {
                    if (this.scope._jedi[i].homeworld.id == planetData.id) {
                        if (this.scope._jedi.length == this.scope.appConstants.ROWS_AMOUNT) {
                            this.scope._pendingRequestsCount = 0;
                            if (this.scope._activeRequest !== undefined && this.scope._activeRequest != null) {
                                this.scope._activeRequest.abort();
                            }
                            this.scope._jedi[i].style = ' red';
                            this.scope.disableScrollUp = this.scope.disableScrollDown = ' css-button-disabled';
                            this.scope._localJedi = true;
                        }
                    } else {
                        this.scope._jedi[i].style = '';
                    }
                }
                if (this.scope._localJedi) {
                    return;
                }
            }
            if (this.scope._jedi.length == this.scope.appConstants.ROWS_AMOUNT) {
                this.scope.disableScrollUp = this.scope.disableScrollDown = '';
                if (this.scope._jedi[this.scope._jedi.length - 1].apprentice === undefined) {
                    this.scope.disableScrollDown = ' css-button-disabled';
                }
                if (this.scope._jedi[0].master === undefined) {
                    this.scope.disableScrollUp = ' css-button-disabled';
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
    }])
    .factory('Common', ['$rootScope', '$http', 'appConstants', function ($scope, $http, constants) {
        var jediStore = {

            _jedi: [],
            _activeRequest: null,
            _localJedi: 1,
            _pendingRequestsCount: null,

            populateJediList: function (jediMaster) {
                this._pendingRequestsCount = constants.ROWS_AMOUNT % 2 ? Math.ceil(constants.ROWS_AMOUNT / 2) - 1 : Math.floor(constants.ROWS_AMOUNT / 2) - 1;
                this._jedi.push(jediMaster);
                this.appendApprentice(jediMaster.apprentice.url, false);
            },

            appendApprentice: function (jediMasterUrl, removeObsolete) {
                if (jediMasterUrl == null && this._pendingRequestsCount-- > 1) {
                    for (var i = constants.SCROLL_PER_CLICK; i != 0; i--) {
                        this._jedi.push({homeworld: i, name: null});
                        this._jedi.shift();
                        this._pendingRequestsCount = 0;
                    }
                    $scope.disableScrollDown = ' css-button-disabled';
                    return;
                }
                jediStore._activeRequest = $http.get(jediMasterUrl)
                    .then(function(response){
                        jediStore._jedi.push(response.data);
                        if (removeObsolete) {
                            jediStore._jedi.shift();
                        }
                        if (jediStore._pendingRequestsCount-- > 1) {
                            jediStore.appendApprentice(response.data.apprentice.url, removeObsolete);
                        } else {
                            if (jediStore._jedi.length != constants.ROWS_AMOUNT) {
                                for (var i = constants.ROWS_AMOUNT - jediStore._jedi.length; i != 0; i--) {
                                    jediStore._jedi.push({homeworld: i, name: null});
                                }
                                $scope.disableScrollUp = '';
                                $scope._jedi = jediStore._jedi;
                            }
                        }
                    });
            },

            appendMaster: function(jediMasterUrl, removeObsolete){
                if(jediMasterUrl == null && jediStore._pendingRequestsCount-- > 1) {
                    for(var i=constants.SCROLL_PER_CLICK; i != 0; i--){
                        jediStore._jedi.unshift({homeworld:i, name: null});
                        jediStore._jedi.pop();
                        jediStore._pendingRequestsCount = 0;
                    }
                    $scope.disableScrollDown = ' css-button-disabled';
                    return;
                }
                jediStore._activeRequest = $http.get(jediMasterUrl)
                    .then(function(response){
                        jediStore._jedi.unshift(response.data);
                        if(removeObsolete){
                            jediStore._jedi.pop();
                        }
                        if(jediStore._pendingRequestsCount-- > 1) {
                            jediStore.appendMaster(response.data.master.url, removeObsolete);
                        }else{
                            $scope._jedi = jediStore._jedi;
                        }
                    });
            },

            scrollJediList: function(direction){
                jediStore._pendingRequestsCount += constants.SCROLL_PER_CLICK;
                if(jediStore._pendingRequestsCount > constants.SCROLL_PER_CLICK){
                    if(jediStore.direction != direction){
                        jediStore._activeRequest.abort();
                        jediStore._pendingRequestsCount = constants.SCROLL_PER_CLICK;
                    }else{
                        return;
                    }
                }
                jediStore.direction = direction;
                if(direction){
                    jediStore.appendMaster(jediStore._jedi[0].master.url, true);
                }else{
                    jediStore.appendApprentice(jediStore._jedi[jediStore._jedi.length-1].apprentice.url, true);
                }
            }

        };

        return jediStore;
    }]);
































},{}]},{},[1,3,2,4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMvYXBwLmpzIiwianMvY29uc3RhbnRzLmpzIiwianMvY29udHJvbGxlcnMuanMiLCJqcy9zZXJ2aWNlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vKipcbiAqIFVzZXI6IFZvbG9zaGluIFZsYWRpbWlyXG4gKiBEYXRlOiAyMDE1LjEyLjAyXG4gKiBUaW1lOiAxMToxMVxuICovXG5cbnZhciBhcHAgPSBhbmd1bGFyXG4gICAgLm1vZHVsZSgnbWFpblNlY3Rpb24nLCBbXG4gICAgICAgICduZ1dlYlNvY2tldCcsXG4gICAgICAgICdqZWRpUGxhbmV0U2VydmljZXMnXG4gICAgXSk7XG5cbmFwcC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSkge1xuICAgICRyb290U2NvcGUuX2plZGkgPSBbXTtcbiAgICAkcm9vdFNjb3BlLl9hY3RpdmVSZXF1ZXN0O1xuICAgICRyb290U2NvcGUuX2xvY2FsSmVkaSA9IDE7XG4gICAgJHJvb3RTY29wZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQ7XG4gICAgJHJvb3RTY29wZS5kaXNhYmxlU2Nyb2xsVXAgPSAkcm9vdFNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBEaXJlY3RpdmVzICovXG4vKipcbiAqIFVzZXI6IFZvbG9zaGluIFZsYWRpbWlyXG4gKiBEYXRlOiAyMDE1LjEyLjA4XG4gKiBUaW1lOiAxMToxMVxuICovXG5cbmFuZ3VsYXIubW9kdWxlKFwibWFpblNlY3Rpb25cIilcbiAgICAuY29uc3RhbnQoXCJhcHBDb25zdGFudHNcIiwge1xuICAgICAgICBcIkJBU0VfVVJMXCI6ICAgICAgICAgICAgICdodHRwOi8vbG9jYWxob3N0OjMwMDAvZGFyay1qZWRpcy8nLFxuICAgICAgICBcIklOSVRJQUxfSURcIjogICAgICAgICAgIDM2MTYsXG4gICAgICAgIFwiSkVESV9NT1ZFRF9UT19QTEFORVRcIjogNCxcbiAgICAgICAgXCJKRURJX1BPUFVMQVRFX0xJU1RcIjogICAxLFxuICAgICAgICBcIkpFRElfU0NST0xMVVBcIjogICAgICAgIDIsXG4gICAgICAgIFwiSkVESV9TQ1JPTExET1dOXCI6ICAgICAgMyxcbiAgICAgICAgXCJST1dTX0FNT1VOVFwiOiAgICAgICAgICA1LFxuICAgICAgICBcIlNDUk9MTF9QRVJfQ0xJQ0tcIjogICAgIDJcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxuLyogQ29udHJvbGxlcnMgKi9cbi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDIwMTUuMTIuMDhcbiAqIFRpbWU6IDExOjExXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoJ21haW5TZWN0aW9uJylcbiAgICAuY29udHJvbGxlcignc2l0aENvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLCAnJGh0dHAnLCAnYXBwQ29uc3RhbnRzJywgJ0NvbW1vbicsIGZ1bmN0aW9uICgkc2NvcGUsICRodHRwLCBhcHBDb25zdGFudHMsICRjb21tb24pIHtcbiAgICAkaHR0cC5nZXQoYXBwQ29uc3RhbnRzLkJBU0VfVVJMICsgYXBwQ29uc3RhbnRzLklOSVRJQUxfSUQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAkY29tbW9uLnBvcHVsYXRlSmVkaUxpc3QocmVzcG9uc2UuZGF0YSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS5zY3JvbGxKZWRpTGlzdCA9IGZ1bmN0aW9uKGRpcmVjdGlvbil7XG4gICAgICAgICAgICBpZigoJHNjb3BlLmRpc2FibGVTY3JvbGxVcCAhPSAnJyAmJiBkaXJlY3Rpb24pIHx8ICgkc2NvcGUuZGlzYWJsZVNjcm9sbERvd24gIT0gJycgJiYgIWRpcmVjdGlvbikpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRjb21tb24uc2Nyb2xsSmVkaUxpc3QoZGlyZWN0aW9uKTtcbiAgICAgICAgfVxufV0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBTZXJ2aWNlcyAqL1xuLyoqXG4gKiBVc2VyOiBWb2xvc2hpbiBWbGFkaW1pclxuICogRGF0ZTogMjAxNS4xMi4wOFxuICogVGltZTogMTE6MTFcbiAqL1xuXG52YXIgamVkaVBsYW5ldFNlcnZpY2VzID0gYW5ndWxhci5tb2R1bGUoJ2plZGlQbGFuZXRTZXJ2aWNlcycsIFsnbmdXZWJTb2NrZXQnXSk7XG5cbmplZGlQbGFuZXRTZXJ2aWNlc1xuICAgIC5mYWN0b3J5KCdQbGFuZXQnLCBbJyR3ZWJzb2NrZXQnLCBmdW5jdGlvbiAoJHdlYnNvY2tldCkge1xuICAgICAgICB2YXIgZGF0YVN0cmVhbSA9ICR3ZWJzb2NrZXQoJ3dzOi8vbG9jYWxob3N0OjQwMDAnKTtcbiAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBbXTtcblxuICAgICAgICBkYXRhU3RyZWFtLm9uTWVzc2FnZShmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICAgICAgdmFyIHBsYW5ldERhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgICAgICB0aGlzLnNjb3BlLmN1cnJlbnRQbGFuZXQgPSBwbGFuZXREYXRhLm5hbWU7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnNjb3BlLl9qZWRpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLl9sb2NhbEplZGkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2NvcGUuX2plZGkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2NvcGUuX2plZGlbaV0uaG9tZXdvcmxkLmlkID09IHBsYW5ldERhdGEuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNjb3BlLl9qZWRpLmxlbmd0aCA9PSB0aGlzLnNjb3BlLmFwcENvbnN0YW50cy5ST1dTX0FNT1VOVCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zY29wZS5fYWN0aXZlUmVxdWVzdCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuc2NvcGUuX2FjdGl2ZVJlcXVlc3QgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLl9hY3RpdmVSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuX2plZGlbaV0uc3R5bGUgPSAnIHJlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5kaXNhYmxlU2Nyb2xsVXAgPSB0aGlzLnNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLl9sb2NhbEplZGkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5famVkaVtpXS5zdHlsZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNjb3BlLl9sb2NhbEplZGkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnNjb3BlLl9qZWRpLmxlbmd0aCA9PSB0aGlzLnNjb3BlLmFwcENvbnN0YW50cy5ST1dTX0FNT1VOVCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuZGlzYWJsZVNjcm9sbFVwID0gdGhpcy5zY29wZS5kaXNhYmxlU2Nyb2xsRG93biA9ICcnO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNjb3BlLl9qZWRpW3RoaXMuc2NvcGUuX2plZGkubGVuZ3RoIC0gMV0uYXBwcmVudGljZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuZGlzYWJsZVNjcm9sbERvd24gPSAnIGNzcy1idXR0b24tZGlzYWJsZWQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zY29wZS5famVkaVswXS5tYXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLmRpc2FibGVTY3JvbGxVcCA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgbWV0aG9kcyA9IHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb24sXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkYXRhU3RyZWFtLnNlbmQoSlNPTi5zdHJpbmdpZnkoe2FjdGlvbjogJ2dldCd9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG1ldGhvZHM7XG4gICAgfV0pXG4gICAgLmZhY3RvcnkoJ0NvbW1vbicsIFsnJHJvb3RTY29wZScsICckaHR0cCcsICdhcHBDb25zdGFudHMnLCBmdW5jdGlvbiAoJHNjb3BlLCAkaHR0cCwgY29uc3RhbnRzKSB7XG4gICAgICAgIHZhciBqZWRpU3RvcmUgPSB7XG5cbiAgICAgICAgICAgIF9qZWRpOiBbXSxcbiAgICAgICAgICAgIF9hY3RpdmVSZXF1ZXN0OiBudWxsLFxuICAgICAgICAgICAgX2xvY2FsSmVkaTogMSxcbiAgICAgICAgICAgIF9wZW5kaW5nUmVxdWVzdHNDb3VudDogbnVsbCxcblxuICAgICAgICAgICAgcG9wdWxhdGVKZWRpTGlzdDogZnVuY3Rpb24gKGplZGlNYXN0ZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA9IGNvbnN0YW50cy5ST1dTX0FNT1VOVCAlIDIgPyBNYXRoLmNlaWwoY29uc3RhbnRzLlJPV1NfQU1PVU5UIC8gMikgLSAxIDogTWF0aC5mbG9vcihjb25zdGFudHMuUk9XU19BTU9VTlQgLyAyKSAtIDE7XG4gICAgICAgICAgICAgICAgdGhpcy5famVkaS5wdXNoKGplZGlNYXN0ZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kQXBwcmVudGljZShqZWRpTWFzdGVyLmFwcHJlbnRpY2UudXJsLCBmYWxzZSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBhcHBlbmRBcHByZW50aWNlOiBmdW5jdGlvbiAoamVkaU1hc3RlclVybCwgcmVtb3ZlT2Jzb2xldGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoamVkaU1hc3RlclVybCA9PSBudWxsICYmIHRoaXMuX3BlbmRpbmdSZXF1ZXN0c0NvdW50LS0gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBjb25zdGFudHMuU0NST0xMX1BFUl9DTElDSzsgaSAhPSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2plZGkucHVzaCh7aG9tZXdvcmxkOiBpLCBuYW1lOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9qZWRpLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2FjdGl2ZVJlcXVlc3QgPSAkaHR0cC5nZXQoamVkaU1hc3RlclVybClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9qZWRpLnB1c2gocmVzcG9uc2UuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlT2Jzb2xldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqZWRpU3RvcmUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50LS0gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLmFwcGVuZEFwcHJlbnRpY2UocmVzcG9uc2UuZGF0YS5hcHByZW50aWNlLnVybCwgcmVtb3ZlT2Jzb2xldGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoamVkaVN0b3JlLl9qZWRpLmxlbmd0aCAhPSBjb25zdGFudHMuUk9XU19BTU9VTlQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IGNvbnN0YW50cy5ST1dTX0FNT1VOVCAtIGplZGlTdG9yZS5famVkaS5sZW5ndGg7IGkgIT0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkucHVzaCh7aG9tZXdvcmxkOiBpLCBuYW1lOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc2FibGVTY3JvbGxVcCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuX2plZGkgPSBqZWRpU3RvcmUuX2plZGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGFwcGVuZE1hc3RlcjogZnVuY3Rpb24oamVkaU1hc3RlclVybCwgcmVtb3ZlT2Jzb2xldGUpe1xuICAgICAgICAgICAgICAgIGlmKGplZGlNYXN0ZXJVcmwgPT0gbnVsbCAmJiBqZWRpU3RvcmUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50LS0gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaT1jb25zdGFudHMuU0NST0xMX1BFUl9DTElDSzsgaSAhPSAwOyBpLS0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9qZWRpLnVuc2hpZnQoe2hvbWV3b3JsZDppLCBuYW1lOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzYWJsZVNjcm9sbERvd24gPSAnIGNzcy1idXR0b24tZGlzYWJsZWQnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGplZGlTdG9yZS5fYWN0aXZlUmVxdWVzdCA9ICRodHRwLmdldChqZWRpTWFzdGVyVXJsKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkudW5zaGlmdChyZXNwb25zZS5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlbW92ZU9ic29sZXRlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihqZWRpU3RvcmUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50LS0gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLmFwcGVuZE1hc3RlcihyZXNwb25zZS5kYXRhLm1hc3Rlci51cmwsIHJlbW92ZU9ic29sZXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5famVkaSA9IGplZGlTdG9yZS5famVkaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBzY3JvbGxKZWRpTGlzdDogZnVuY3Rpb24oZGlyZWN0aW9uKXtcbiAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ICs9IGNvbnN0YW50cy5TQ1JPTExfUEVSX0NMSUNLO1xuICAgICAgICAgICAgICAgIGlmKGplZGlTdG9yZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQgPiBjb25zdGFudHMuU0NST0xMX1BFUl9DTElDSyl7XG4gICAgICAgICAgICAgICAgICAgIGlmKGplZGlTdG9yZS5kaXJlY3Rpb24gIT0gZGlyZWN0aW9uKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5fYWN0aXZlUmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA9IGNvbnN0YW50cy5TQ1JPTExfUEVSX0NMSUNLO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBqZWRpU3RvcmUuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgICAgICAgICAgICAgIGlmKGRpcmVjdGlvbil7XG4gICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5hcHBlbmRNYXN0ZXIoamVkaVN0b3JlLl9qZWRpWzBdLm1hc3Rlci51cmwsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuYXBwZW5kQXBwcmVudGljZShqZWRpU3RvcmUuX2plZGlbamVkaVN0b3JlLl9qZWRpLmxlbmd0aC0xXS5hcHByZW50aWNlLnVybCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGplZGlTdG9yZTtcbiAgICB9XSk7XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiJdfQ==
