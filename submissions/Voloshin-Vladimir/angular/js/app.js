'use strict';
/**
 * User: Voloshin Vladimir
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
