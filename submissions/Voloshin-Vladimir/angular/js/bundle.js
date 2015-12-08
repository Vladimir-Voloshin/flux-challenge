(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * User: Voloshin Vladimir
 * Date: 19.11.15
 * Time: 11:11
 */
var _jedi = [];
var _activeRequest;
var _jedi = [];
var _localJedi;
var _pendingRequestsCount;

var app = angular
    .module('mainSection', [
        'ngWebSocket'
    ])
    .constant("appConstants", {
        "BASE_URL":             'http://localhost:3000/dark-jedis/',
        "INITIAL_ID":           3616,
        "JEDI_MOVED_TO_PLANET": 4,
        "JEDI_POPULATE_LIST":   1,
        "JEDI_SCROLLUP":        2,
        "JEDI_SCROLLDOWN":      3,
        "ROWS_AMOUNT":          5,
        "SCROLL_PER_CLICK":     2
    })
    .factory('planetData', function($websocket) {
        var dataStream = $websocket('ws://localhost:4000');
        var collection = [];

        dataStream.onMessage(function(message) {
            collection.push(JSON.parse(message.data));
        });

        dataStream.onMessage(function(message) {
            planetData = JSON.parse(message.data)
            this.scope.currentPlanet = planetData.name;
            findLocalJedies(planetData);
        });

        function scrollJediList(direction){
            if(direction){
                appendMaster(_jedi[0].master.url, true);
            }else{
                appendApprentice(_jedi[_jedi.length-1].apprentice.url, true);
            }
            //JediStore.emitChange();
        }

        function findLocalJedies(planet){
            _localJedi = null;
            for(var i=0; i < _jedi.length; i++){
                if(_jedi[i] != null && _jedi[i].homeworld.id == planet.id){
                    if(_jedi.length == AppConstants.ROWS_AMOUNT){
                        _pendingRequestsCount = 0;
                        _activeRequest.abort();
                    }
                    _localJedi = _jedi[i].id;
                    break;
                }
            }
            //JediStore.emitChange();
        }

        function populateJediList(jediMaster) {
            console.log(appConstants);
            //_pendingRequestsCount = AppConstants.ROWS_AMOUNT % 2 ? Math.ceil(AppConstants.ROWS_AMOUNT / 2)-1 : Math.floor(AppConstants.ROWS_AMOUNT / 2)-1;
            //_jedi.push(jediMaster);
            //appendMaster(jediMaster.master.url, false);
        }

        var methods = {
            collection: collection,
            get: function() {
                dataStream.send(JSON.stringify({ action: 'get' }));
            }
        };

        return methods;
    })
    .controller('sithController', function (appConstants, $http) {
        $http.get(appConstants.BASE_URL + appConstants.INITIAL_ID)
            .then(function(response) {
                populateJediList(response.data);
            });
    });

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwianMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIFVzZXI6IFZvbG9zaGluIFZsYWRpbWlyXG4gKiBEYXRlOiAxOS4xMS4xNVxuICogVGltZTogMTE6MTFcbiAqL1xudmFyIF9qZWRpID0gW107XG52YXIgX2FjdGl2ZVJlcXVlc3Q7XG52YXIgX2plZGkgPSBbXTtcbnZhciBfbG9jYWxKZWRpO1xudmFyIF9wZW5kaW5nUmVxdWVzdHNDb3VudDtcblxudmFyIGFwcCA9IGFuZ3VsYXJcbiAgICAubW9kdWxlKCdtYWluU2VjdGlvbicsIFtcbiAgICAgICAgJ25nV2ViU29ja2V0J1xuICAgIF0pXG4gICAgLmNvbnN0YW50KFwiYXBwQ29uc3RhbnRzXCIsIHtcbiAgICAgICAgXCJCQVNFX1VSTFwiOiAgICAgICAgICAgICAnaHR0cDovL2xvY2FsaG9zdDozMDAwL2RhcmstamVkaXMvJyxcbiAgICAgICAgXCJJTklUSUFMX0lEXCI6ICAgICAgICAgICAzNjE2LFxuICAgICAgICBcIkpFRElfTU9WRURfVE9fUExBTkVUXCI6IDQsXG4gICAgICAgIFwiSkVESV9QT1BVTEFURV9MSVNUXCI6ICAgMSxcbiAgICAgICAgXCJKRURJX1NDUk9MTFVQXCI6ICAgICAgICAyLFxuICAgICAgICBcIkpFRElfU0NST0xMRE9XTlwiOiAgICAgIDMsXG4gICAgICAgIFwiUk9XU19BTU9VTlRcIjogICAgICAgICAgNSxcbiAgICAgICAgXCJTQ1JPTExfUEVSX0NMSUNLXCI6ICAgICAyXG4gICAgfSlcbiAgICAuZmFjdG9yeSgncGxhbmV0RGF0YScsIGZ1bmN0aW9uKCR3ZWJzb2NrZXQpIHtcbiAgICAgICAgdmFyIGRhdGFTdHJlYW0gPSAkd2Vic29ja2V0KCd3czovL2xvY2FsaG9zdDo0MDAwJyk7XG4gICAgICAgIHZhciBjb2xsZWN0aW9uID0gW107XG5cbiAgICAgICAgZGF0YVN0cmVhbS5vbk1lc3NhZ2UoZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICAgICAgY29sbGVjdGlvbi5wdXNoKEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRhdGFTdHJlYW0ub25NZXNzYWdlKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHBsYW5ldERhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSlcbiAgICAgICAgICAgIHRoaXMuc2NvcGUuY3VycmVudFBsYW5ldCA9IHBsYW5ldERhdGEubmFtZTtcbiAgICAgICAgICAgIGZpbmRMb2NhbEplZGllcyhwbGFuZXREYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gc2Nyb2xsSmVkaUxpc3QoZGlyZWN0aW9uKXtcbiAgICAgICAgICAgIGlmKGRpcmVjdGlvbil7XG4gICAgICAgICAgICAgICAgYXBwZW5kTWFzdGVyKF9qZWRpWzBdLm1hc3Rlci51cmwsIHRydWUpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgYXBwZW5kQXBwcmVudGljZShfamVkaVtfamVkaS5sZW5ndGgtMV0uYXBwcmVudGljZS51cmwsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9KZWRpU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZmluZExvY2FsSmVkaWVzKHBsYW5ldCl7XG4gICAgICAgICAgICBfbG9jYWxKZWRpID0gbnVsbDtcbiAgICAgICAgICAgIGZvcih2YXIgaT0wOyBpIDwgX2plZGkubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIGlmKF9qZWRpW2ldICE9IG51bGwgJiYgX2plZGlbaV0uaG9tZXdvcmxkLmlkID09IHBsYW5ldC5pZCl7XG4gICAgICAgICAgICAgICAgICAgIGlmKF9qZWRpLmxlbmd0aCA9PSBBcHBDb25zdGFudHMuUk9XU19BTU9VTlQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgX3BlbmRpbmdSZXF1ZXN0c0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hY3RpdmVSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgX2xvY2FsSmVkaSA9IF9qZWRpW2ldLmlkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL0plZGlTdG9yZS5lbWl0Q2hhbmdlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBwb3B1bGF0ZUplZGlMaXN0KGplZGlNYXN0ZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGFwcENvbnN0YW50cyk7XG4gICAgICAgICAgICAvL19wZW5kaW5nUmVxdWVzdHNDb3VudCA9IEFwcENvbnN0YW50cy5ST1dTX0FNT1VOVCAlIDIgPyBNYXRoLmNlaWwoQXBwQ29uc3RhbnRzLlJPV1NfQU1PVU5UIC8gMiktMSA6IE1hdGguZmxvb3IoQXBwQ29uc3RhbnRzLlJPV1NfQU1PVU5UIC8gMiktMTtcbiAgICAgICAgICAgIC8vX2plZGkucHVzaChqZWRpTWFzdGVyKTtcbiAgICAgICAgICAgIC8vYXBwZW5kTWFzdGVyKGplZGlNYXN0ZXIubWFzdGVyLnVybCwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG1ldGhvZHMgPSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBkYXRhU3RyZWFtLnNlbmQoSlNPTi5zdHJpbmdpZnkoeyBhY3Rpb246ICdnZXQnIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbWV0aG9kcztcbiAgICB9KVxuICAgIC5jb250cm9sbGVyKCdzaXRoQ29udHJvbGxlcicsIGZ1bmN0aW9uIChhcHBDb25zdGFudHMsICRodHRwKSB7XG4gICAgICAgICRodHRwLmdldChhcHBDb25zdGFudHMuQkFTRV9VUkwgKyBhcHBDb25zdGFudHMuSU5JVElBTF9JRClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcG9wdWxhdGVKZWRpTGlzdChyZXNwb25zZS5kYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH0pO1xuIl19
