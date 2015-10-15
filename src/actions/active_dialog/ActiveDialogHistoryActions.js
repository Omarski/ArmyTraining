var AppDispatcher = require('../../dispatcher/AppDispatcher');
var ActiveDialogHistoryConstants = require('../../constants/active_dialog/ActiveDialogHistoryConstants');

var ActiveDialogHistoryActions = {

    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogHistoryConstants.ACTIVE_DIALOG_HISTORY_CREATE,
            data: data
        });
    },

    /**
     * @param  {string} id
     */
    destroy: function() {
        AppDispatcher.dispatch({
            actionType: ActiveDialogHistoryConstants.ACTIVE_DIALOG_HISTORY_DESTROY
        });
    }

};

module.exports = ActiveDialogHistoryActions;