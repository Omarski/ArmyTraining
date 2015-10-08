var AppDispatcher = require('../../dispatcher/AppDispatcher');
var ActiveDialogObjectiveConstants = require('../../constants/active_dialog/ActiveDialogObjectiveConstants');

var ActiveDialogObjectiveActions = {

    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogObjectiveConstants.ACTIVE_DIALOG_OBJECTIVE_CREATE,
            data: data
        });
    },

    /**
     * @param  {string} id
     */
    destroy: function() {
        AppDispatcher.dispatch({
            actionType: ActiveDialogObjectiveConstants.ACTIVE_DIALOG_OBJECTIVE_DESTROY
        });
    }

};

module.exports = ActiveDialogObjectiveActions;