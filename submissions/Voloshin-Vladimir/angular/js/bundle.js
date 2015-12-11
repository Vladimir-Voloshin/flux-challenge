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
    .controller('sithController', ['$rootScope', '$http', 'appConstants', 'Common', 'Planet', function ($scope, $http, appConstants, $common, planet) {
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

angular.module("mainSection")
    .factory('Planet', ['$websocket', 'appConstants', function ($websocket, constants) {
        var dataStream = $websocket('ws://localhost:4000');
        var collection = [];

        dataStream.onMessage(function (message) {
            var planetData = JSON.parse(message.data);
            this.scope.currentPlanet = planetData.name;

            if (this.scope._jedi !== undefined) {
                this.scope._localJedi = false;
                for (var i = 0; i < this.scope._jedi.length; i++) {
                    if (this.scope._jedi[i].homeworld.id == planetData.id) {
                        if (this.scope._jedi.length == constants.ROWS_AMOUNT) {
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
            if (this.scope._jedi.length == constants.ROWS_AMOUNT) {
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

jediPlanetServices
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMvYXBwLmpzIiwianMvY29uc3RhbnRzLmpzIiwianMvY29udHJvbGxlcnMuanMiLCJqcy9zZXJ2aWNlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuLyoqXG4gKiBVc2VyOiBWb2xvc2hpbiBWbGFkaW1pclxuICogRGF0ZTogMjAxNS4xMi4wMlxuICogVGltZTogMTE6MTFcbiAqL1xuXG52YXIgYXBwID0gYW5ndWxhclxuICAgIC5tb2R1bGUoJ21haW5TZWN0aW9uJywgW1xuICAgICAgICAnbmdXZWJTb2NrZXQnLFxuICAgICAgICAnamVkaVBsYW5ldFNlcnZpY2VzJ1xuICAgIF0pO1xuXG5hcHAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpIHtcbiAgICAkcm9vdFNjb3BlLl9qZWRpID0gW107XG4gICAgJHJvb3RTY29wZS5fYWN0aXZlUmVxdWVzdDtcbiAgICAkcm9vdFNjb3BlLl9sb2NhbEplZGkgPSAxO1xuICAgICRyb290U2NvcGUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50O1xuICAgICRyb290U2NvcGUuZGlzYWJsZVNjcm9sbFVwID0gJHJvb3RTY29wZS5kaXNhYmxlU2Nyb2xsRG93biA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyogRGlyZWN0aXZlcyAqL1xuLyoqXG4gKiBVc2VyOiBWb2xvc2hpbiBWbGFkaW1pclxuICogRGF0ZTogMjAxNS4xMi4wOFxuICogVGltZTogMTE6MTFcbiAqL1xuXG5hbmd1bGFyLm1vZHVsZShcIm1haW5TZWN0aW9uXCIpXG4gICAgLmNvbnN0YW50KFwiYXBwQ29uc3RhbnRzXCIsIHtcbiAgICAgICAgXCJCQVNFX1VSTFwiOiAgICAgICAgICAgICAnaHR0cDovL2xvY2FsaG9zdDozMDAwL2RhcmstamVkaXMvJyxcbiAgICAgICAgXCJJTklUSUFMX0lEXCI6ICAgICAgICAgICAzNjE2LFxuICAgICAgICBcIkpFRElfTU9WRURfVE9fUExBTkVUXCI6IDQsXG4gICAgICAgIFwiSkVESV9QT1BVTEFURV9MSVNUXCI6ICAgMSxcbiAgICAgICAgXCJKRURJX1NDUk9MTFVQXCI6ICAgICAgICAyLFxuICAgICAgICBcIkpFRElfU0NST0xMRE9XTlwiOiAgICAgIDMsXG4gICAgICAgIFwiUk9XU19BTU9VTlRcIjogICAgICAgICAgNSxcbiAgICAgICAgXCJTQ1JPTExfUEVSX0NMSUNLXCI6ICAgICAyXG59KTsiLCIndXNlIHN0cmljdCc7XG5cbi8qIENvbnRyb2xsZXJzICovXG4vKipcbiAqIFVzZXI6IFZvbG9zaGluIFZsYWRpbWlyXG4gKiBEYXRlOiAyMDE1LjEyLjA4XG4gKiBUaW1lOiAxMToxMVxuICovXG5cbmFuZ3VsYXIubW9kdWxlKCdtYWluU2VjdGlvbicpXG4gICAgLmNvbnRyb2xsZXIoJ3NpdGhDb250cm9sbGVyJywgWyckcm9vdFNjb3BlJywgJyRodHRwJywgJ2FwcENvbnN0YW50cycsICdDb21tb24nLCAnUGxhbmV0JywgZnVuY3Rpb24gKCRzY29wZSwgJGh0dHAsIGFwcENvbnN0YW50cywgJGNvbW1vbiwgcGxhbmV0KSB7XG4gICAgJGh0dHAuZ2V0KGFwcENvbnN0YW50cy5CQVNFX1VSTCArIGFwcENvbnN0YW50cy5JTklUSUFMX0lEKVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgJGNvbW1vbi5wb3B1bGF0ZUplZGlMaXN0KHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuc2Nyb2xsSmVkaUxpc3QgPSBmdW5jdGlvbihkaXJlY3Rpb24pe1xuICAgICAgICAgICAgaWYoKCRzY29wZS5kaXNhYmxlU2Nyb2xsVXAgIT0gJycgJiYgZGlyZWN0aW9uKSB8fCAoJHNjb3BlLmRpc2FibGVTY3JvbGxEb3duICE9ICcnICYmICFkaXJlY3Rpb24pKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygxKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkY29tbW9uLnNjcm9sbEplZGlMaXN0KGRpcmVjdGlvbik7XG4gICAgICAgIH1cbn1dKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyogU2VydmljZXMgKi9cbi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDIwMTUuMTIuMDhcbiAqIFRpbWU6IDExOjExXG4gKi9cblxudmFyIGplZGlQbGFuZXRTZXJ2aWNlcyA9IGFuZ3VsYXIubW9kdWxlKCdqZWRpUGxhbmV0U2VydmljZXMnLCBbJ25nV2ViU29ja2V0J10pO1xuXG5hbmd1bGFyLm1vZHVsZShcIm1haW5TZWN0aW9uXCIpXG4gICAgLmZhY3RvcnkoJ1BsYW5ldCcsIFsnJHdlYnNvY2tldCcsICdhcHBDb25zdGFudHMnLCBmdW5jdGlvbiAoJHdlYnNvY2tldCwgY29uc3RhbnRzKSB7XG4gICAgICAgIHZhciBkYXRhU3RyZWFtID0gJHdlYnNvY2tldCgnd3M6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuICAgICAgICB2YXIgY29sbGVjdGlvbiA9IFtdO1xuXG4gICAgICAgIGRhdGFTdHJlYW0ub25NZXNzYWdlKGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgICAgICAgICB2YXIgcGxhbmV0RGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKTtcbiAgICAgICAgICAgIHRoaXMuc2NvcGUuY3VycmVudFBsYW5ldCA9IHBsYW5ldERhdGEubmFtZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuc2NvcGUuX2plZGkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuX2xvY2FsSmVkaSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zY29wZS5famVkaS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zY29wZS5famVkaVtpXS5ob21ld29ybGQuaWQgPT0gcGxhbmV0RGF0YS5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2NvcGUuX2plZGkubGVuZ3RoID09IGNvbnN0YW50cy5ST1dTX0FNT1VOVCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zY29wZS5fYWN0aXZlUmVxdWVzdCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuc2NvcGUuX2FjdGl2ZVJlcXVlc3QgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLl9hY3RpdmVSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuX2plZGlbaV0uc3R5bGUgPSAnIHJlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5kaXNhYmxlU2Nyb2xsVXAgPSB0aGlzLnNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLl9sb2NhbEplZGkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5famVkaVtpXS5zdHlsZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNjb3BlLl9sb2NhbEplZGkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnNjb3BlLl9qZWRpLmxlbmd0aCA9PSBjb25zdGFudHMuUk9XU19BTU9VTlQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLmRpc2FibGVTY3JvbGxVcCA9IHRoaXMuc2NvcGUuZGlzYWJsZVNjcm9sbERvd24gPSAnJztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zY29wZS5famVkaVt0aGlzLnNjb3BlLl9qZWRpLmxlbmd0aCAtIDFdLmFwcHJlbnRpY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2NvcGUuX2plZGlbMF0ubWFzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5kaXNhYmxlU2Nyb2xsVXAgPSAnIGNzcy1idXR0b24tZGlzYWJsZWQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIG1ldGhvZHMgPSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZGF0YVN0cmVhbS5zZW5kKEpTT04uc3RyaW5naWZ5KHthY3Rpb246ICdnZXQnfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBtZXRob2RzO1xuICAgIH1dKVxuXG5qZWRpUGxhbmV0U2VydmljZXNcbiAgICAuZmFjdG9yeSgnQ29tbW9uJywgWyckcm9vdFNjb3BlJywgJyRodHRwJywgJ2FwcENvbnN0YW50cycsIGZ1bmN0aW9uICgkc2NvcGUsICRodHRwLCBjb25zdGFudHMpIHtcbiAgICAgICAgdmFyIGplZGlTdG9yZSA9IHtcblxuICAgICAgICAgICAgX2plZGk6IFtdLFxuICAgICAgICAgICAgX2FjdGl2ZVJlcXVlc3Q6IG51bGwsXG4gICAgICAgICAgICBfbG9jYWxKZWRpOiAxLFxuICAgICAgICAgICAgX3BlbmRpbmdSZXF1ZXN0c0NvdW50OiBudWxsLFxuXG4gICAgICAgICAgICBwb3B1bGF0ZUplZGlMaXN0OiBmdW5jdGlvbiAoamVkaU1hc3Rlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ID0gY29uc3RhbnRzLlJPV1NfQU1PVU5UICUgMiA/IE1hdGguY2VpbChjb25zdGFudHMuUk9XU19BTU9VTlQgLyAyKSAtIDEgOiBNYXRoLmZsb29yKGNvbnN0YW50cy5ST1dTX0FNT1VOVCAvIDIpIC0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLl9qZWRpLnB1c2goamVkaU1hc3Rlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRBcHByZW50aWNlKGplZGlNYXN0ZXIuYXBwcmVudGljZS51cmwsIGZhbHNlKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGFwcGVuZEFwcHJlbnRpY2U6IGZ1bmN0aW9uIChqZWRpTWFzdGVyVXJsLCByZW1vdmVPYnNvbGV0ZSkge1xuICAgICAgICAgICAgICAgIGlmIChqZWRpTWFzdGVyVXJsID09IG51bGwgJiYgdGhpcy5fcGVuZGluZ1JlcXVlc3RzQ291bnQtLSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IGNvbnN0YW50cy5TQ1JPTExfUEVSX0NMSUNLOyBpICE9IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5famVkaS5wdXNoKHtob21ld29ybGQ6IGksIG5hbWU6IG51bGx9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2plZGkuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzYWJsZVNjcm9sbERvd24gPSAnIGNzcy1idXR0b24tZGlzYWJsZWQnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGplZGlTdG9yZS5fYWN0aXZlUmVxdWVzdCA9ICRodHRwLmdldChqZWRpTWFzdGVyVXJsKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkucHVzaChyZXNwb25zZS5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVPYnNvbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5famVkaS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGplZGlTdG9yZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQtLSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuYXBwZW5kQXBwcmVudGljZShyZXNwb25zZS5kYXRhLmFwcHJlbnRpY2UudXJsLCByZW1vdmVPYnNvbGV0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqZWRpU3RvcmUuX2plZGkubGVuZ3RoICE9IGNvbnN0YW50cy5ST1dTX0FNT1VOVCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gY29uc3RhbnRzLlJPV1NfQU1PVU5UIC0gamVkaVN0b3JlLl9qZWRpLmxlbmd0aDsgaSAhPSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5famVkaS5wdXNoKHtob21ld29ybGQ6IGksIG5hbWU6IG51bGx9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzYWJsZVNjcm9sbFVwID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5famVkaSA9IGplZGlTdG9yZS5famVkaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgYXBwZW5kTWFzdGVyOiBmdW5jdGlvbihqZWRpTWFzdGVyVXJsLCByZW1vdmVPYnNvbGV0ZSl7XG4gICAgICAgICAgICAgICAgaWYoamVkaU1hc3RlclVybCA9PSBudWxsICYmIGplZGlTdG9yZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQtLSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpPWNvbnN0YW50cy5TQ1JPTExfUEVSX0NMSUNLOyBpICE9IDA7IGktLSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkudW5zaGlmdCh7aG9tZXdvcmxkOmksIG5hbWU6IG51bGx9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5famVkaS5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kaXNhYmxlU2Nyb2xsRG93biA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgamVkaVN0b3JlLl9hY3RpdmVSZXF1ZXN0ID0gJGh0dHAuZ2V0KGplZGlNYXN0ZXJVcmwpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5famVkaS51bnNoaWZ0KHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVtb3ZlT2Jzb2xldGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5famVkaS5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGplZGlTdG9yZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQtLSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuYXBwZW5kTWFzdGVyKHJlc3BvbnNlLmRhdGEubWFzdGVyLnVybCwgcmVtb3ZlT2Jzb2xldGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLl9qZWRpID0gamVkaVN0b3JlLl9qZWRpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNjcm9sbEplZGlMaXN0OiBmdW5jdGlvbihkaXJlY3Rpb24pe1xuICAgICAgICAgICAgICAgIGplZGlTdG9yZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQgKz0gY29uc3RhbnRzLlNDUk9MTF9QRVJfQ0xJQ0s7XG4gICAgICAgICAgICAgICAgaWYoamVkaVN0b3JlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA+IGNvbnN0YW50cy5TQ1JPTExfUEVSX0NMSUNLKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoamVkaVN0b3JlLmRpcmVjdGlvbiAhPSBkaXJlY3Rpb24pe1xuICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9hY3RpdmVSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ID0gY29uc3RhbnRzLlNDUk9MTF9QRVJfQ0xJQ0s7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGplZGlTdG9yZS5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgICAgICAgICAgICAgaWYoZGlyZWN0aW9uKXtcbiAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLmFwcGVuZE1hc3RlcihqZWRpU3RvcmUuX2plZGlbMF0ubWFzdGVyLnVybCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5hcHBlbmRBcHByZW50aWNlKGplZGlTdG9yZS5famVkaVtqZWRpU3RvcmUuX2plZGkubGVuZ3RoLTFdLmFwcHJlbnRpY2UudXJsLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gamVkaVN0b3JlO1xuICAgIH1dKTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuIl19
