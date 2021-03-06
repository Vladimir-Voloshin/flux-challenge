/**
 * User: Voloshyn Vladymyr
 * Date: 2015.11.19
 * Time: 11:11
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var AppConstants = require('../constants/AppConstants');

var JediActions = {

    handleError: function(error) {
        AppDispatcher.dispatch({
            actionType: AppConstants.JEDI_REQUEST_ERROR,
            error: error
        });
    },

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

    scrollJediList: function(direction) {
        AppDispatcher.dispatch({
            actionType: AppConstants.JEDI_SCROLL_LIST,
            direction: direction
        });
    }

};

module.exports = JediActions;
