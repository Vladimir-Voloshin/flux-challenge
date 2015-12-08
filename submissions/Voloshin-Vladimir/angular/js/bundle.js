(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/**
 * User: Voloshin Vladimir
 * Date: 2015.12.02
 * Time: 11:11
 */
//var _jedi = [];
//var _activeRequest = 1;
//var _jedi = [];
//var _localJedi;
//var _pendingRequestsCount;

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
                if(this.scope._jedi[0].name != null){
                    this.scope.disableScrollDown = ' css-button-disabled';
                }
                if(this.scope._jedi[this.scope._jedi.length-1].name != null){
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
        $rootScope.appendMaster(jediMaster.master.url, false);
    };

    $rootScope.scrollJediList = function(direction){
        $rootScope._pendingRequestsCount += $rootScope.appConstants.SCROLL_PER_CLICK;
        if(direction){
            appendMaster(_jedi[0].master.url, true);
        }else{
            appendApprentice(_jedi[_jedi.length-1].apprentice.url, true);
        }
    }

    $rootScope.appendMaster = function(jediMasterUrl, removeObsolete){
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
                }else{
                    if($rootScope._jedi.length != $rootScope.appConstants.ROWS_AMOUNT){
                        console.log(105);
                        for(var i=$rootScope.appConstants.ROWS_AMOUNT-$rootScope._jedi.length; i != 0; i--){
                            $rootScope._jedi.push({homeworld:i, name: null});
                        }
                        console.log(109);
                        $rootScope.disableScrollDown = ' css-button-disabled';
                    }
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(jediMasterUrl, status, err.toString());
            }.bind(this)
        });
    };
});




//
//var app = angular
//    .module('mainSection', [
//        'ngWebSocket'
//    ])
//    .factory('planetData', function($websocket) {
//        var dataStream = $websocket('ws://localhost:4000');
//        var collection = [];
//
//        dataStream.onMessage(function(message) {
//            collection.push(JSON.parse(message.data));
//        });
//
//        dataStream.onMessage(function(message) {
//            console.log(36);
//            var planetData = JSON.parse(message.data)
//            this.scope.currentPlanet = planetData.name;
//            //findLocalJedies(planetData);
//        });
//
//        function scrollJediList(direction){
//            if(direction){
//                appendMaster(_jedi[0].master.url, true);
//            }else{
//                appendApprentice(_jedi[_jedi.length-1].apprentice.url, true);
//            }
//            //JediStore.emitChange();
//        }
//
//        function findLocalJedies(planet){
//            _localJedi = null;
//            for(var i=0; i < _jedi.length; i++){
//                if(_jedi[i] != null && _jedi[i].homeworld.id == planet.id){
//                    if(_jedi.length == AppConstants.ROWS_AMOUNT){
//                        _pendingRequestsCount = 0;
//                        _activeRequest.abort();
//                    }
//                    _localJedi = _jedi[i].id;
//                    break;
//                }
//            }
//            //JediStore.emitChange();
//        }
//

