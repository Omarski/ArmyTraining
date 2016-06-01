var AppDispatcher = require('../dispatcher/AppDispatcher');
var LocalizationConstants = require('../constants/LocalizationConstants');

var LocalizationActions = {

    create: function(data) {
        AppDispatcher.dispatch({
            actionType: LocalizationConstants.LOCALIZATION_CREATE,
            data: data
        });
    },

    load: function(){
        AppDispatcher.dispatch({
            actionType: LocalizationConstants.LOCALIZATION_LOAD
        });
    },

    loadComplete: function(){
        AppDispatcher.dispatch({
            actionType: LocalizationConstants.LOCALIZATION_LOAD_COMPLETE
        });
    }
};

module.exports = LocalizationActions;