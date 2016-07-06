var AppDispatcher = require('../dispatcher/AppDispatcher');
var RemediationConstants = require('../constants/RemediationConstants');

var RemediationActions = {
    /**
     * @param {array} data - Ordered array of pages that will be loaded into the Remediation
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: RemediationConstants.REMEDIATION_CREATE,
            data: data
        });
    },

    destroy: function() {
        AppDispatcher.dispatch({
            actionType: RemediationConstants.REMEDIATION_DESTROY
        });
    },

    /**
     * Event that is dispatched when a page has completed loading
     */
    loadComplete: function() {
        AppDispatcher.dispatch({
            actionType: RemediationConstants.REMEDIATION_LOAD_COMPLETE
        });
    },

    /**
     * Triggers RemediationStore to load the next page
     */
    loadNext: function(){
        AppDispatcher.dispatch({
            actionType: RemediationConstants.REMEDIATION_LOAD_NEXT
        });
    },

    /**
     * Triggers RemediationStore to load the next page
     */
    loadPrev: function(){
        AppDispatcher.dispatch({
            actionType: RemediationConstants.REMEDIATION_LOAD_PREV
        });
    }


};

module.exports = RemediationActions;