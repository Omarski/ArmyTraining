var AppDispatcher = require('../../dispatcher/AppDispatcher');
var ActiveDialogConstants = require('../../constants/active_dialog/ActiveDialogConstants');
var ActiveDialogStore = require('../../stores/active_dialog/ActiveDialogStore');

var ActiveDialogActions = {

    /**
     * Continues processing of dialog action queue
     */
    continueDialog: function() {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_CONTINUE_DIALOG
        });
    },

    /**
     * @param  {string} data
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_CREATE,
            data: data
        });
    },

    /**
     * @param  {string} data
     */
    handleInput: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_HANDLE_INPUT,
            data: data
        });
    },

    /**
     * @param  {string} data
     */
    load: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_LOAD,
            data: data
        });
    },

    /**
     * @param  {string} data
     */
    setActiveCOA: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_SET_ACTIVE_COA,
            data: data
        });
    },

    /**
     * Start processing the dialog
     */
    startDialog: function() {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_START_DIALOG
        });
    },

    /**
     * @param data
     */
    hintsShown: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_HINTS_SHOWN,
            data: data
        });
    },

    /**
     * Resets the ActiveDialog data
     */
    destroy: function() {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_DESTROY
        });
    }

};

module.exports = ActiveDialogActions;