//
//        var methods = {
//            collection: collection,
//            get: function() {
//                dataStream.send(JSON.stringify({ action: 'get' }));
//            }
//        };
//
//        return methods;
//    })
//    .controller('sithController', function ($scope, planetData) {
//        $scope.planetData = planetData;
//        $http.get(appConstants.BASE_URL + appConstants.INITIAL_ID)
//            .then(function(response) {
//                //populateJediList(response.data);
//            });
//    });

},{}],2:[function(require,module,exports){
'use strict';

/* Controllers */
/**
 * User: Voloshin Vladimir
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

},{}]},{},[1,2,3,4,5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMvYXBwLmpzIiwianMvY29udHJvbGxlcnMuanMiLCJqcy9kaXJlY3RpdmVzLmpzIiwianMvZmlsdGVycy5qcyIsImpzL3NlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vKipcbiAqIFVzZXI6IFZvbG9zaGluIFZsYWRpbWlyXG4gKiBEYXRlOiAyMDE1LjEyLjAyXG4gKiBUaW1lOiAxMToxMVxuICovXG4vL3ZhciBfamVkaSA9IFtdO1xuLy92YXIgX2FjdGl2ZVJlcXVlc3QgPSAxO1xuLy92YXIgX2plZGkgPSBbXTtcbi8vdmFyIF9sb2NhbEplZGk7XG4vL3ZhciBfcGVuZGluZ1JlcXVlc3RzQ291bnQ7XG5cbnZhciBhcHAgPSBhbmd1bGFyXG4gICAgLm1vZHVsZSgnbWFpblNlY3Rpb24nLCBbXG4gICAgICAgICduZ1dlYlNvY2tldCcsXG4gICAgICAgICdqZWRpQ29udHJvbGxlcnMnXG4gICAgXSkuY29uc3RhbnQoXCJhcHBDb25zdGFudHNcIiwge1xuICAgICAgICBcIkJBU0VfVVJMXCI6ICAgICAgICAgICAgICdodHRwOi8vbG9jYWxob3N0OjMwMDAvZGFyay1qZWRpcy8nLFxuICAgICAgICBcIklOSVRJQUxfSURcIjogICAgICAgICAgIDM2MTYsXG4gICAgICAgIFwiSkVESV9NT1ZFRF9UT19QTEFORVRcIjogNCxcbiAgICAgICAgXCJKRURJX1BPUFVMQVRFX0xJU1RcIjogICAxLFxuICAgICAgICBcIkpFRElfU0NST0xMVVBcIjogICAgICAgIDIsXG4gICAgICAgIFwiSkVESV9TQ1JPTExET1dOXCI6ICAgICAgMyxcbiAgICAgICAgXCJST1dTX0FNT1VOVFwiOiAgICAgICAgICA1LFxuICAgICAgICBcIlNDUk9MTF9QRVJfQ0xJQ0tcIjogICAgIDJcbiAgICB9KS5mYWN0b3J5KCdwbGFuZXREYXRhJywgZnVuY3Rpb24oJHdlYnNvY2tldCkge1xuICAgICAgICB2YXIgZGF0YVN0cmVhbSA9ICR3ZWJzb2NrZXQoJ3dzOi8vbG9jYWxob3N0OjQwMDAnKTtcbiAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBbXTtcblxuICAgICAgICBkYXRhU3RyZWFtLm9uTWVzc2FnZShmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uLnB1c2goSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGF0YVN0cmVhbS5vbk1lc3NhZ2UoZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICAgICAgdmFyIHBsYW5ldERhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgICAgICB0aGlzLnNjb3BlLmN1cnJlbnRQbGFuZXQgPSBwbGFuZXREYXRhLm5hbWU7XG5cbiAgICAgICAgICAgIGlmKHRoaXMuc2NvcGUuX2plZGkgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29wZS5fbG9jYWxKZWRpID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBpPTA7IGkgPCB0aGlzLnNjb3BlLl9qZWRpLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5zY29wZS5famVkaVtpXS5ob21ld29ybGQuaWQgPT0gcGxhbmV0RGF0YS5pZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnNjb3BlLl9qZWRpLmxlbmd0aCA9PSB0aGlzLnNjb3BlLmFwcENvbnN0YW50cy5ST1dTX0FNT1VOVCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuc2NvcGUuX2FjdGl2ZVJlcXVlc3QgIT09IHVuZGVmaW5lZCAmJiB0aGlzLnNjb3BlLl9hY3RpdmVSZXF1ZXN0ICE9IG51bGwpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLl9hY3RpdmVSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuX2plZGlbaV0uc3R5bGUgID0gJyByZWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuZGlzYWJsZVNjcm9sbFVwID0gdGhpcy5zY29wZS5kaXNhYmxlU2Nyb2xsRG93biA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29wZS5fbG9jYWxKZWRpID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLl9qZWRpW2ldLnN0eWxlID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYodGhpcy5zY29wZS5fbG9jYWxKZWRpKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHRoaXMuc2NvcGUuX2plZGkubGVuZ3RoID09IHRoaXMuc2NvcGUuYXBwQ29uc3RhbnRzLlJPV1NfQU1PVU5UKXtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3BlLmRpc2FibGVTY3JvbGxVcCA9IHRoaXMuc2NvcGUuZGlzYWJsZVNjcm9sbERvd24gPSAnJztcbiAgICAgICAgICAgICAgICBpZih0aGlzLnNjb3BlLl9qZWRpWzBdLm5hbWUgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuZGlzYWJsZVNjcm9sbERvd24gPSAnIGNzcy1idXR0b24tZGlzYWJsZWQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZih0aGlzLnNjb3BlLl9qZWRpW3RoaXMuc2NvcGUuX2plZGkubGVuZ3RoLTFdLm5hbWUgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcGUuZGlzYWJsZVNjcm9sbFVwID0gJyBjc3MtYnV0dG9uLWRpc2FibGVkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBtZXRob2RzID0ge1xuICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGF0YVN0cmVhbS5zZW5kKEpTT04uc3RyaW5naWZ5KHsgYWN0aW9uOiAnZ2V0JyB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG1ldGhvZHM7XG4gICAgfSk7XG5cbmFwcC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSkge1xuICAgICRyb290U2NvcGUuYXBwQ29uc3RhbnRzID0ge1xuICAgICAgICBcIkJBU0VfVVJMXCI6ICAgICAgICAgICAgICdodHRwOi8vbG9jYWxob3N0OjMwMDAvZGFyay1qZWRpcy8nLFxuICAgICAgICBcIklOSVRJQUxfSURcIjogICAgICAgICAgIDM2MTYsXG4gICAgICAgIFwiSkVESV9NT1ZFRF9UT19QTEFORVRcIjogNCxcbiAgICAgICAgXCJKRURJX1BPUFVMQVRFX0xJU1RcIjogICAxLFxuICAgICAgICBcIkpFRElfU0NST0xMVVBcIjogICAgICAgIDIsXG4gICAgICAgIFwiSkVESV9TQ1JPTExET1dOXCI6ICAgICAgMyxcbiAgICAgICAgXCJST1dTX0FNT1VOVFwiOiAgICAgICAgICA1LFxuICAgICAgICBcIlNDUk9MTF9QRVJfQ0xJQ0tcIjogICAgIDJcbiAgICB9O1xuXG4gICAgJHJvb3RTY29wZS5famVkaSA9IFtdO1xuICAgICRyb290U2NvcGUuX2FjdGl2ZVJlcXVlc3Q7XG4gICAgJHJvb3RTY29wZS5fbG9jYWxKZWRpID0gMTtcbiAgICAkcm9vdFNjb3BlLl9wZW5kaW5nUmVxdWVzdHNDb3VudDtcblxuICAgICRyb290U2NvcGUucG9wdWxhdGVKZWRpTGlzdCA9IGZ1bmN0aW9uKGplZGlNYXN0ZXIpIHtcbiAgICAgICAgJHJvb3RTY29wZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQgPSAkcm9vdFNjb3BlLmFwcENvbnN0YW50cy5ST1dTX0FNT1VOVCAlIDIgPyBNYXRoLmNlaWwoJHJvb3RTY29wZS5hcHBDb25zdGFudHMuUk9XU19BTU9VTlQgLyAyKS0xIDogTWF0aC5mbG9vcigkcm9vdFNjb3BlLmFwcENvbnN0YW50cy5ST1dTX0FNT1VOVCAvIDIpLTE7XG4gICAgICAgICRyb290U2NvcGUuX2plZGkucHVzaChqZWRpTWFzdGVyKTtcbiAgICAgICAgJHJvb3RTY29wZS5hcHBlbmRNYXN0ZXIoamVkaU1hc3Rlci5tYXN0ZXIudXJsLCBmYWxzZSk7XG4gICAgfTtcblxuICAgICRyb290U2NvcGUuc2Nyb2xsSmVkaUxpc3QgPSBmdW5jdGlvbihkaXJlY3Rpb24pe1xuICAgICAgICAkcm9vdFNjb3BlLl9wZW5kaW5nUmVxdWVzdHNDb3VudCArPSAkcm9vdFNjb3BlLmFwcENvbnN0YW50cy5TQ1JPTExfUEVSX0NMSUNLO1xuICAgICAgICBpZihkaXJlY3Rpb24pe1xuICAgICAgICAgICAgYXBwZW5kTWFzdGVyKF9qZWRpWzBdLm1hc3Rlci51cmwsIHRydWUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGFwcGVuZEFwcHJlbnRpY2UoX2plZGlbX2plZGkubGVuZ3RoLTFdLmFwcHJlbnRpY2UudXJsLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICRyb290U2NvcGUuYXBwZW5kTWFzdGVyID0gZnVuY3Rpb24oamVkaU1hc3RlclVybCwgcmVtb3ZlT2Jzb2xldGUpe1xuICAgICAgICAkcm9vdFNjb3BlLl9hY3RpdmVSZXF1ZXN0ID0gJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogamVkaU1hc3RlclVybCxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5famVkaS51bnNoaWZ0KGRhdGEpO1xuICAgICAgICAgICAgICAgIGlmKHJlbW92ZU9ic29sZXRlKXtcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5famVkaS5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoJHJvb3RTY29wZS5fcGVuZGluZ1JlcXVlc3RzQ291bnQtLSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5hcHBlbmRNYXN0ZXIoZGF0YS5tYXN0ZXIudXJsLCByZW1vdmVPYnNvbGV0ZSk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGlmKCRyb290U2NvcGUuX2plZGkubGVuZ3RoICE9ICRyb290U2NvcGUuYXBwQ29uc3RhbnRzLlJPV1NfQU1PVU5UKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKDEwNSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGk9JHJvb3RTY29wZS5hcHBDb25zdGFudHMuUk9XU19BTU9VTlQtJHJvb3RTY29wZS5famVkaS5sZW5ndGg7IGkgIT0gMDsgaS0tKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLl9qZWRpLnB1c2goe2hvbWV3b3JsZDppLCBuYW1lOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygxMDkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5kaXNhYmxlU2Nyb2xsRG93biA9ICcgY3NzLWJ1dHRvbi1kaXNhYmxlZCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoamVkaU1hc3RlclVybCwgc3RhdHVzLCBlcnIudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pO1xuXG5cblxuXG4vL1xuLy92YXIgYXBwID0gYW5ndWxhclxuLy8gICAgLm1vZHVsZSgnbWFpblNlY3Rpb24nLCBbXG4vLyAgICAgICAgJ25nV2ViU29ja2V0J1xuLy8gICAgXSlcbi8vICAgIC5mYWN0b3J5KCdwbGFuZXREYXRhJywgZnVuY3Rpb24oJHdlYnNvY2tldCkge1xuLy8gICAgICAgIHZhciBkYXRhU3RyZWFtID0gJHdlYnNvY2tldCgnd3M6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuLy8gICAgICAgIHZhciBjb2xsZWN0aW9uID0gW107XG4vL1xuLy8gICAgICAgIGRhdGFTdHJlYW0ub25NZXNzYWdlKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbi8vICAgICAgICAgICAgY29sbGVjdGlvbi5wdXNoKEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKSk7XG4vLyAgICAgICAgfSk7XG4vL1xuLy8gICAgICAgIGRhdGFTdHJlYW0ub25NZXNzYWdlKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coMzYpO1xuLy8gICAgICAgICAgICB2YXIgcGxhbmV0RGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKVxuLy8gICAgICAgICAgICB0aGlzLnNjb3BlLmN1cnJlbnRQbGFuZXQgPSBwbGFuZXREYXRhLm5hbWU7XG4vLyAgICAgICAgICAgIC8vZmluZExvY2FsSmVkaWVzKHBsYW5ldERhdGEpO1xuLy8gICAgICAgIH0pO1xuLy9cbi8vICAgICAgICBmdW5jdGlvbiBzY3JvbGxKZWRpTGlzdChkaXJlY3Rpb24pe1xuLy8gICAgICAgICAgICBpZihkaXJlY3Rpb24pe1xuLy8gICAgICAgICAgICAgICAgYXBwZW5kTWFzdGVyKF9qZWRpWzBdLm1hc3Rlci51cmwsIHRydWUpO1xuLy8gICAgICAgICAgICB9ZWxzZXtcbi8vICAgICAgICAgICAgICAgIGFwcGVuZEFwcHJlbnRpY2UoX2plZGlbX2plZGkubGVuZ3RoLTFdLmFwcHJlbnRpY2UudXJsLCB0cnVlKTtcbi8vICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAvL0plZGlTdG9yZS5lbWl0Q2hhbmdlKCk7XG4vLyAgICAgICAgfVxuLy9cbi8vICAgICAgICBmdW5jdGlvbiBmaW5kTG9jYWxKZWRpZXMocGxhbmV0KXtcbi8vICAgICAgICAgICAgX2xvY2FsSmVkaSA9IG51bGw7XG4vLyAgICAgICAgICAgIGZvcih2YXIgaT0wOyBpIDwgX2plZGkubGVuZ3RoOyBpKyspe1xuLy8gICAgICAgICAgICAgICAgaWYoX2plZGlbaV0gIT0gbnVsbCAmJiBfamVkaVtpXS5ob21ld29ybGQuaWQgPT0gcGxhbmV0LmlkKXtcbi8vICAgICAgICAgICAgICAgICAgICBpZihfamVkaS5sZW5ndGggPT0gQXBwQ29uc3RhbnRzLlJPV1NfQU1PVU5UKXtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgX3BlbmRpbmdSZXF1ZXN0c0NvdW50ID0gMDtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGl2ZVJlcXVlc3QuYWJvcnQoKTtcbi8vICAgICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICAgICAgICAgX2xvY2FsSmVkaSA9IF9qZWRpW2ldLmlkO1xuLy8gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuLy8gICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICB9XG4vLyAgICAgICAgICAgIC8vSmVkaVN0b3JlLmVtaXRDaGFuZ2UoKTtcbi8vICAgICAgICB9XG4vL1xuXG4vL1xuLy8gICAgICAgIHZhciBtZXRob2RzID0ge1xuLy8gICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuLy8gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuLy8gICAgICAgICAgICAgICAgZGF0YVN0cmVhbS5zZW5kKEpTT04uc3RyaW5naWZ5KHsgYWN0aW9uOiAnZ2V0JyB9KSk7XG4vLyAgICAgICAgICAgIH1cbi8vICAgICAgICB9O1xuLy9cbi8vICAgICAgICByZXR1cm4gbWV0aG9kcztcbi8vICAgIH0pXG4vLyAgICAuY29udHJvbGxlcignc2l0aENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBwbGFuZXREYXRhKSB7XG4vLyAgICAgICAgJHNjb3BlLnBsYW5ldERhdGEgPSBwbGFuZXREYXRhO1xuLy8gICAgICAgICRodHRwLmdldChhcHBDb25zdGFudHMuQkFTRV9VUkwgKyBhcHBDb25zdGFudHMuSU5JVElBTF9JRClcbi8vICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbi8vICAgICAgICAgICAgICAgIC8vcG9wdWxhdGVKZWRpTGlzdChyZXNwb25zZS5kYXRhKTtcbi8vICAgICAgICAgICAgfSk7XG4vLyAgICB9KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyogQ29udHJvbGxlcnMgKi9cbi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDIwMTUuMTIuMDhcbiAqIFRpbWU6IDExOjExXG4gKi9cblxudmFyIGplZGlDb250cm9sbGVycyA9IGFuZ3VsYXIubW9kdWxlKCdqZWRpQ29udHJvbGxlcnMnLCBbXSk7XG5cbmplZGlDb250cm9sbGVycy5jb250cm9sbGVyKCdzaXRoQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRodHRwJywgJ2FwcENvbnN0YW50cycsICdwbGFuZXREYXRhJywgZnVuY3Rpb24gKCRzY29wZSwgJGh0dHAsIGFwcENvbnN0YW50cywgcGxhbmV0RGF0YSkge1xuICAgICRzY29wZS5wbGFuZXREYXRhID0gcGxhbmV0RGF0YTtcbiAgICAkaHR0cC5nZXQoYXBwQ29uc3RhbnRzLkJBU0VfVVJMICsgYXBwQ29uc3RhbnRzLklOSVRJQUxfSUQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAkc2NvcGUucG9wdWxhdGVKZWRpTGlzdChyZXNwb25zZS5kYXRhKTtcbiAgICAgICAgfSk7XG59XSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qIERpcmVjdGl2ZXMgKi9cbi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDIwMTUuMTIuMDhcbiAqIFRpbWU6IDExOjExXG4gKi8iLCIndXNlIHN0cmljdCc7XG5cbi8qIEZpbHRlcnMgKi9cbi8qKlxuICogVXNlcjogVm9sb3NoaW4gVmxhZGltaXJcbiAqIERhdGU6IDIwMTUuMTIuMDhcbiAqIFRpbWU6IDExOjExXG4gKi8iLCIndXNlIHN0cmljdCc7XG5cbi8qIFNlcnZpY2VzICovXG4vKipcbiAqIFVzZXI6IFZvbG9zaGluIFZsYWRpbWlyXG4gKiBEYXRlOiAyMDE1LjEyLjA4XG4gKiBUaW1lOiAxMToxMVxuICovXG4iXX0=
