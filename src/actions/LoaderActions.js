var AppDispatcher = require('../dispatcher/AppDispatcher');
var LoaderConstants = require('../constants/LoaderConstants');

var LoaderActions = {

    /**
     * @param  {string} text
     */
    complete: function(data) {
        AppDispatcher.dispatch({
            actionType: LoaderConstants.LOADER_COMPLETE,
            data: data
        });
    },
    load: function(data) {
        AppDispatcher.dispatch({
            actionType: LoaderConstants.LOADER_LOAD,
            data: data
        });
    }



};

module.exports = LoaderActions;