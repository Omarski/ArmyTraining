/**
 * Created by Alec on 5/31/2016.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var DliConstants = require('../constants/DliConstants');

var DliActions = {
    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: DliConstants.DLI_CREATE,
            data: data
        });
    },

    /**
     * Triggers DliStore to read relevant .json data from files
     */
    load: function(){
        AppDispatcher.dispatch({
            actionType: DliConstants.DLI_LOAD
        });
    },

    loadComplete: function(){
        AppDispatcher.dispatch({
            actionType: DliConstants.DLI_LOAD_COMPLETE
        });
    },

    destroy: function(id) {
        AppDispatcher.dispatch({
            actionType: DliConstants.DLI_DESTROY,
            id: id
        });
    }
};

module.exports = DliActions;