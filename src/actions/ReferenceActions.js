var AppDispatcher = require('../dispatcher/AppDispatcher');
var ReferenceConstants = require('../constants/ReferenceConstants');

var ReferenceActions = {

    /**
     * @param  {string} text
     */
    loadComplete: function(data) {
        AppDispatcher.dispatch({
            actionType: ReferenceConstants.REFERENCE_LOAD_COMPLETE,
            data: data
        });
    },
    load: function(data) {
        AppDispatcher.dispatch({
            actionType: ReferenceConstants.REFERENCE_LOAD,
            data: data
        });
    }



};

module.exports = ReferenceActions;