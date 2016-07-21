var AppDispatcher = require('../dispatcher/AppDispatcher');
var ClosedCaptionConstants = require('../constants/ClosedCaptionConstants');

var ClosedCaptionActions = {
    show: function(data) {
        AppDispatcher.dispatch({
            actionType: ClosedCaptionConstants.CLOSED_CAPTION_SHOW,
            data: data
        });
    },

    hide: function(data) {
        AppDispatcher.dispatch({
            actionType: ClosedCaptionConstants.CLOSED_CAPTION_HIDE,
            data: data
        });
    }
};

module.exports = ClosedCaptionActions;