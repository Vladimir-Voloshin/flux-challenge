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
    .controller('sithController', ['$rootScope', '$http', 'appConstants', 'jediStore', 'currentPlanetService', function ($scope, $http, appConstants, jediStore, currentPlanet) {
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
                    $scope.disableScrollUp = ' css-button-disabled';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMvYXBwLmpzIiwianMvY29uc3RhbnRzLmpzIiwianMvY29udHJvbGxlcnMuanMiLCJqcy9jdXJyZW50UGxhbmV0U2VydmljZS5qcyIsImpzL2plZGlTdG9yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0Jztcbi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDIwMTUuMTIuMDJcbiAqIFRpbWU6IDExOjExXG4gKi9cblxudmFyIGFwcCA9IGFuZ3VsYXJcbiAgICAubW9kdWxlKCdtYWluU2VjdGlvbicsIFtcbiAgICAgICAgJ25nV2ViU29ja2V0J1xuICAgIF0pO1xuXG5hcHAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpIHtcbiAgICAkcm9vdFNjb3BlLl9qZWRpID0gW107XG4gICAgJHJvb3RTY29wZS5fYWN0aXZlUmVxdWVzdDtcbiAgICAkcm9vdFNjb3BlLl9sb2NhbEplZGkgPSAxO1xuICAgICRyb290U2NvcGUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50O1xuICAgICRyb290U2NvcGUuZGlzYWJsZVNjcm9sbFVwID0gJHJvb3RTY29wZS5kaXNhYmxlU2Nyb2xsRG93biA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyogRGlyZWN0aXZlcyAqL1xuLyoqXG4gKiBVc2VyOiBWb2xvc2hpbiBWbGFkaW1pclxuICogRGF0ZTogMjAxNS4xMi4wOFxuICogVGltZTogMTE6MTFcbiAqL1xuXG5hbmd1bGFyLm1vZHVsZShcIm1haW5TZWN0aW9uXCIpXG4gICAgLmNvbnN0YW50KFwiYXBwQ29uc3RhbnRzXCIsIHtcbiAgICAgICAgXCJCQVNFX1VSTFwiOiAgICAgICAgICAgICAnaHR0cDovL2xvY2FsaG9zdDozMDAwL2RhcmstamVkaXMvJyxcbiAgICAgICAgXCJJTklUSUFMX0lEXCI6ICAgICAgICAgICAzNjE2LFxuICAgICAgICBcIkpFRElfTU9WRURfVE9fUExBTkVUXCI6IDQsXG4gICAgICAgIFwiSkVESV9QT1BVTEFURV9MSVNUXCI6ICAgMSxcbiAgICAgICAgXCJKRURJX1NDUk9MTFVQXCI6ICAgICAgICAyLFxuICAgICAgICBcIkpFRElfU0NST0xMRE9XTlwiOiAgICAgIDMsXG4gICAgICAgIFwiUk9XU19BTU9VTlRcIjogICAgICAgICAgNSxcbiAgICAgICAgXCJTQ1JPTExfUEVSX0NMSUNLXCI6ICAgICAyXG59KTsiLCIndXNlIHN0cmljdCc7XG5cbi8qIENvbnRyb2xsZXJzICovXG4vKipcbiAqIFVzZXI6IFZvbG9zaGluIFZsYWRpbWlyXG4gKiBEYXRlOiAyMDE1LjEyLjA4XG4gKiBUaW1lOiAxMToxMVxuICovXG5cbmFuZ3VsYXIubW9kdWxlKFwibWFpblNlY3Rpb25cIilcbiAgICAuY29udHJvbGxlcignc2l0aENvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLCAnJGh0dHAnLCAnYXBwQ29uc3RhbnRzJywgJ2plZGlTdG9yZScsICdjdXJyZW50UGxhbmV0U2VydmljZScsIGZ1bmN0aW9uICgkc2NvcGUsICRodHRwLCBhcHBDb25zdGFudHMsIGplZGlTdG9yZSwgY3VycmVudFBsYW5ldCkge1xuICAgICRodHRwLmdldChhcHBDb25zdGFudHMuQkFTRV9VUkwgKyBhcHBDb25zdGFudHMuSU5JVElBTF9JRClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGplZGlTdG9yZS5wb3B1bGF0ZUplZGlMaXN0KHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuc2Nyb2xsSmVkaUxpc3QgPSBmdW5jdGlvbihkaXJlY3Rpb24pe1xuICAgICAgICAgICAgaWYoKCRzY29wZS5kaXNhYmxlU2Nyb2xsVXAgIT0gJycgJiYgZGlyZWN0aW9uKSB8fCAoJHNjb3BlLmRpc2FibGVTY3JvbGxEb3duICE9ICcnICYmICFkaXJlY3Rpb24pKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqZWRpU3RvcmUuc2Nyb2xsSmVkaUxpc3QoZGlyZWN0aW9uKTtcbiAgICAgICAgfVxufV0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBTZXJ2aWNlcyAqL1xuLyoqXG4gKiBVc2VyOiBWb2xvc2hpbiBWbGFkaW1pclxuICogRGF0ZTogMjAxNS4xMi4wOFxuICogVGltZTogMTE6MTFcbiAqL1xuXG5hbmd1bGFyLm1vZHVsZShcIm1haW5TZWN0aW9uXCIpXG4gICAgLmZhY3RvcnkoJ2N1cnJlbnRQbGFuZXRTZXJ2aWNlJywgWyckcScsICckcm9vdFNjb3BlJywgJyR3ZWJzb2NrZXQnLCAnYXBwQ29uc3RhbnRzJywgJ2plZGlTdG9yZScsIGZ1bmN0aW9uICgkcSwgJHNjb3BlLCAkd2Vic29ja2V0LCBjb25zdGFudHMsIGplZGlTdG9yZSkge1xuICAgICAgICB2YXIgZGF0YVN0cmVhbSA9ICR3ZWJzb2NrZXQoJ3dzOi8vbG9jYWxob3N0OjQwMDAnKTtcbiAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBbXTtcblxuICAgICAgICBkYXRhU3RyZWFtLm9uTWVzc2FnZShmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICAgICAgdmFyIHBsYW5ldERhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgICAgICB0aGlzLnNjb3BlLmN1cnJlbnRQbGFuZXQgPSBwbGFuZXREYXRhLm5hbWU7XG5cbiAgICAgICAgICAgIGlmIChqZWRpU3RvcmUuX2plZGkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGplZGlTdG9yZS5fbG9jYWxKZWRpID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBqZWRpU3RvcmUuX2plZGkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGplZGlTdG9yZS5famVkaVtpXS5ob21ld29ybGQuaWQgPT0gcGxhbmV0RGF0YS5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGplZGlTdG9yZS5famVkaS5sZW5ndGggPT0gY29uc3RhbnRzLlJPV1NfQU1PVU5UKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGplZGlTdG9yZS5fYWN0aXZlUmVxdWVzdCAhPT0gdW5kZWZpbmVkICYmIGplZGlTdG9yZS5fYWN0aXZlUmVxdWVzdCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5fY2FuY2VsbGVyLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9jYW5jZWxsZXIgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGlbaV0uc3R5bGUgPSAnIHJlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc2FibGVTY3JvbGxVcCA9ICRzY29wZS5kaXNhYmxlU2Nyb2xsRG93biA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9sb2NhbEplZGkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9qZWRpW2ldLnN0eWxlID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGplZGlTdG9yZS5fbG9jYWxKZWRpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoamVkaVN0b3JlLl9qZWRpLmxlbmd0aCA9PSBjb25zdGFudHMuUk9XU19BTU9VTlQpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGlzYWJsZVNjcm9sbFVwID0gJHNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKGplZGlTdG9yZS5famVkaVtqZWRpU3RvcmUuX2plZGkubGVuZ3RoIC0gMV0uYXBwcmVudGljZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kaXNhYmxlU2Nyb2xsRG93biA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChqZWRpU3RvcmUuX2plZGlbMF0ubWFzdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc2FibGVTY3JvbGxVcCA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgbWV0aG9kcyA9IHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb24sXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkYXRhU3RyZWFtLnNlbmQoSlNPTi5zdHJpbmdpZnkoe2FjdGlvbjogJ2dldCd9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG1ldGhvZHM7XG4gICAgfV0pO1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4iLCIndXNlIHN0cmljdCc7XG5cbi8qIFNlcnZpY2VzICovXG4vKipcbiAqIFVzZXI6IFZvbG9zaGluIFZsYWRpbWlyXG4gKiBEYXRlOiAyMDE1LjEyLjA4XG4gKiBUaW1lOiAxMToxMVxuICovXG5cbmFuZ3VsYXIubW9kdWxlKFwibWFpblNlY3Rpb25cIilcbiAgICAuZmFjdG9yeSgnamVkaVN0b3JlJywgWyckcScsICckcm9vdFNjb3BlJywgJyRodHRwJywgJ2FwcENvbnN0YW50cycsIGZ1bmN0aW9uICgkcSwgJHNjb3BlLCAkaHR0cCwgY29uc3RhbnRzKSB7XG4gICAgICAgIHZhciBqZWRpU3RvcmUgPSB7XG5cbiAgICAgICAgICAgIF9qZWRpOiBbXSxcbiAgICAgICAgICAgIF9hY3RpdmVSZXF1ZXN0OiBudWxsLFxuICAgICAgICAgICAgX2xvY2FsSmVkaTogMSxcbiAgICAgICAgICAgIF9wZW5kaW5nUmVxdWVzdHNDb3VudDogbnVsbCxcbiAgICAgICAgICAgIF9jYW5jZWxsZXI6ICRxLmRlZmVyKCksXG5cbiAgICAgICAgICAgIHBvcHVsYXRlSmVkaUxpc3Q6IGZ1bmN0aW9uIChqZWRpTWFzdGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGVuZGluZ1JlcXVlc3RzQ291bnQgPSBjb25zdGFudHMuUk9XU19BTU9VTlQgJSAyID8gTWF0aC5jZWlsKGNvbnN0YW50cy5ST1dTX0FNT1VOVCAvIDIpIC0gMSA6IE1hdGguZmxvb3IoY29uc3RhbnRzLlJPV1NfQU1PVU5UIC8gMikgLSAxO1xuICAgICAgICAgICAgICAgIHRoaXMuX2plZGkucHVzaChqZWRpTWFzdGVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZEFwcHJlbnRpY2UoamVkaU1hc3Rlci5hcHByZW50aWNlLnVybCwgZmFsc2UpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgYXBwZW5kQXBwcmVudGljZTogZnVuY3Rpb24gKGplZGlNYXN0ZXJVcmwsIHJlbW92ZU9ic29sZXRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGplZGlNYXN0ZXJVcmwgPT0gbnVsbCAmJiB0aGlzLl9wZW5kaW5nUmVxdWVzdHNDb3VudC0tID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gY29uc3RhbnRzLlNDUk9MTF9QRVJfQ0xJQ0s7IGkgIT0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9qZWRpLnB1c2goe2hvbWV3b3JsZDogaSwgbmFtZTogbnVsbH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5famVkaS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGVuZGluZ1JlcXVlc3RzQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kaXNhYmxlU2Nyb2xsRG93biA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgamVkaVN0b3JlLl9hY3RpdmVSZXF1ZXN0ID0gJGh0dHAuZ2V0KGplZGlNYXN0ZXJVcmwsIHt0aW1lb3V0OiBqZWRpU3RvcmUuX2NhbmNlbGxlci5wcm9taXNlfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc2FibGVTY3JvbGxVcCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9qZWRpLnB1c2gocmVzcG9uc2UuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlT2Jzb2xldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqZWRpU3RvcmUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50LS0gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLmFwcGVuZEFwcHJlbnRpY2UocmVzcG9uc2UuZGF0YS5hcHByZW50aWNlLnVybCwgcmVtb3ZlT2Jzb2xldGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoamVkaVN0b3JlLl9qZWRpLmxlbmd0aCAhPSBjb25zdGFudHMuUk9XU19BTU9VTlQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IGNvbnN0YW50cy5ST1dTX0FNT1VOVCAtIGplZGlTdG9yZS5famVkaS5sZW5ndGg7IGkgIT0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkucHVzaCh7aG9tZXdvcmxkOiBpLCBuYW1lOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc2FibGVTY3JvbGxVcCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuX2plZGkgPSBqZWRpU3RvcmUuX2plZGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGFwcGVuZE1hc3RlcjogZnVuY3Rpb24oamVkaU1hc3RlclVybCwgcmVtb3ZlT2Jzb2xldGUpe1xuICAgICAgICAgICAgICAgIGlmKGplZGlNYXN0ZXJVcmwgPT0gbnVsbCAmJiBqZWRpU3RvcmUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50LS0gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaT1jb25zdGFudHMuU0NST0xMX1BFUl9DTElDSzsgaSAhPSAwOyBpLS0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9qZWRpLnVuc2hpZnQoe2hvbWV3b3JsZDppLCBuYW1lOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2plZGkucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzYWJsZVNjcm9sbFVwID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBqZWRpU3RvcmUuX2FjdGl2ZVJlcXVlc3QgPSAkaHR0cC5nZXQoamVkaU1hc3RlclVybCwge3RpbWVvdXQ6IGplZGlTdG9yZS5fY2FuY2VsbGVyLnByb21pc2V9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzYWJsZVNjcm9sbERvd24gPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5famVkaS51bnNoaWZ0KHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVtb3ZlT2Jzb2xldGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGplZGlTdG9yZS5famVkaS5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGplZGlTdG9yZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQtLSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqZWRpU3RvcmUuYXBwZW5kTWFzdGVyKHJlc3BvbnNlLmRhdGEubWFzdGVyLnVybCwgcmVtb3ZlT2Jzb2xldGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLl9qZWRpID0gamVkaVN0b3JlLl9qZWRpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNjcm9sbEplZGlMaXN0OiBmdW5jdGlvbihkaXJlY3Rpb24pe1xuICAgICAgICAgICAgICAgIGplZGlTdG9yZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQgKz0gY29uc3RhbnRzLlNDUk9MTF9QRVJfQ0xJQ0s7XG4gICAgICAgICAgICAgICAgaWYoamVkaVN0b3JlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA+IGNvbnN0YW50cy5TQ1JPTExfUEVSX0NMSUNLKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoamVkaVN0b3JlLmRpcmVjdGlvbiAhPSBkaXJlY3Rpb24pe1xuICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9jYW5jZWxsZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9jYW5jZWxsZXIgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA9IGNvbnN0YW50cy5TQ1JPTExfUEVSX0NMSUNLO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoamVkaVN0b3JlLl9qZWRpWzBdLm5hbWUgPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzYWJsZVNjcm9sbFVwID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGplZGlTdG9yZS5famVkaVtqZWRpU3RvcmUuX2plZGkubGVuZ3RoLTFdLm5hbWUgPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzYWJsZVNjcm9sbERvd24gPSAnIGNzcy1idXR0b24tZGlzYWJsZWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBqZWRpU3RvcmUuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgICAgICAgICAgICAgIGlmKGRpcmVjdGlvbiAmJiBqZWRpU3RvcmUuX2plZGlbMF0ubmFtZSAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLmFwcGVuZE1hc3RlcihqZWRpU3RvcmUuX2plZGlbMF0ubWFzdGVyLnVybCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfWVsc2UgaWYoamVkaVN0b3JlLl9qZWRpW2plZGlTdG9yZS5famVkaS5sZW5ndGgtMV0ubmFtZSAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAgICAgamVkaVN0b3JlLmFwcGVuZEFwcHJlbnRpY2UoamVkaVN0b3JlLl9qZWRpW2plZGlTdG9yZS5famVkaS5sZW5ndGgtMV0uYXBwcmVudGljZS51cmwsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBqZWRpU3RvcmU7XG4gICAgfV0pO1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4iXX0=
