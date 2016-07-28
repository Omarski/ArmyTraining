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
    create: function(jsonData, infoData) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_CREATE,
            data: jsonData,
            info: infoData
        });
    },

    /**
     * Resets the ActiveDialog data
     */
    destroy: function() {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_DESTROY
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
     * @param data
     */
    hintsShown: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_HINTS_SHOWN,
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
     * Restart dialog
     */
    restart: function() {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_RESTART
        });
    },

    /**
     * Show the remediation panel
     */
    showRemediation: function() {
        AppDispatcher.dispatch({
            actionType: ActiveDialogConstants.ACTIVE_DIALOG_SHOW_REMEDIATION
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
    }
};

module.exports = ActiveDialogActions;