var AppDispatcher = require('../dispatcher/AppDispatcher');
var ReferenceConstants = require('../constants/ReferenceConstants');

var ReferenceActions = {

    /**
     * @param  {string} text
     */
    complete: function(data) {
        AppDispatcher.dispatch({
            actionType: ReferenceConstants.REFERENCE_COMPLETE,
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