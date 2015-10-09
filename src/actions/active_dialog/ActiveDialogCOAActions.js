var AppDispatcher = require('../../dispatcher/AppDispatcher');
var ActiveDialogCOAConstants = require('../../constants/active_dialog/ActiveDialogCOAConstants');

var ActiveDialogCOAActions = {

    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogCOAConstants.ACTIVE_DIALOG_COA_CREATE,
            data: data
        });
    },

    /**
     * @param  {string} id
     */
    destroy: function() {
        AppDispatcher.dispatch({
            actionType: ActiveDialogCOAConstants.ACTIVE_DIALOG_COA_DESTROY
        });
    }

};

module.exports = ActiveDialogCOAActions;