var AppDispatcher = require('../dispatcher/AppDispatcher');
var ExplorerConstants = require('../constants/ExplorerConstants');

var ExplorerActions = {

    /**
     * @param  {string} text
     */
    show: function(data) {
        AppDispatcher.dispatch({
            actionType: ExplorerConstants.EXPLORER_SHOW,
            data: data
        });
    },
    hide: function(data) {
        AppDispatcher.dispatch({
            actionType: ExplorerConstants.EXPLORER_HIDE,
            data: data
        });
    }
};

module.exports = ExplorerActions;