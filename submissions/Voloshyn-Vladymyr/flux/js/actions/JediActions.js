/**
 * User: Voloshyn Vladymyr
 * Date: 2015.11.19
 * Time: 11:11
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var AppConstants = require('../constants/AppConstants');

var JediActions = {

    moveToPlanet: function(data) {
        AppDispatcher.dispatch({
            actionType: AppConstants.JEDI_MOVED_TO_PLANET,
            currentPlanet: data
        });
    },

    populateJediList: function(jediMaster) {
        AppDispatcher.dispatch({
            actionType: AppConstants.JEDI_POPULATE_LIST,
            jediMaster: jediMaster
        });
    },

    scrollUp: function(id, text) {
        AppDispatcher.dispatch({
            actionType: AppConstants.JEDI_SCROLLUP
        });
    },

    scrollDown: function(id, text) {
        AppDispatcher.dispatch({
            actionType: AppConstants.JEDI_SCROLLDOWN
        });
    },

};

module.exports = JediActions;
