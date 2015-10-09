var AppDispatcher = require('../../dispatcher/AppDispatcher');
var ActiveDialogHintConstants = require('../../constants/active_dialog/ActiveDialogHintConstants');

var ActiveDialogHintActions = {

    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogHintConstants.ACTIVE_DIALOG_HINT_CREATE,
            data: data
        });
    },

    /**
     * @param  {string} id
     */
    destroy: function() {
        AppDispatcher.dispatch({
            actionType: ActiveDialogHintConstants.ACTIVE_DIALOG_HINT_DESTROY
        });
    }

};

module.exports = ActiveDialogHintActions;