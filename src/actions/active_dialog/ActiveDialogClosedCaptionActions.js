var AppDispatcher = require('../../dispatcher/AppDispatcher');
var ActiveDialogClosedCaptionConstants = require('../../constants/active_dialog/ActiveDialogClosedCaptionConstants');

var ActiveDialogClosedCaptionActions = {
    update: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogClosedCaptionConstants.CLOSED_CAPTION_UPDATE_TRANSCRIPT,
            data: data
        });
    },
    show: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogClosedCaptionConstants.CLOSED_CAPTION_SHOW,
            data: data
        });
    },

    hide: function(data) {
        AppDispatcher.dispatch({
            actionType: ActiveDialogClosedCaptionConstants.CLOSED_CAPTION_HIDE,
            data: data
        });
    }
};

module.exports = ActiveDialogClosedCaptionActions;