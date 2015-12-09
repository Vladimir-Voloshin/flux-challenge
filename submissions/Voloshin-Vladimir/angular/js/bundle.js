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
        'jediControllers',
        'jediPlanetServices'
    ]).constant("appConstants", {
        "BASE_URL":             'http://localhost:3000/dark-jedis/',
        "INITIAL_ID":           3616,
        "JEDI_MOVED_TO_PLANET": 4,
        "JEDI_POPULATE_LIST":   1,
        "JEDI_SCROLLUP":        2,
        "JEDI_SCROLLDOWN":      3,
        "ROWS_AMOUNT":          5,
        "SCROLL_PER_CLICK":     2
    });

app.run(function($rootScope) {
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
                $rootScope._activeRequest.abort();
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
        $rootScope._activeRequest = $.ajax({
            url: jediMasterUrl,
            dataType: 'json',
            cache: false,
            success: function(data) {
                $rootScope._jedi.push(data);
                if(removeObsolete){
                    $rootScope._jedi.shift();
                }
                if($rootScope._pendingRequestsCount-- > 1) {
                    $rootScope.appendApprentice(data.apprentice.url, removeObsolete);
                }else{
                    if($rootScope._jedi.length != $rootScope.appConstants.ROWS_AMOUNT){
                        for(var i=$rootScope.appConstants.ROWS_AMOUNT-$rootScope._jedi.length; i != 0; i--){
                            $rootScope._jedi.push({homeworld:i, name: null});
                        }
                        $rootScope.disableScrollDown = ' css-button-disabled';
                    }
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(jediMasterUrl, status, err.toString());
            }.bind(this)
        });
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
        $rootScope._activeRequest = $.ajax({
            url: jediMasterUrl,
            dataType: 'json',
            cache: false,
            success: function(data) {
                $rootScope._jedi.unshift(data);
                if(removeObsolete){
                    $rootScope._jedi.pop();
                }
                if($rootScope._pendingRequestsCount-- > 1) {
                    $rootScope.appendMaster(data.master.url, removeObsolete);
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(jediMasterUrl, status, err.toString());
            }.bind(this)
        });
    };
});

},{}],2:[function(require,module,exports){
'use strict';

/* Controllers */
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.08
 * Time: 11:11
 */

var jediControllers = angular.module('jediControllers', []);

jediControllers.controller('sithController', ['$scope', '$http', 'appConstants', function ($scope, $http, appConstants) {
    $http.get(appConstants.BASE_URL + appConstants.INITIAL_ID)
        .then(function(response) {
            $scope.populateJediList(response.data);
        });
}]);

},{}],3:[function(require,module,exports){
'use strict';

/* Directives */
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.08
 * Time: 11:11
 */
},{}],4:[function(require,module,exports){
'use strict';

/* Filters */
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.08
 * Time: 11:11
 */
},{}],5:[function(require,module,exports){
'use strict';

/* Services */
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.08
 * Time: 11:11
 */

var jediPlanetServices = angular.module('jediPlanetServices', ['ngWebSocket']);

jediPlanetServices.factory('Planet', ['$websocket',
    function($websocket){
        var dataStream = $websocket('ws://localhost:4000');
        var collection = [];

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
                                this.scope._activeRequest.abort();
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
    }]);

jediPlanetServices.factory('Common', function($websocket){
        var root = {};
        root.show = function(planetData){
            console.log(planetData);
        };
        return root;
    }
);
},{}]},{},[1,2,3,4,5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMvYXBwLmpzIiwianMvY29udHJvbGxlcnMuanMiLCJqcy9kaXJlY3RpdmVzLmpzIiwianMvZmlsdGVycy5qcyIsImpzL3NlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0Jztcbi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDIwMTUuMTIuMDJcbiAqIFRpbWU6IDExOjExXG4gKi9cblxudmFyIGFwcCA9IGFuZ3VsYXJcbiAgICAubW9kdWxlKCdtYWluU2VjdGlvbicsIFtcbiAgICAgICAgJ25nV2ViU29ja2V0JyxcbiAgICAgICAgJ2plZGlDb250cm9sbGVycycsXG4gICAgICAgICdqZWRpUGxhbmV0U2VydmljZXMnXG4gICAgXSkuY29uc3RhbnQoXCJhcHBDb25zdGFudHNcIiwge1xuICAgICAgICBcIkJBU0VfVVJMXCI6ICAgICAgICAgICAgICdodHRwOi8vbG9jYWxob3N0OjMwMDAvZGFyay1qZWRpcy8nLFxuICAgICAgICBcIklOSVRJQUxfSURcIjogICAgICAgICAgIDM2MTYsXG4gICAgICAgIFwiSkVESV9NT1ZFRF9UT19QTEFORVRcIjogNCxcbiAgICAgICAgXCJKRURJX1BPUFVMQVRFX0xJU1RcIjogICAxLFxuICAgICAgICBcIkpFRElfU0NST0xMVVBcIjogICAgICAgIDIsXG4gICAgICAgIFwiSkVESV9TQ1JPTExET1dOXCI6ICAgICAgMyxcbiAgICAgICAgXCJST1dTX0FNT1VOVFwiOiAgICAgICAgICA1LFxuICAgICAgICBcIlNDUk9MTF9QRVJfQ0xJQ0tcIjogICAgIDJcbiAgICB9KTtcblxuYXBwLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlKSB7XG4gICAgJHJvb3RTY29wZS5hcHBDb25zdGFudHMgPSB7XG4gICAgICAgIFwiQkFTRV9VUkxcIjogICAgICAgICAgICAgJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9kYXJrLWplZGlzLycsXG4gICAgICAgIFwiSU5JVElBTF9JRFwiOiAgICAgICAgICAgMzYxNixcbiAgICAgICAgXCJKRURJX01PVkVEX1RPX1BMQU5FVFwiOiA0LFxuICAgICAgICBcIkpFRElfUE9QVUxBVEVfTElTVFwiOiAgIDEsXG4gICAgICAgIFwiSkVESV9TQ1JPTExVUFwiOiAgICAgICAgMixcbiAgICAgICAgXCJKRURJX1NDUk9MTERPV05cIjogICAgICAzLFxuICAgICAgICBcIlJPV1NfQU1PVU5UXCI6ICAgICAgICAgIDUsXG4gICAgICAgIFwiU0NST0xMX1BFUl9DTElDS1wiOiAgICAgMlxuICAgIH07XG5cbiAgICAkcm9vdFNjb3BlLl9qZWRpID0gW107XG4gICAgJHJvb3RTY29wZS5fYWN0aXZlUmVxdWVzdDtcbiAgICAkcm9vdFNjb3BlLl9sb2NhbEplZGkgPSAxO1xuICAgICRyb290U2NvcGUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50O1xuXG4gICAgJHJvb3RTY29wZS5wb3B1bGF0ZUplZGlMaXN0ID0gZnVuY3Rpb24oamVkaU1hc3Rlcikge1xuICAgICAgICAkcm9vdFNjb3BlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA9ICRyb290U2NvcGUuYXBwQ29uc3RhbnRzLlJPV1NfQU1PVU5UICUgMiA/IE1hdGguY2VpbCgkcm9vdFNjb3BlLmFwcENvbnN0YW50cy5ST1dTX0FNT1VOVCAvIDIpLTEgOiBNYXRoLmZsb29yKCRyb290U2NvcGUuYXBwQ29uc3RhbnRzLlJPV1NfQU1PVU5UIC8gMiktMTtcbiAgICAgICAgJHJvb3RTY29wZS5famVkaS5wdXNoKGplZGlNYXN0ZXIpO1xuICAgICAgICAkcm9vdFNjb3BlLmFwcGVuZEFwcHJlbnRpY2UoamVkaU1hc3Rlci5hcHByZW50aWNlLnVybCwgZmFsc2UpO1xuICAgIH07XG5cbiAgICAkcm9vdFNjb3BlLnNjcm9sbEplZGlMaXN0ID0gZnVuY3Rpb24oZGlyZWN0aW9uKXtcbiAgICAgICAgaWYoKCRyb290U2NvcGUuZGlzYWJsZVNjcm9sbFVwICE9ICcnICYmIGRpcmVjdGlvbikgfHwgKCRyb290U2NvcGUuZGlzYWJsZVNjcm9sbERvd24gIT0gJycgJiYgIWRpcmVjdGlvbikpe1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICRyb290U2NvcGUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ICs9ICRyb290U2NvcGUuYXBwQ29uc3RhbnRzLlNDUk9MTF9QRVJfQ0xJQ0s7XG4gICAgICAgIGlmKCRyb290U2NvcGUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ID4gJHJvb3RTY29wZS5hcHBDb25zdGFudHMuU0NST0xMX1BFUl9DTElDSyl7XG4gICAgICAgICAgICBpZigkcm9vdFNjb3BlLmRpcmVjdGlvbiAhPSBkaXJlY3Rpb24pe1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuX2FjdGl2ZVJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA9ICRyb290U2NvcGUuYXBwQ29uc3RhbnRzLlNDUk9MTF9QRVJfQ0xJQ0s7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgJHJvb3RTY29wZS5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgICAgIGlmKGRpcmVjdGlvbil7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLmFwcGVuZE1hc3Rlcigkcm9vdFNjb3BlLl9qZWRpWzBdLm1hc3Rlci51cmwsIHRydWUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICRyb290U2NvcGUuYXBwZW5kQXBwcmVudGljZSgkcm9vdFNjb3BlLl9qZWRpWyRyb290U2NvcGUuX2plZGkubGVuZ3RoLTFdLmFwcHJlbnRpY2UudXJsLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICRyb290U2NvcGUuYXBwZW5kQXBwcmVudGljZSA9IGZ1bmN0aW9uKGplZGlNYXN0ZXJVcmwsIHJlbW92ZU9ic29sZXRlKXtcbiAgICAgICAgaWYoamVkaU1hc3RlclVybCA9PSBudWxsICYmICRyb290U2NvcGUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50LS0gPiAxKSB7XG4gICAgICAgICAgICBmb3IodmFyIGk9JHJvb3RTY29wZS5hcHBDb25zdGFudHMuU0NST0xMX1BFUl9DTElDSzsgaSAhPSAwOyBpLS0pe1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuX2plZGkucHVzaCh7aG9tZXdvcmxkOmksIG5hbWU6IG51bGx9KTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLl9qZWRpLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHJvb3RTY29wZS5kaXNhYmxlU2Nyb2xsRG93biA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJHJvb3RTY29wZS5fYWN0aXZlUmVxdWVzdCA9ICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6IGplZGlNYXN0ZXJVcmwsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuX2plZGkucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICBpZihyZW1vdmVPYnNvbGV0ZSl7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuX2plZGkuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoJHJvb3RTY29wZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQtLSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5hcHBlbmRBcHByZW50aWNlKGRhdGEuYXBwcmVudGljZS51cmwsIHJlbW92ZU9ic29sZXRlKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgaWYoJHJvb3RTY29wZS5famVkaS5sZW5ndGggIT0gJHJvb3RTY29wZS5hcHBDb25zdGFudHMuUk9XU19BTU9VTlQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpPSRyb290U2NvcGUuYXBwQ29uc3RhbnRzLlJPV1NfQU1PVU5ULSRyb290U2NvcGUuX2plZGkubGVuZ3RoOyBpICE9IDA7IGktLSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5famVkaS5wdXNoKHtob21ld29ybGQ6aSwgbmFtZTogbnVsbH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5kaXNhYmxlU2Nyb2xsRG93biA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoamVkaU1hc3RlclVybCwgc3RhdHVzLCBlcnIudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHJvb3RTY29wZS5hcHBlbmRNYXN0ZXIgPSBmdW5jdGlvbihqZWRpTWFzdGVyVXJsLCByZW1vdmVPYnNvbGV0ZSl7XG4gICAgICAgIGlmKGplZGlNYXN0ZXJVcmwgPT0gbnVsbCAmJiAkcm9vdFNjb3BlLl9wZW5kaW5nUmVxdWVzdHNDb3VudC0tID4gMSkge1xuICAgICAgICAgICAgZm9yKHZhciBpPSRyb290U2NvcGUuYXBwQ29uc3RhbnRzLlNDUk9MTF9QRVJfQ0xJQ0s7IGkgIT0gMDsgaS0tKXtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLl9qZWRpLnVuc2hpZnQoe2hvbWV3b3JsZDppLCBuYW1lOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5famVkaS5wb3AoKTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkcm9vdFNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkcm9vdFNjb3BlLl9hY3RpdmVSZXF1ZXN0ID0gJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogamVkaU1hc3RlclVybCxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5famVkaS51bnNoaWZ0KGRhdGEpO1xuICAgICAgICAgICAgICAgIGlmKHJlbW92ZU9ic29sZXRlKXtcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5famVkaS5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoJHJvb3RTY29wZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQtLSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5hcHBlbmRNYXN0ZXIoZGF0YS5tYXN0ZXIudXJsLCByZW1vdmVPYnNvbGV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGplZGlNYXN0ZXJVcmwsIHN0YXR1cywgZXJyLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyogQ29udHJvbGxlcnMgKi9cbi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDIwMTUuMTIuMDhcbiAqIFRpbWU6IDExOjExXG4gKi9cblxudmFyIGplZGlDb250cm9sbGVycyA9IGFuZ3VsYXIubW9kdWxlKCdqZWRpQ29udHJvbGxlcnMnLCBbXSk7XG5cbmplZGlDb250cm9sbGVycy5jb250cm9sbGVyKCdzaXRoQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRodHRwJywgJ2FwcENvbnN0YW50cycsIGZ1bmN0aW9uICgkc2NvcGUsICRodHRwLCBhcHBDb25zdGFudHMpIHtcbiAgICAkaHR0cC5nZXQoYXBwQ29uc3RhbnRzLkJBU0VfVVJMICsgYXBwQ29uc3RhbnRzLklOSVRJQUxfSUQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAkc2NvcGUucG9wdWxhdGVKZWRpTGlzdChyZXNwb25zZS5kYXRhKTtcbiAgICAgICAgfSk7XG59XSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qIERpcmVjdGl2ZXMgKi9cbi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDIwMTUuMTIuMDhcbiAqIFRpbWU6IDExOjExXG4gKi8iLCIndXNlIHN0cmljdCc7XG5cbi8qIEZpbHRlcnMgKi9cbi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDIwMTUuMTIuMDhcbiAqIFRpbWU6IDExOjExXG4gKi8iLCIndXNlIHN0cmljdCc7XG5cbi8qIFNlcnZpY2VzICovXG4vKipcbiAqIFVzZXI6IFZvbG9zaGluIFZsYWRpbWlyXG4gKiBEYXRlOiAyMDE1LjEyLjA4XG4gKiBUaW1lOiAxMToxMVxuICovXG5cbnZhciBqZWRpUGxhbmV0U2VydmljZXMgPSBhbmd1bGFyLm1vZHVsZSgnamVkaVBsYW5ldFNlcnZpY2VzJywgWyduZ1dlYlNvY2tldCddKTtcblxuamVkaVBsYW5ldFNlcnZpY2VzLmZhY3RvcnkoJ1BsYW5ldCcsIFsnJHdlYnNvY2tldCcsXG4gICAgZnVuY3Rpb24oJHdlYnNvY2tldCl7XG4gICAgICAgIHZhciBkYXRhU3RyZWFtID0gJHdlYnNvY2tldCgnd3M6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuICAgICAgICB2YXIgY29sbGVjdGlvbiA9IFtdO1xuXG4gICAgICAgIGRhdGFTdHJlYW0ub25NZXNzYWdlKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHZhciBwbGFuZXREYXRhID0gSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgICAgdGhpcy5zY29wZS5jdXJyZW50UGxhbmV0ID0gcGxhbmV0RGF0YS5uYW1lO1xuXG4gICAgICAgICAgICBpZih0aGlzLnNjb3BlLl9qZWRpICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuX2xvY2FsSmVkaSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaT0wOyBpIDwgdGhpcy5zY29wZS5famVkaS5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuc2NvcGUuX2plZGlbaV0uaG9tZXdvcmxkLmlkID09IHBsYW5ldERhdGEuaWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5zY29wZS5famVkaS5sZW5ndGggPT0gdGhpcy5zY29wZS5hcHBDb25zdGFudHMuUk9XU19BTU9VTlQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuX3BlbmRpbmdSZXF1ZXN0c0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnNjb3BlLl9hY3RpdmVSZXF1ZXN0ICE9PSB1bmRlZmluZWQgJiYgdGhpcy5zY29wZS5fYWN0aXZlUmVxdWVzdCAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5fYWN0aXZlUmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLl9qZWRpW2ldLnN0eWxlICA9ICcgcmVkJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLmRpc2FibGVTY3JvbGxVcCA9IHRoaXMuc2NvcGUuZGlzYWJsZVNjcm9sbERvd24gPSAnIGNzcy1idXR0b24tZGlzYWJsZWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuX2xvY2FsSmVkaSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5famVkaVtpXS5zdHlsZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKHRoaXMuc2NvcGUuX2xvY2FsSmVkaSl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih0aGlzLnNjb3BlLl9qZWRpLmxlbmd0aCA9PSB0aGlzLnNjb3BlLmFwcENvbnN0YW50cy5ST1dTX0FNT1VOVCl7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29wZS5kaXNhYmxlU2Nyb2xsVXAgPSB0aGlzLnNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyc7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5zY29wZS5famVkaVt0aGlzLnNjb3BlLl9qZWRpLmxlbmd0aC0xXS5hcHByZW50aWNlID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLmRpc2FibGVTY3JvbGxEb3duID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYodGhpcy5zY29wZS5famVkaVswXS5tYXN0ZXIgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuZGlzYWJsZVNjcm9sbFVwID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBtZXRob2RzID0ge1xuICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGF0YVN0cmVhbS5zZW5kKEpTT04uc3RyaW5naWZ5KHsgYWN0aW9uOiAnZ2V0JyB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG1ldGhvZHM7XG4gICAgfV0pO1xuXG5qZWRpUGxhbmV0U2VydmljZXMuZmFjdG9yeSgnQ29tbW9uJywgZnVuY3Rpb24oJHdlYnNvY2tldCl7XG4gICAgICAgIHZhciByb290ID0ge307XG4gICAgICAgIHJvb3Quc2hvdyA9IGZ1bmN0aW9uKHBsYW5ldERhdGEpe1xuICAgICAgICAgICAgY29uc29sZS5sb2cocGxhbmV0RGF0YSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByb290O1xuICAgIH1cbik7Il19
