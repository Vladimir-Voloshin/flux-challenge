/**
* User: Voloshin Vladimir
* Date: 19.11.15
* Time: 11:11
*/

var AppDispatcher = require('../dispatcher/AppDispatcher');
var $ = require('jquery');
var AppConstants = require('../constants/AppConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _activeRequest;
var _jedi = [];
var _localJedi;
var _pendingRequestsCount;

function populateJediList(jediMaster) {
    _pendingRequestsCount = AppConstants.ROWS_AMOUNT % 2 ? Math.ceil(AppConstants.ROWS_AMOUNT / 2)-1 : Math.floor(AppConstants.ROWS_AMOUNT / 2)-1;
    _jedi.push(jediMaster);
    appendMaster(jediMaster.master.url, false);
}

function appendApprentice(jediMasterUrl, removeObsolete){
    _activeRequest = $.ajax({
        url: jediMasterUrl,
        dataType: 'json',
        cache: false,
        success: function(data) {
            _jedi.push(data);
            if(removeObsolete){
                _jedi.shift();
            }
            if(_pendingRequestsCount-- > 1) {
                appendApprentice(data.apprentice.url, removeObsolete);
            }else{
                JediStore.emitChange();
            }
        }.bind(this),
        error: function(xhr, status, err) {
            console.error(jediMasterUrl, status, err.toString());
        }.bind(this)
    });
}

function appendMaster(jediMasterUrl, removeObsolete){
    _activeRequest = $.ajax({
        url: jediMasterUrl,
        dataType: 'json',
        cache: false,
        success: function(data) {
            _jedi.unshift(data);
            if(removeObsolete){
                _jedi.pop();
            }
            if(_pendingRequestsCount-- > 1) {
                appendMaster(data.master.url, removeObsolete);
            }else{
                if(_jedi.length != AppConstants.ROWS_AMOUNT){
                    for(var i=AppConstants.ROWS_AMOUNT-_jedi.length; i != 0; i--){
                        _jedi.push(null);
                    }
                }
                JediStore.emitChange();
            }
        }.bind(this),
        error: function(xhr, status, err) {
            console.error(jediMasterUrl, status, err.toString());
        }.bind(this)
    });
}

function scrollJediList(direction){
    if(direction){
        appendMaster(_jedi[0].master.url, true);
    }else{
        appendApprentice(_jedi[_jedi.length-1].apprentice.url, true);
    }
    JediStore.emitChange();
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
    JediStore.emitChange();
}

var JediStore = assign({}, EventEmitter.prototype, {
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    getDisabledBtns: function(){
        return {
            scrollUp: (_jedi[0] == null || _jedi[0].master.url == null),
            scrollDown: (_jedi[_jedi.length-1] == null || _jedi[_jedi.length-1].master.url == null)
        };
    },

    getLocalJedi: function(){
        return _localJedi;
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    getAll: function() {
        return _jedi;
    }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
    switch(action.actionType) {
        case AppConstants.JEDI_POPULATE_LIST:
            jediMaster = action.jediMaster.data;
            populateJediList(jediMaster);
            break;
        case AppConstants.JEDI_SCROLLUP:
            scrollJediList(true);
            break;
        case AppConstants.JEDI_SCROLLDOWN:
            scrollJediList(false);
            break;
        case AppConstants.JEDI_MOVED_TO_PLANET:
            findLocalJedies(action.currentPlanet);
            break;
        default:
            // no op
    }
});

module.exports = JediStore;
