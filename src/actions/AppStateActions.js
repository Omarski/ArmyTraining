var AppDispatcher = require('../dispatcher/AppDispatcher');
var AppStateConstants = require('../constants/AppStateConstants');

var AppStateActions = {

    sizeChange: function(data) {
        AppDispatcher.dispatch({
            actionType: AppStateConstants.APP_STATE_SIZE_CHANGE,
            data: data
        });
    }

};

module.exports = AppStateActions;