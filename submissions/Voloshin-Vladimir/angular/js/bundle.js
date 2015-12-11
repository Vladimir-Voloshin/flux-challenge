(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.02
 * Time: 11:11
 */

var app = angular
    .module('mainSection', [
        'ngWebSocket'
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

angular.module("mainSection")
    .controller('sithController', ['$rootScope', '$http', 'appConstants', 'jediStore', 'currentPlanet', function ($scope, $http, appConstants, jediStore, currentPlanet) {
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

},{}],4:[function(require,module,exports){
'use strict';

/* Services */
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.08
 * Time: 11:11
 */

angular.module("mainSection")
    .factory('currentPlanet', ['$q', '$websocket', 'appConstants', 'jediStore', function ($q, $websocket, constants, jediStore) {
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
                            jediStore.disableScrollUp = jediStore.disableScrollDown = ' css-button-disabled';
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
                jediStore.disableScrollUp = jediStore.disableScrollDown = '';
                if (jediStore._jedi[jediStore._jedi.length - 1].apprentice === undefined) {
                    jediStore.disableScrollDown = ' css-button-disabled';
                }
                if (jediStore._jedi[0].master === undefined) {
                    jediStore.disableScrollUp = ' css-button-disabled';
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
































},{}],5:[function(require,module,exports){
'use strict';

/* Services */
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.08
 * Time: 11:11
 */

angular.module("mainSection")
    .factory('jediStore', ['$q', '$rootScope', '$http', 'appConstants', function ($q, $scope, $http, constants) {
        var jediStore = {

            _jedi: [],
            _activeRequest: null,
            _localJedi: 1,
            _pendingRequestsCount: null,
            _canceller: $q.defer(),

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
                jediStore._activeRequest = $http.get(jediMasterUrl, {timeout: jediStore._canceller.promise})
                    .then(function(response){
                        $scope.disableScrollUp = '';
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
                jediStore._activeRequest = $http.get(jediMasterUrl, {timeout: jediStore._canceller.promise})
                    .then(function(response){
                        $scope.disableScrollDown = '';
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
                        jediStore._canceller.resolve();
                        jediStore._canceller = $q.defer();
                        jediStore._pendingRequestsCount = constants.SCROLL_PER_CLICK;
                        if(jediStore._jedi[0].name == null)
                        {
                            $scope.disableScrollUp = ' css-button-disabled';
                        }
                        if(jediStore._jedi[jediStore._jedi.length-1].name == null)
                        {
                            $scope.disableScrollDown = ' css-button-disabled';
                        }
                    }else{
                        return;
                    }
                }
                jediStore.direction = direction;
                if(direction && jediStore._jedi[0].name != null){
                    jediStore.appendMaster(jediStore._jedi[0].master.url, true);
                }else if(jediStore._jedi[jediStore._jedi.length-1].name != null){
                    jediStore.appendApprentice(jediStore._jedi[jediStore._jedi.length-1].apprentice.url, true);
                }

            }
        };

        return jediStore;
    }]);
































},{}]},{},[1,4,3,2,5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMvYXBwLmpzIiwianMvY29uc3RhbnRzLmpzIiwianMvY29udHJvbGxlcnMuanMiLCJqcy9jdXJyZW50UGxhbmV0LmpzIiwianMvamVkaVN0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuLyoqXG4gKiBVc2VyOiBWb2xvc2hpbiBWbGFkaW1pclxuICogRGF0ZTogMjAxNS4xMi4wMlxuICogVGltZTogMTE6MTFcbiAqL1xuXG52YXIgYXBwID0gYW5ndWxhclxuICAgIC5tb2R1bGUoJ21haW5TZWN0aW9uJywgW1xuICAgICAgICAnbmdXZWJTb2NrZXQnXG4gICAgXSk7XG5cbmFwcC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSkge1xuICAgICRyb290U2NvcGUuX2plZGkgPSBbXTtcbiAgICAkcm9vdFNjb3BlLl9hY3RpdmVSZXF1ZXN0O1xuICAgICRyb290U2NvcGUuX2xvY2FsSmVkaSA9IDE7XG4gICAgJHJvb3RTY29wZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQ7XG4gICAgJHJvb3RTY29wZS5kaXNhYmxlU2Nyb2xsVXAgPSAkcm9vdFNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBEaXJlY3RpdmVzICovXG4vKipcbiAqIFVzZXI6IFZvbG9zaGluIFZsYWRpbWlyXG4gKiBEYXRlOiAyMDE1LjEyLjA4XG4gKiBUaW1lOiAxMToxMVxuICovXG5cbmFuZ3VsYXIubW9kdWxlKFwibWFpblNlY3Rpb25cIilcbiAgICAuY29uc3RhbnQoXCJhcHBDb25zdGFudHNcIiwge1xuICAgICAgICBcIkJBU0VfVVJMXCI6ICAgICAgICAgICAgICdodHRwOi8vbG9jYWxob3N0OjMwMDAvZGFyay1qZWRpcy8nLFxuICAgICAgICBcIklOSVRJQUxfSURcIjogICAgICAgICAgIDM2MTYsXG4gICAgICAgIFwiSkVESV9NT1ZFRF9UT19QTEFORVRcIjogNCxcbiAgICAgICAgXCJKRURJX1BPUFVMQVRFX0xJU1RcIjogICAxLFxuICAgICAgICBcIkpFRElfU0NST0xMVVBcIjogICAgICAgIDIsXG4gICAgICAgIFwiSkVESV9TQ1JPTExET1dOXCI6ICAgICAgMyxcbiAgICAgICAgXCJST1dTX0FNT1VOVFwiOiAgICAgICAgICA1LFxuICAgICAgICBcIlNDUk9MTF9QRVJfQ0xJQ0tcIjogICAgIDJcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxuLyogQ29udHJvbGxlcnMgKi9cbi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDIwMTUuMTIuMDhcbiAqIFRpbWU6IDExOjExXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoXCJtYWluU2VjdGlvblwiKVxuICAgIC5jb250cm9sbGVyKCdzaXRoQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsICckaHR0cCcsICdhcHBDb25zdGFudHMnLCAnamVkaVN0b3JlJywgJ2N1cnJlbnRQbGFuZXQnLCBmdW5jdGlvbiAoJHNjb3BlLCAkaHR0cCwgYXBwQ29uc3RhbnRzLCBqZWRpU3RvcmUsIGN1cnJlbnRQbGFuZXQpIHtcbiAgICAkaHR0cC5nZXQoYXBwQ29uc3RhbnRzLkJBU0VfVVJMICsgYXBwQ29uc3RhbnRzLklOSVRJQUxfSUQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBqZWRpU3RvcmUucG9wdWxhdGVKZWRpTGlzdChyZXNwb25zZS5kYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLnNjcm9sbEplZGlMaXN0ID0gZnVuY3Rpb24oZGlyZWN0aW9uKXtcbiAgICAgICAgICAgIGlmKCgkc2NvcGUuZGlzYWJsZVNjcm9sbFVwICE9ICcnICYmIGRpcmVjdGlvbikgfHwgKCRzY29wZS5kaXNhYmxlU2Nyb2xsRG93biAhPSAnJyAmJiAhZGlyZWN0aW9uKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgamVkaVN0b3JlLnNjcm9sbEplZGlMaXN0KGRpcmVjdGlvbik7XG4gICAgICAgIH1cbn1dKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyogU2VydmljZXMgKi9cbi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDIwMTUuMTIuMDhcbiAqIFRpbWU6IDExOjExXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoXCJtYWluU2VjdGlvblwiKVxuICAgIC5mYWN0b3J5KCdjdXJyZW50UGxhbmV0JywgWyckcScsICckd2Vic29ja2V0JywgJ2FwcENvbnN0YW50cycsICdqZWRpU3RvcmUnLCBmdW5jdGlvbiAoJHEsICR3ZWJzb2NrZXQsIGNvbnN0YW50cywgamVkaVN0b3JlKSB7XG4gICAgICAgIHZhciBkYXRhU3RyZWFtID0gJHdlYnNvY2tldCgnd3M6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuICAgICAgICB2YXIgY29sbGVjdGlvbiA9IFtdO1xuXG4gICAgICAgIGRhdGFTdHJlYW0ub25NZXNzYWdlKGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgICAgICAgICB2YXIgcGxhbmV0RGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKTtcbiAgICAgICAgICAgIHRoaXMuc2NvcGUuY3VycmVudFBsYW5ldCA9IHBsYW5ldERhdGEubmFtZTtcblxuICAgICAgICAgICAgaWYgKGplZGlTdG9yZS5famVkaSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgamVkaVN0b3JlLl9sb2NhbEplZGkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGplZGlTdG9yZS5famVkaS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoamVkaVN0b3JlLl9qZWRpW2ldLmhvbWV3b3JsZC5pZCA9PSBwbGFuZXREYXRhLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoamVkaVN0b3JlLl9qZWRpLmxlbmd0aCA9PSBjb25zdGFudHMuUk9XU19BTU9VTlQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoamVkaVN0b3JlLl9hY3RpdmVSZXF1ZXN0ICE9PSB1bmRlZmluZWQgJiYgamVkaVN0b3JlLl9hY3RpdmVSZXF1ZXN0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9jYW5jZWxsZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2NhbmNlbGxlciA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5famVkaVtpXS5zdHlsZSA9ICcgcmVkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuZGlzYWJsZVNjcm9sbFVwID0gamVkaVN0b3JlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2xvY2FsSmVkaSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGlbaV0uc3R5bGUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoamVkaVN0b3JlLl9sb2NhbEplZGkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChqZWRpU3RvcmUuX2plZGkubGVuZ3RoID09IGNvbnN0YW50cy5ST1dTX0FNT1VOVCkge1xuICAgICAgICAgICAgICAgIGplZGlTdG9yZS5kaXNhYmxlU2Nyb2xsVXAgPSBqZWRpU3RvcmUuZGlzYWJsZVNjcm9sbERvd24gPSAnJztcbiAgICAgICAgICAgICAgICBpZiAoamVkaVN0b3JlLl9qZWRpW2plZGlTdG9yZS5famVkaS5sZW5ndGggLSAxXS5hcHByZW50aWNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGplZGlTdG9yZS5famVkaVswXS5tYXN0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuZGlzYWJsZVNjcm9sbFVwID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBtZXRob2RzID0ge1xuICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRhdGFTdHJlYW0uc2VuZChKU09OLnN0cmluZ2lmeSh7YWN0aW9uOiAnZ2V0J30pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbWV0aG9kcztcbiAgICB9XSk7XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiIsIid1c2Ugc3RyaWN0JztcblxuLyogU2VydmljZXMgKi9cbi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDIwMTUuMTIuMDhcbiAqIFRpbWU6IDExOjExXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoXCJtYWluU2VjdGlvblwiKVxuICAgIC5mYWN0b3J5KCdqZWRpU3RvcmUnLCBbJyRxJywgJyRyb290U2NvcGUnLCAnJGh0dHAnLCAnYXBwQ29uc3RhbnRzJywgZnVuY3Rpb24gKCRxLCAkc2NvcGUsICRodHRwLCBjb25zdGFudHMpIHtcbiAgICAgICAgdmFyIGplZGlTdG9yZSA9IHtcblxuICAgICAgICAgICAgX2plZGk6IFtdLFxuICAgICAgICAgICAgX2FjdGl2ZVJlcXVlc3Q6IG51bGwsXG4gICAgICAgICAgICBfbG9jYWxKZWRpOiAxLFxuICAgICAgICAgICAgX3BlbmRpbmdSZXF1ZXN0c0NvdW50OiBudWxsLFxuICAgICAgICAgICAgX2NhbmNlbGxlcjogJHEuZGVmZXIoKSxcblxuICAgICAgICAgICAgcG9wdWxhdGVKZWRpTGlzdDogZnVuY3Rpb24gKGplZGlNYXN0ZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA9IGNvbnN0YW50cy5ST1dTX0FNT1VOVCAlIDIgPyBNYXRoLmNlaWwoY29uc3RhbnRzLlJPV1NfQU1PVU5UIC8gMikgLSAxIDogTWF0aC5mbG9vcihjb25zdGFudHMuUk9XU19BTU9VTlQgLyAyKSAtIDE7XG4gICAgICAgICAgICAgICAgdGhpcy5famVkaS5wdXNoKGplZGlNYXN0ZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kQXBwcmVudGljZShqZWRpTWFzdGVyLmFwcHJlbnRpY2UudXJsLCBmYWxzZSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBhcHBlbmRBcHByZW50aWNlOiBmdW5jdGlvbiAoamVkaU1hc3RlclVybCwgcmVtb3ZlT2Jzb2xldGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoamVkaU1hc3RlclVybCA9PSBudWxsICYmIHRoaXMuX3BlbmRpbmdSZXF1ZXN0c0NvdW50LS0gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBjb25zdGFudHMuU0NST0xMX1BFUl9DTElDSzsgaSAhPSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2plZGkucHVzaCh7aG9tZXdvcmxkOiBpLCBuYW1lOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9qZWRpLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2FjdGl2ZVJlcXVlc3QgPSAkaHR0cC5nZXQoamVkaU1hc3RlclVybCwge3RpbWVvdXQ6IGplZGlTdG9yZS5fY2FuY2VsbGVyLnByb21pc2V9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzYWJsZVNjcm9sbFVwID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkucHVzaChyZXNwb25zZS5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1vdmVPYnNvbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5famVkaS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGplZGlTdG9yZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQtLSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuYXBwZW5kQXBwcmVudGljZShyZXNwb25zZS5kYXRhLmFwcHJlbnRpY2UudXJsLCByZW1vdmVPYnNvbGV0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqZWRpU3RvcmUuX2plZGkubGVuZ3RoICE9IGNvbnN0YW50cy5ST1dTX0FNT1VOVCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gY29uc3RhbnRzLlJPV1NfQU1PVU5UIC0gamVkaVN0b3JlLl9qZWRpLmxlbmd0aDsgaSAhPSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5famVkaS5wdXNoKHtob21ld29ybGQ6IGksIG5hbWU6IG51bGx9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzYWJsZVNjcm9sbFVwID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5famVkaSA9IGplZGlTdG9yZS5famVkaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgYXBwZW5kTWFzdGVyOiBmdW5jdGlvbihqZWRpTWFzdGVyVXJsLCByZW1vdmVPYnNvbGV0ZSl7XG4gICAgICAgICAgICAgICAgaWYoamVkaU1hc3RlclVybCA9PSBudWxsICYmIGplZGlTdG9yZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQtLSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpPWNvbnN0YW50cy5TQ1JPTExfUEVSX0NMSUNLOyBpICE9IDA7IGktLSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkudW5zaGlmdCh7aG9tZXdvcmxkOmksIG5hbWU6IG51bGx9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5famVkaS5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kaXNhYmxlU2Nyb2xsRG93biA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgamVkaVN0b3JlLl9hY3RpdmVSZXF1ZXN0ID0gJGh0dHAuZ2V0KGplZGlNYXN0ZXJVcmwsIHt0aW1lb3V0OiBqZWRpU3RvcmUuX2NhbmNlbGxlci5wcm9taXNlfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkudW5zaGlmdChyZXNwb25zZS5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlbW92ZU9ic29sZXRlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihqZWRpU3RvcmUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50LS0gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLmFwcGVuZE1hc3RlcihyZXNwb25zZS5kYXRhLm1hc3Rlci51cmwsIHJlbW92ZU9ic29sZXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5famVkaSA9IGplZGlTdG9yZS5famVkaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBzY3JvbGxKZWRpTGlzdDogZnVuY3Rpb24oZGlyZWN0aW9uKXtcbiAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ICs9IGNvbnN0YW50cy5TQ1JPTExfUEVSX0NMSUNLO1xuICAgICAgICAgICAgICAgIGlmKGplZGlTdG9yZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQgPiBjb25zdGFudHMuU0NST0xMX1BFUl9DTElDSyl7XG4gICAgICAgICAgICAgICAgICAgIGlmKGplZGlTdG9yZS5kaXJlY3Rpb24gIT0gZGlyZWN0aW9uKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5fY2FuY2VsbGVyLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5fY2FuY2VsbGVyID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQgPSBjb25zdGFudHMuU0NST0xMX1BFUl9DTElDSztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGplZGlTdG9yZS5famVkaVswXS5uYW1lID09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc2FibGVTY3JvbGxVcCA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihqZWRpU3RvcmUuX2plZGlbamVkaVN0b3JlLl9qZWRpLmxlbmd0aC0xXS5uYW1lID09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgamVkaVN0b3JlLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICAgICAgICAgICAgICBpZihkaXJlY3Rpb24gJiYgamVkaVN0b3JlLl9qZWRpWzBdLm5hbWUgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5hcHBlbmRNYXN0ZXIoamVkaVN0b3JlLl9qZWRpWzBdLm1hc3Rlci51cmwsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1lbHNlIGlmKGplZGlTdG9yZS5famVkaVtqZWRpU3RvcmUuX2plZGkubGVuZ3RoLTFdLm5hbWUgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5hcHBlbmRBcHByZW50aWNlKGplZGlTdG9yZS5famVkaVtqZWRpU3RvcmUuX2plZGkubGVuZ3RoLTFdLmFwcHJlbnRpY2UudXJsLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gamVkaVN0b3JlO1xuICAgIH1dKTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuIl19
