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

var _jedi = [];
var localJedi;

function populateJediList(jediMaster) {
    var startIndex = AppConstants.ROWS_AMOUNT % 2 ? Math.ceil(AppConstants.ROWS_AMOUNT / 2) : Math.floor(AppConstants.ROWS_AMOUNT / 2);
    _jedi.push(jediMaster);
    appendApprentice(jediMaster.apprentice.url, startIndex-1, false);
    appendMaster(jediMaster.master.url, startIndex-1, false);
}

function appendApprentice(jediMasterUrl, index, removeObsolete){
    _pending = $.ajax({
        url: jediMasterUrl,
        dataType: 'json',
        cache: false,
        success: function(data) {
            _jedi.push(data);
            if(removeObsolete){
                _jedi.shift();
            }
            if(index > 1) {
                appendApprentice(data.apprentice.url, --index, removeObsolete);
            }else{
                JediStore.emitChange();
            }
        }.bind(this),
        error: function(xhr, status, err) {
            console.error(jediMasterUrl, status, err.toString());
        }.bind(this)
    });
}

function appendMaster(jediMasterUrl, index, removeObsolete){
    _pending = $.ajax({
        url: jediMasterUrl,
        dataType: 'json',
        cache: false,
        success: function(data) {
            _jedi.unshift(data);
            if(removeObsolete){
                _jedi.pop();
            }
            if(index > 1) {
                appendMaster(data.master.url, --index, removeObsolete);
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
    if(direction){
        appendMaster(_jedi[0].master.url, AppConstants.SCROLL_PER_CLICK, true);
    }else{
        appendApprentice(_jedi[_jedi.length-1].apprentice.url, AppConstants.SCROLL_PER_CLICK, true);
    }
    JediStore.emitChange();
}

function findLocalJedies(planet){
    localJedi = null;
    for(var i=0; i < _jedi.length; i++){
        if(_jedi[i].homeworld.id == planet.id){
            localJedi = _jedi[i].id;
            break;
        }
    }
    JediStore.emitChange();
}

var JediStore = assign({}, EventEmitter.prototype, {
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    getLocalJedi: function(){
        return localJedi;
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
