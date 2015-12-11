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































