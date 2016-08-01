var AppDispatcher = require('../dispatcher/AppDispatcher');
var DevToolsConstants = require('../constants/DevToolsConstants');

var DevToolsActions = {
    clearLog: function() {
        AppDispatcher.dispatch({
            actionType: DevToolsConstants.DEV_TOOLS_LOG_CLEAR
        });
    },

    log: function(data) {
        AppDispatcher.dispatch({
            actionType: DevToolsConstants.DEV_TOOLS_LOG,
            data: data
        });
    },
    show: function(data) {
        AppDispatcher.dispatch({
            actionType: DevToolsConstants.DEV_TOOLS_SHOW,
            data: data
        });
    },
    hide: function(data) {
        AppDispatcher.dispatch({
            actionType: DevToolsConstants.DEV_TOOLS_HIDE,
            data: data
        });
    }
};

module.exports = DevToolsActions;