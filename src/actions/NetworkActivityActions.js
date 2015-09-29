var AppDispatcher = require('../dispatcher/AppDispatcher');
var NetworkActivityConstants = require('../constants/NetworkActivityConstants');

var NetworkActivityActions = {

    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: NetworkActivityConstants.NETWORK_ACTIVITY_CREATE,
            data: data
        });
    },



    /**
     * @param  {string} id
     */
    destroy: function() {
        AppDispatcher.dispatch({
            actionType: NetworkActivityConstants.NETWORK_ACTIVITY_DESTROY
        });
    }

};

module.exports = NetworkActivityActions;