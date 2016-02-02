/**
* User: Voloshyn Vladymyr
* Date: 2015.11.19
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
var _scrollDirection;

function populateJediList(jediMaster) {
    _pendingRequestsCount = AppConstants.ROWS_AMOUNT % 2 ? Math.ceil(AppConstants.ROWS_AMOUNT / 2)-1 : Math.floor(AppConstants.ROWS_AMOUNT / 2)-1;
    _jedi.push(jediMaster);
    appendApprentice(jediMaster.apprentice.url, false);
}

function appendApprentice(jediMasterUrl, removeObsolete){
    if(jediMasterUrl == null && _pendingRequestsCount-- > 1) {
        for(var i=AppConstants.SCROLL_PER_CLICK; i != 0; i--){
            _jedi.push(null);
            _jedi.shift();
            _pendingRequestsCount = 0;
        }
        return;
    }

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

function appendMaster(jediMasterUrl, removeObsolete){
    if(jediMasterUrl == null && _pendingRequestsCount-- > 1) {
        for(var i=AppConstants.SCROLL_PER_CLICK; i != 0; i--){
            _jedi.unshift(null);
            _jedi.pop();
            _pendingRequestsCount = 0;
        }
        return;
    }

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
                JediStore.emitChange();
            }
        }.bind(this),
        error: function(xhr, status, err) {
            console.error(jediMasterUrl, status, err.toString());
        }.bind(this)
    });
}

function scrollJediList(direction){
    _pendingRequestsCount += AppConstants.SCROLL_PER_CLICK;

    if(_pendingRequestsCount > AppConstants.SCROLL_PER_CLICK){
        if(_scrollDirection != direction){
            _activeRequest.abort();
            _pendingRequestsCount = AppConstants.SCROLL_PER_CLICK;
        }else{
            return;
        }
    }

    _scrollDirection = direction;

    if(direction && _jedi[0] != null){
        appendMaster(_jedi[0].master.url, true);
    }else if(_jedi[_jedi.length-1] != null){
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
            scrollUp: ((_jedi[0] == null) || (_localJedi != null)),
            scrollDown: ((_jedi[_jedi.length-1] == null) || (_localJedi != null))
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
