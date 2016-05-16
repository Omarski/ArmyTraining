var AppDispatcher = require('../dispatcher/AppDispatcher');
var ConfigConstants = require('../constants/ConfigConstants');

var ConfigActions = {

    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: ConfigConstants.CONFIG_CREATE,
            data: data
        });
    },

    /**
     * Triggers ConfigStore to read relevant .json data from files
     */
    load: function(){
        AppDispatcher.dispatch({
            actionType: ConfigConstants.CONFIG_LOAD
        });
    },

    loadComplete: function(){
        AppDispatcher.dispatch({
            actionType: ConfigConstants.CONFIG_LOAD_COMPLETE
        });
    },

    destroy: function(id) {
        AppDispatcher.dispatch({
            actionType: ConfigConstants.CONFIG_DESTROY,
            id: id
        });
    }

};

module.exports = ConfigActions;