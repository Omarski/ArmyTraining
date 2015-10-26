var AppDispatcher = require('../../dispatcher/AppDispatcher');
var ActiveDialogIntroConstants = require('../../constants/active_dialog/ActiveDialogIntroConstants');

var ActiveDialogIntroActions = {

    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogIntroConstants.ACTIVE_DIALOG_INTRO_CREATE,
            data: data
        });
    },

    /**
     * @param  {string} id
     */
    destroy: function() {
        AppDispatcher.dispatch({
            actionType: ActiveDialogIntroConstants.ACTIVE_DIALOG_INTRO_DESTROY
        });
    }

};

module.exports = ActiveDialogIntroActions;