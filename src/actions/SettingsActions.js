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
    
    voiceVolumeStepUp: function(){
        AppDispatcher.dispatch({
            actionType: SettingsConstants.SETTINGS_VOICE_VOLUME_STEP_UP
        });
    },
    
    voiceVolumeStepDown: function(){
        AppDispatcher.dispatch({
            actionType: SettingsConstants.SETTINGS_VOICE_VOLUME_STEP_DOWN
        });
    },
    
    backgroundVolumeStepUp: function(){
        AppDispatcher.dispatch({
            actionType: SettingsConstants.SETTINGS_BACKGROUND_VOLUME_STEP_UP
        });
    },
    
    backgroundVolumeStepDown: function(){
        AppDispatcher.dispatch({
            actionType: SettingsConstants.SETTINGS_BACKGROUND_VOLUME_STEP_DOWN
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
    },

    toggleLessonIDs: function() {
        AppDispatcher.dispatch({
            actionType: SettingsConstants.SETTINGS_TOGGLE_IDS
        });
    },

    updateAutoPlaySound: function(data) {
        AppDispatcher.dispatch({
            actionType: SettingsConstants.SETTINGS_UPDATE_AUTO_PLAY_SOUND,
            data: data
        });
    },

    updateBackgroundVolume: function(data) {
        AppDispatcher.dispatch({
            actionType: SettingsConstants.SETTINGS_UPDATE_BACKGROUND_VOLUME,
            data: data
        });
    },

    updateMuted: function(data) {
        AppDispatcher.dispatch({
            actionType: SettingsConstants.SETTINGS_UPDATE_MUTED,
            data: data
        });
    },

    updateVoiceVolume: function(data) {
        AppDispatcher.dispatch({
            actionType: SettingsConstants.SETTINGS_UPDATE_VOICE_VOLUME,
            data: data
        });
    }
};

module.exports = SettingsActions;