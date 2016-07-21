var AppDispatcher = require('../dispatcher/AppDispatcher');
var FooterConstants = require('../constants/FooterConstants');

var FooterActions = {
    disableAll: function() {
        AppDispatcher.dispatch({
            actionType: FooterConstants.FOOTER_DISABLE_ALL
        });
    },
    disableNext: function() {
        AppDispatcher.dispatch({
            actionType: FooterConstants.FOOTER_DISABLE_NEXT
        });
    },
    disabledPrevious: function() {
        AppDispatcher.dispatch({
            actionType: FooterConstants.FOOTER_DISABLE_PREV
        });
    },
    enableAll: function() {
        AppDispatcher.dispatch({
            actionType: FooterConstants.FOOTER_ENABLE_ALL
        });
    },
    enableNext: function() {
        AppDispatcher.dispatch({
            actionType: FooterConstants.FOOTER_ENABLE_NEXT
        });
    },
    enablePrevious: function() {
        AppDispatcher.dispatch({
            actionType: FooterConstants.FOOTER_ENABLE_PREV
        });
    }
};

module.exports = FooterActions;