var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var SettingsConstants = require('../constants/SettingsConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var _showLessonIDs = false;

function create(data) {
    store.set('settings', data);
}

function destroy() {
    store.remove('settings');
}

function toggleLessonIDs() {
    _showLessonIDs = !_showLessonIDs;
}

function updateVoiceVolume(val) {
    var settings = store.get('settings') || {};
    settings['voiceVolume'] = val;
    store.set('settings', settings);
}

function voiceVolumeStepUp(){
    var settings = store.get('settings') || {};
    settings['voiceVolume'] += 0.1;
    if(settings['voiceVolume'] >= 1.0){
        settings['voiceVolume'] = 1.0;
    }
    store.set('settings', settings);
}

function voiceVolumeStepDown(){
    var settings = store.get('settings') || {};
    settings['voiceVolume'] -= 0.1;
    if(settings['voiceVolume'] <= 0.0){
        settings['voiceVolume'] = 0.0;
    }
    store.set('settings', settings);
}

function updateBackgroundVolume(val) {
    var settings = store.get('settings') || {};
    settings['backgroundVolume'] = val;
    store.set('settings', settings);
}

function backgroundVolumeStepUp(){
    var settings = store.get('settings') || {};
    settings['backgroundVolume'] += 0.1;
    if(settings['backgroundVolume'] >= 1.0){
        settings['backgroundVolume'] = 1.0;
    }
    store.set('settings', settings);
}

function backgroundVolumeStepDown(){
    var settings = store.get('settings') || {};
    settings['backgroundVolume'] -= 0.1;
    if(settings['backgroundVolume'] <= 0.0){
        settings['backgroundVolume'] = 0.0;
    }
    store.set('settings', settings);
}

function updateAutoPlaySound(val) {
    var settings = store.get('settings') || {};
    settings['autoPlaySound'] = !settings['autoPlaySound'];
    store.set('settings', settings);
}

function updateMuted(val) {
    var settings = store.get('settings') || {};
    settings['muted'] = val;
    store.set('settings', settings);
}

var SettingsStore = assign({}, EventEmitter.prototype, {

    voiceVolume: function() {
        var v = 1.0;
        var settings = store.get('settings');
        if (settings && settings.voiceVolume) {
            v = settings.voiceVolume;
        }
        if(settings && settings.voiceVolume == 0){ // intentionally == instead of === because not sure if 0 or 0.0
            v = 0.0;
        }
        return v;
    },

    backgroundVolume: function() {
        var v = 1.0;
        var settings = store.get('settings');
        if (settings && settings.backgroundVolume) {
            v = settings.backgroundVolume;
        }
        if(settings && settings.backgroundVolume == 0){ // intentionally == instead of === because not sure if 0 or 0.0
            v = 0.0;
        }
        return v;
    },

    autoPlaySound: function() {
        var aps = true;
        var settings = store.get('settings');
        if (settings && settings.autoPlaySound === false) {
            aps = false;
        }
        return aps;
    },

    muted: function() {
        var aps = false;
        var settings = store.get('settings');
        if (settings && settings.muted) {
            aps = settings.muted;
        }
        return aps;
    },

    settings: function() {
        return store.get('settings');
    },

    showLessonIDs: function() {
        return _showLessonIDs;
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
    switch(action.actionType) {
        case SettingsConstants.SETTINGS_CREATE:
            create(action.data);
            SettingsStore.emitChange();
            break;
        case SettingsConstants.SETTINGS_DESTROY:
            destroy();
            SettingsStore.emitChange();
            break;
        case SettingsConstants.SETTINGS_TOGGLE_IDS:
            toggleLessonIDs();
            SettingsStore.emitChange();
            break;
        case SettingsConstants.SETTINGS_UPDATE_AUTO_PLAY_SOUND:
            updateAutoPlaySound(action.data);
            SettingsStore.emitChange();
            break;
        case SettingsConstants.SETTINGS_UPDATE_BACKGROUND_VOLUME:
            updateBackgroundVolume(action.data);
            SettingsStore.emitChange();
            break;
        case SettingsConstants.SETTINGS_UPDATE_MUTED:
            updateMuted(action.data);
            SettingsStore.emitChange();
            break;
        case SettingsConstants.SETTINGS_UPDATE_VOICE_VOLUME:
            updateVoiceVolume(action.data);
            SettingsStore.emitChange();
            break;
        case SettingsConstants.SETTINGS_VOICE_VOLUME_STEP_UP:
            voiceVolumeStepUp();
            SettingsStore.emitChange();
            break;
        case SettingsConstants.SETTINGS_VOICE_VOLUME_STEP_DOWN:
            voiceVolumeStepDown();
            SettingsStore.emitChange();
            break;
        case SettingsConstants.SETTINGS_BACKGROUND_VOLUME_STEP_UP:
            backgroundVolumeStepUp();
            SettingsStore.emitChange();
            break;
        case SettingsConstants.SETTINGS_BACKGROUND_VOLUME_STEP_DOWN:
            backgroundVolumeStepDown();
            SettingsStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = SettingsStore;