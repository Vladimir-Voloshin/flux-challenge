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
