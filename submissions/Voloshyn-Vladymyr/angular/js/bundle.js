(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/**
 * User: Voloshyn Vladymyr
 * Date: 2015.12.02
 * Time: 11:11
 */

var app = angular
    .module('mainSection', [
        'ngWebSocket',
        'jediControllers'
    ]).constant("appConstants", {
        "BASE_URL":             'http://localhost:3000/dark-jedis/',
        "INITIAL_ID":           3616,
        "JEDI_MOVED_TO_PLANET": 4,
        "JEDI_POPULATE_LIST":   1,
        "JEDI_SCROLLUP":        2,
        "JEDI_SCROLLDOWN":      3,
        "ROWS_AMOUNT":          5,
        "SCROLL_PER_CLICK":     2
    }).factory('planetData', function($websocket) {
        var dataStream = $websocket('ws://localhost:4000');
        var collection = [];

        dataStream.onMessage(function(message) {
            collection.push(JSON.parse(message.data));
        });

        dataStream.onMessage(function(message) {
            var planetData = JSON.parse(message.data);
            this.scope.currentPlanet = planetData.name;

            if(this.scope._jedi !== undefined){
                this.scope._localJedi = false;
                for(var i=0; i < this.scope._jedi.length; i++){
                    if(this.scope._jedi[i].homeworld.id == planetData.id){
                        if(this.scope._jedi.length == this.scope.appConstants.ROWS_AMOUNT){
                            this.scope._pendingRequestsCount = 0;
                            if(this.scope._activeRequest !== undefined && this.scope._activeRequest != null){
                                this.scope._canceller.resolve();
                            }
                            this.scope._jedi[i].style  = ' red';
                            this.scope.disableScrollUp = this.scope.disableScrollDown = ' css-button-disabled';
                            this.scope._localJedi = true;
                        }
                    }else{
                        this.scope._jedi[i].style = '';
                    }
                }
                if(this.scope._localJedi){
                    return;
                }
            }
            if(this.scope._jedi.length == this.scope.appConstants.ROWS_AMOUNT){
                this.scope.disableScrollUp = this.scope.disableScrollDown = '';
                if(this.scope._jedi[this.scope._jedi.length-1].apprentice === undefined){
                    this.scope.disableScrollDown = ' css-button-disabled';
                }
                if(this.scope._jedi[0].master === undefined){
                    this.scope.disableScrollUp = ' css-button-disabled';
                }
            }
        });

        var methods = {
            collection: collection,
            get: function() {
                dataStream.send(JSON.stringify({ action: 'get' }));
            }
        };

        return methods;
    });

app.run(function($rootScope, $http, $q) {
    $rootScope.appConstants = {
        "BASE_URL":             'http://localhost:3000/dark-jedis/',
        "INITIAL_ID":           3616,
        "JEDI_MOVED_TO_PLANET": 4,
        "JEDI_POPULATE_LIST":   1,
        "JEDI_SCROLLUP":        2,
        "JEDI_SCROLLDOWN":      3,
        "ROWS_AMOUNT":          5,
        "SCROLL_PER_CLICK":     2
    };

    $rootScope._jedi = [];
    $rootScope._activeRequest;
    $rootScope._localJedi = 1;
    $rootScope._pendingRequestsCount;
    $rootScope._canceller = $q.defer();

    $rootScope.populateJediList = function(jediMaster) {
        $rootScope._pendingRequestsCount = $rootScope.appConstants.ROWS_AMOUNT % 2 ? Math.ceil($rootScope.appConstants.ROWS_AMOUNT / 2)-1 : Math.floor($rootScope.appConstants.ROWS_AMOUNT / 2)-1;
        $rootScope._jedi.push(jediMaster);
        $rootScope.appendApprentice(jediMaster.apprentice.url, false);
    };

    $rootScope.scrollJediList = function(direction){
        if(($rootScope.disableScrollUp != '' && direction) || ($rootScope.disableScrollDown != '' && !direction)){
            return;
        }
        $rootScope._pendingRequestsCount += $rootScope.appConstants.SCROLL_PER_CLICK;
        if($rootScope._pendingRequestsCount > $rootScope.appConstants.SCROLL_PER_CLICK){
            if($rootScope.direction != direction){
                $rootScope._canceller.resolve();
                $rootScope._pendingRequestsCount = $rootScope.appConstants.SCROLL_PER_CLICK;
            }else{
                return;
            }
        }
        $rootScope.direction = direction;
        if(direction){
            $rootScope.appendMaster($rootScope._jedi[0].master.url, true);
        }else{
            $rootScope.appendApprentice($rootScope._jedi[$rootScope._jedi.length-1].apprentice.url, true);
        }
    }

    $rootScope.appendApprentice = function(jediMasterUrl, removeObsolete){
        if(jediMasterUrl == null && $rootScope._pendingRequestsCount-- > 1) {
            for(var i=$rootScope.appConstants.SCROLL_PER_CLICK; i != 0; i--){
                $rootScope._jedi.push({homeworld:i, name: null});
                $rootScope._jedi.shift();
                $rootScope._pendingRequestsCount = 0;
            }
            $rootScope.disableScrollDown = ' css-button-disabled';
            return;
        }

        $rootScope._activeRequest = $http({
            cache: false,
            method: 'GET',
            timeout: $rootScope._cenceller,
            url: jediMasterUrl
        }).then(function (responce) {
            $rootScope._jedi.push(responce.data);
            if(removeObsolete){
                $rootScope._jedi.shift();
            }
            if($rootScope._pendingRequestsCount-- > 1) {
                $rootScope.appendApprentice(responce.data.apprentice.url, removeObsolete);
            }else{
                if($rootScope._jedi.length != $rootScope.appConstants.ROWS_AMOUNT){
                    for(var i=$rootScope.appConstants.ROWS_AMOUNT-$rootScope._jedi.length; i != 0; i--){
                        $rootScope._jedi.push({homeworld:i, name: null});
                    }
                    $rootScope.disableScrollDown = ' css-button-disabled';
                }
            }
        })
    }

    $rootScope.appendMaster = function(jediMasterUrl, removeObsolete){
        if(jediMasterUrl == null && $rootScope._pendingRequestsCount-- > 1) {
            for(var i=$rootScope.appConstants.SCROLL_PER_CLICK; i != 0; i--){
                $rootScope._jedi.unshift({homeworld:i, name: null});
                $rootScope._jedi.pop();
                $rootScope._pendingRequestsCount = 0;
            }
            $rootScope.disableScrollDown = ' css-button-disabled';
            return;
        }

        $rootScope._activeRequest = $http({
            cache: false,
            method: 'GET',
            timeout: $rootScope._cenceller,
            url: jediMasterUrl
        }).then(function (responce) {
            $rootScope._jedi.unshift(responce.data);
            if(removeObsolete){
                $rootScope._jedi.pop();
            }
            if($rootScope._pendingRequestsCount-- > 1) {
                $rootScope.appendMaster(responce.data.master.url, removeObsolete);
            }
        })
    };
});

},{}],2:[function(require,module,exports){
'use strict';

/* Controllers */
/**
 * User: Voloshyn Vladymyr
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

},{}],3:[function(require,module,exports){
'use strict';

/* Directives */
/**
 * User: Voloshyn Vladymyr
 * Date: 2015.12.08
 * Time: 11:11
 */
},{}],4:[function(require,module,exports){
'use strict';

/* Filters */
/**
 * User: Voloshyn Vladymyr
 * Date: 2015.12.08
 * Time: 11:11
 */
},{}],5:[function(require,module,exports){
'use strict';

/* Services */
/**
 * User: Voloshyn Vladymyr
 * Date: 2015.12.08
 * Time: 11:11
 */

},{}]},{},[1,2,3,4,5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMvYXBwLmpzIiwianMvY29udHJvbGxlcnMuanMiLCJqcy9kaXJlY3RpdmVzLmpzIiwianMvZmlsdGVycy5qcyIsImpzL3NlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0Jztcbi8qKlxuICogVXNlcjogVm9sb3NoeW4gVmxhZHlteXJcbiAqIERhdGU6IDIwMTUuMTIuMDJcbiAqIFRpbWU6IDExOjExXG4gKi9cblxudmFyIGFwcCA9IGFuZ3VsYXJcbiAgICAubW9kdWxlKCdtYWluU2VjdGlvbicsIFtcbiAgICAgICAgJ25nV2ViU29ja2V0JyxcbiAgICAgICAgJ2plZGlDb250cm9sbGVycydcbiAgICBdKS5jb25zdGFudChcImFwcENvbnN0YW50c1wiLCB7XG4gICAgICAgIFwiQkFTRV9VUkxcIjogICAgICAgICAgICAgJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9kYXJrLWplZGlzLycsXG4gICAgICAgIFwiSU5JVElBTF9JRFwiOiAgICAgICAgICAgMzYxNixcbiAgICAgICAgXCJKRURJX01PVkVEX1RPX1BMQU5FVFwiOiA0LFxuICAgICAgICBcIkpFRElfUE9QVUxBVEVfTElTVFwiOiAgIDEsXG4gICAgICAgIFwiSkVESV9TQ1JPTExVUFwiOiAgICAgICAgMixcbiAgICAgICAgXCJKRURJX1NDUk9MTERPV05cIjogICAgICAzLFxuICAgICAgICBcIlJPV1NfQU1PVU5UXCI6ICAgICAgICAgIDUsXG4gICAgICAgIFwiU0NST0xMX1BFUl9DTElDS1wiOiAgICAgMlxuICAgIH0pLmZhY3RvcnkoJ3BsYW5ldERhdGEnLCBmdW5jdGlvbigkd2Vic29ja2V0KSB7XG4gICAgICAgIHZhciBkYXRhU3RyZWFtID0gJHdlYnNvY2tldCgnd3M6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuICAgICAgICB2YXIgY29sbGVjdGlvbiA9IFtdO1xuXG4gICAgICAgIGRhdGFTdHJlYW0ub25NZXNzYWdlKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24ucHVzaChKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBkYXRhU3RyZWFtLm9uTWVzc2FnZShmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgICAgICB2YXIgcGxhbmV0RGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKTtcbiAgICAgICAgICAgIHRoaXMuc2NvcGUuY3VycmVudFBsYW5ldCA9IHBsYW5ldERhdGEubmFtZTtcblxuICAgICAgICAgICAgaWYodGhpcy5zY29wZS5famVkaSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLl9sb2NhbEplZGkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGk9MDsgaSA8IHRoaXMuc2NvcGUuX2plZGkubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnNjb3BlLl9qZWRpW2ldLmhvbWV3b3JsZC5pZCA9PSBwbGFuZXREYXRhLmlkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuc2NvcGUuX2plZGkubGVuZ3RoID09IHRoaXMuc2NvcGUuYXBwQ29uc3RhbnRzLlJPV1NfQU1PVU5UKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5zY29wZS5fYWN0aXZlUmVxdWVzdCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuc2NvcGUuX2FjdGl2ZVJlcXVlc3QgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuX2NhbmNlbGxlci5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuX2plZGlbaV0uc3R5bGUgID0gJyByZWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuZGlzYWJsZVNjcm9sbFVwID0gdGhpcy5zY29wZS5kaXNhYmxlU2Nyb2xsRG93biA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5fbG9jYWxKZWRpID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLl9qZWRpW2ldLnN0eWxlID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYodGhpcy5zY29wZS5fbG9jYWxKZWRpKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHRoaXMuc2NvcGUuX2plZGkubGVuZ3RoID09IHRoaXMuc2NvcGUuYXBwQ29uc3RhbnRzLlJPV1NfQU1PVU5UKXtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLmRpc2FibGVTY3JvbGxVcCA9IHRoaXMuc2NvcGUuZGlzYWJsZVNjcm9sbERvd24gPSAnJztcbiAgICAgICAgICAgICAgICBpZih0aGlzLnNjb3BlLl9qZWRpW3RoaXMuc2NvcGUuX2plZGkubGVuZ3RoLTFdLmFwcHJlbnRpY2UgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuZGlzYWJsZVNjcm9sbERvd24gPSAnIGNzcy1idXR0b24tZGlzYWJsZWQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZih0aGlzLnNjb3BlLl9qZWRpWzBdLm1hc3RlciA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5kaXNhYmxlU2Nyb2xsVXAgPSAnIGNzcy1idXR0b24tZGlzYWJsZWQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIG1ldGhvZHMgPSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBkYXRhU3RyZWFtLnNlbmQoSlNPTi5zdHJpbmdpZnkoeyBhY3Rpb246ICdnZXQnIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbWV0aG9kcztcbiAgICB9KTtcblxuYXBwLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlLCAkaHR0cCwgJHEpIHtcbiAgICAkcm9vdFNjb3BlLmFwcENvbnN0YW50cyA9IHtcbiAgICAgICAgXCJCQVNFX1VSTFwiOiAgICAgICAgICAgICAnaHR0cDovL2xvY2FsaG9zdDozMDAwL2RhcmstamVkaXMvJyxcbiAgICAgICAgXCJJTklUSUFMX0lEXCI6ICAgICAgICAgICAzNjE2LFxuICAgICAgICBcIkpFRElfTU9WRURfVE9fUExBTkVUXCI6IDQsXG4gICAgICAgIFwiSkVESV9QT1BVTEFURV9MSVNUXCI6ICAgMSxcbiAgICAgICAgXCJKRURJX1NDUk9MTFVQXCI6ICAgICAgICAyLFxuICAgICAgICBcIkpFRElfU0NST0xMRE9XTlwiOiAgICAgIDMsXG4gICAgICAgIFwiUk9XU19BTU9VTlRcIjogICAgICAgICAgNSxcbiAgICAgICAgXCJTQ1JPTExfUEVSX0NMSUNLXCI6ICAgICAyXG4gICAgfTtcblxuICAgICRyb290U2NvcGUuX2plZGkgPSBbXTtcbiAgICAkcm9vdFNjb3BlLl9hY3RpdmVSZXF1ZXN0O1xuICAgICRyb290U2NvcGUuX2xvY2FsSmVkaSA9IDE7XG4gICAgJHJvb3RTY29wZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQ7XG4gICAgJHJvb3RTY29wZS5fY2FuY2VsbGVyID0gJHEuZGVmZXIoKTtcblxuICAgICRyb290U2NvcGUucG9wdWxhdGVKZWRpTGlzdCA9IGZ1bmN0aW9uKGplZGlNYXN0ZXIpIHtcbiAgICAgICAgJHJvb3RTY29wZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQgPSAkcm9vdFNjb3BlLmFwcENvbnN0YW50cy5ST1dTX0FNT1VOVCAlIDIgPyBNYXRoLmNlaWwoJHJvb3RTY29wZS5hcHBDb25zdGFudHMuUk9XU19BTU9VTlQgLyAyKS0xIDogTWF0aC5mbG9vcigkcm9vdFNjb3BlLmFwcENvbnN0YW50cy5ST1dTX0FNT1VOVCAvIDIpLTE7XG4gICAgICAgICRyb290U2NvcGUuX2plZGkucHVzaChqZWRpTWFzdGVyKTtcbiAgICAgICAgJHJvb3RTY29wZS5hcHBlbmRBcHByZW50aWNlKGplZGlNYXN0ZXIuYXBwcmVudGljZS51cmwsIGZhbHNlKTtcbiAgICB9O1xuXG4gICAgJHJvb3RTY29wZS5zY3JvbGxKZWRpTGlzdCA9IGZ1bmN0aW9uKGRpcmVjdGlvbil7XG4gICAgICAgIGlmKCgkcm9vdFNjb3BlLmRpc2FibGVTY3JvbGxVcCAhPSAnJyAmJiBkaXJlY3Rpb24pIHx8ICgkcm9vdFNjb3BlLmRpc2FibGVTY3JvbGxEb3duICE9ICcnICYmICFkaXJlY3Rpb24pKXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkcm9vdFNjb3BlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCArPSAkcm9vdFNjb3BlLmFwcENvbnN0YW50cy5TQ1JPTExfUEVSX0NMSUNLO1xuICAgICAgICBpZigkcm9vdFNjb3BlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA+ICRyb290U2NvcGUuYXBwQ29uc3RhbnRzLlNDUk9MTF9QRVJfQ0xJQ0spe1xuICAgICAgICAgICAgaWYoJHJvb3RTY29wZS5kaXJlY3Rpb24gIT0gZGlyZWN0aW9uKXtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLl9jYW5jZWxsZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ID0gJHJvb3RTY29wZS5hcHBDb25zdGFudHMuU0NST0xMX1BFUl9DTElDSztcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAkcm9vdFNjb3BlLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICAgICAgaWYoZGlyZWN0aW9uKXtcbiAgICAgICAgICAgICRyb290U2NvcGUuYXBwZW5kTWFzdGVyKCRyb290U2NvcGUuX2plZGlbMF0ubWFzdGVyLnVybCwgdHJ1ZSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgJHJvb3RTY29wZS5hcHBlbmRBcHByZW50aWNlKCRyb290U2NvcGUuX2plZGlbJHJvb3RTY29wZS5famVkaS5sZW5ndGgtMV0uYXBwcmVudGljZS51cmwsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgJHJvb3RTY29wZS5hcHBlbmRBcHByZW50aWNlID0gZnVuY3Rpb24oamVkaU1hc3RlclVybCwgcmVtb3ZlT2Jzb2xldGUpe1xuICAgICAgICBpZihqZWRpTWFzdGVyVXJsID09IG51bGwgJiYgJHJvb3RTY29wZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQtLSA+IDEpIHtcbiAgICAgICAgICAgIGZvcih2YXIgaT0kcm9vdFNjb3BlLmFwcENvbnN0YW50cy5TQ1JPTExfUEVSX0NMSUNLOyBpICE9IDA7IGktLSl7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5famVkaS5wdXNoKHtob21ld29ybGQ6aSwgbmFtZTogbnVsbH0pO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuX2plZGkuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkcm9vdFNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICRyb290U2NvcGUuX2FjdGl2ZVJlcXVlc3QgPSAkaHR0cCh7XG4gICAgICAgICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgdGltZW91dDogJHJvb3RTY29wZS5fY2VuY2VsbGVyLFxuICAgICAgICAgICAgdXJsOiBqZWRpTWFzdGVyVXJsXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbmNlKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLl9qZWRpLnB1c2gocmVzcG9uY2UuZGF0YSk7XG4gICAgICAgICAgICBpZihyZW1vdmVPYnNvbGV0ZSl7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5famVkaS5zaGlmdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoJHJvb3RTY29wZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQtLSA+IDEpIHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmFwcGVuZEFwcHJlbnRpY2UocmVzcG9uY2UuZGF0YS5hcHByZW50aWNlLnVybCwgcmVtb3ZlT2Jzb2xldGUpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgaWYoJHJvb3RTY29wZS5famVkaS5sZW5ndGggIT0gJHJvb3RTY29wZS5hcHBDb25zdGFudHMuUk9XU19BTU9VTlQpe1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGk9JHJvb3RTY29wZS5hcHBDb25zdGFudHMuUk9XU19BTU9VTlQtJHJvb3RTY29wZS5famVkaS5sZW5ndGg7IGkgIT0gMDsgaS0tKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuX2plZGkucHVzaCh7aG9tZXdvcmxkOmksIG5hbWU6IG51bGx9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgJHJvb3RTY29wZS5hcHBlbmRNYXN0ZXIgPSBmdW5jdGlvbihqZWRpTWFzdGVyVXJsLCByZW1vdmVPYnNvbGV0ZSl7XG4gICAgICAgIGlmKGplZGlNYXN0ZXJVcmwgPT0gbnVsbCAmJiAkcm9vdFNjb3BlLl9wZW5kaW5nUmVxdWVzdHNDb3VudC0tID4gMSkge1xuICAgICAgICAgICAgZm9yKHZhciBpPSRyb290U2NvcGUuYXBwQ29uc3RhbnRzLlNDUk9MTF9QRVJfQ0xJQ0s7IGkgIT0gMDsgaS0tKXtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLl9qZWRpLnVuc2hpZnQoe2hvbWV3b3JsZDppLCBuYW1lOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5famVkaS5wb3AoKTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkcm9vdFNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICRyb290U2NvcGUuX2FjdGl2ZVJlcXVlc3QgPSAkaHR0cCh7XG4gICAgICAgICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgdGltZW91dDogJHJvb3RTY29wZS5fY2VuY2VsbGVyLFxuICAgICAgICAgICAgdXJsOiBqZWRpTWFzdGVyVXJsXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbmNlKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLl9qZWRpLnVuc2hpZnQocmVzcG9uY2UuZGF0YSk7XG4gICAgICAgICAgICBpZihyZW1vdmVPYnNvbGV0ZSl7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5famVkaS5wb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKCRyb290U2NvcGUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50LS0gPiAxKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5hcHBlbmRNYXN0ZXIocmVzcG9uY2UuZGF0YS5tYXN0ZXIudXJsLCByZW1vdmVPYnNvbGV0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBDb250cm9sbGVycyAqL1xuLyoqXG4gKiBVc2VyOiBWb2xvc2h5biBWbGFkeW15clxuICogRGF0ZTogMjAxNS4xMi4wOFxuICogVGltZTogMTE6MTFcbiAqL1xuXG52YXIgamVkaUNvbnRyb2xsZXJzID0gYW5ndWxhci5tb2R1bGUoJ2plZGlDb250cm9sbGVycycsIFtdKTtcblxuamVkaUNvbnRyb2xsZXJzLmNvbnRyb2xsZXIoJ3NpdGhDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGh0dHAnLCAnYXBwQ29uc3RhbnRzJywgJ3BsYW5ldERhdGEnLCBmdW5jdGlvbiAoJHNjb3BlLCAkaHR0cCwgYXBwQ29uc3RhbnRzLCBwbGFuZXREYXRhKSB7XG4gICAgJHNjb3BlLnBsYW5ldERhdGEgPSBwbGFuZXREYXRhO1xuICAgICRodHRwLmdldChhcHBDb25zdGFudHMuQkFTRV9VUkwgKyBhcHBDb25zdGFudHMuSU5JVElBTF9JRClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICRzY29wZS5wb3B1bGF0ZUplZGlMaXN0KHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICB9KTtcbn1dKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyogRGlyZWN0aXZlcyAqL1xuLyoqXG4gKiBVc2VyOiBWb2xvc2h5biBWbGFkeW15clxuICogRGF0ZTogMjAxNS4xMi4wOFxuICogVGltZTogMTE6MTFcbiAqLyIsIid1c2Ugc3RyaWN0JztcblxuLyogRmlsdGVycyAqL1xuLyoqXG4gKiBVc2VyOiBWb2xvc2h5biBWbGFkeW15clxuICogRGF0ZTogMjAxNS4xMi4wOFxuICogVGltZTogMTE6MTFcbiAqLyIsIid1c2Ugc3RyaWN0JztcblxuLyogU2VydmljZXMgKi9cbi8qKlxuICogVXNlcjogVm9sb3NoeW4gVmxhZHlteXJcbiAqIERhdGU6IDIwMTUuMTIuMDhcbiAqIFRpbWU6IDExOjExXG4gKi9cbiJdfQ==
