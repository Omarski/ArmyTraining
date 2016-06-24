var AppDispatcher = require('../dispatcher/AppDispatcher');
var NotificationConstants = require('../constants/NotificationConstants');

var NotificationActions = {

    /**
     * @param  {string} text
     */
    show: function(data) {
        AppDispatcher.dispatch({
            actionType: NotificationConstants.NOTIFICATION_SHOW,
            data: data
        });
    },
    hide: function(data) {
        AppDispatcher.dispatch({
            actionType: NotificationConstants.NOTIFICATION_HIDE,
            data: data
        });
    },
    updateTitle: function(data) {
        AppDispatcher.dispatch({
            actionType: NotificationConstants.NOTIFICATION_UPDATE_TITLE,
            data: data
        });
    },
    updateBody: function(data) {
        AppDispatcher.dispatch({
            actionType: NotificationConstants.NOTIFICATION_UPDATE_BODY,
            data: data
        });
    },
    updatePercent: function(data) {
        AppDispatcher.dispatch({
            actionType: NotificationConstants.NOTIFICATION_UPDATE_PERCENT,
            data: data
        });
    },
    updateImage: function(data) {
        AppDispatcher.dispatch({
            actionType: NotificationConstants.NOTIFICATION_UPDATE_IMAGE,
            data: data
        });
    }
};

module.exports = NotificationActions;