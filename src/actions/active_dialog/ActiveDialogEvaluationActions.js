var AppDispatcher = require('../../dispatcher/AppDispatcher');
var ActiveDialogEvaluationConstants = require('../../constants/active_dialog/ActiveDialogEvaluationConstants');

var ActiveDialogEvaluationActions = {

    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogEvaluationConstants.ACTIVE_DIALOG_EVALUATION_CREATE,
            data: data
        });
    },

    /**
     * @param  {string} id
     */
    destroy: function() {
        AppDispatcher.dispatch({
            actionType: ActiveDialogEvaluationConstants.ACTIVE_DIALOG_EVALUATION_DESTROY
        });
    }

};

module.exports = ActiveDialogEvaluationActions;