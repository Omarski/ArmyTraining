var AppDispatcher = require('../dispatcher/AppDispatcher');
var SettingsConstants = require('../constants/SettingsConstants');

var SettingsActions = {

    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: SettingsConstants.SETTINGS_CREATE,
            data: data
        });
    },



    /**
     * @param  {string} id
     */
    destroy: function(id) {
        AppDispatcher.dispatch({
            actionType: SettingsConstants.SETTINGS_DESTROY,
            id: id
        });
    }

};

module.exports = SettingsActions;