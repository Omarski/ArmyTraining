var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActiveDialogConstants = require('../constants/ActiveDialogConstants');

var ActiveDialogActions = {

    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_CREATE,
            data: data
        });
    },

    /**
     * @param  {string} text
     */
    handleInput: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_HANDLE_INPUT,
            data: data
        });
    },

    /**
     * @param  {string} id
     */
    destroy: function() {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_DESTROY
        });
    }

};

module.exports = ActiveDialogActions;