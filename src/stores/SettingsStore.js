var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var SettingsConstants = require('../constants/SettingsConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';


function create(data) {
    store.set('settings', data);
}

function destroy() {
    store.remove('settings');
}

var SettingsStore = assign({}, EventEmitter.prototype, {

    settings: function() {
        return store.get('settings');
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
        default:
        // no op
    }
});

module.exports = SettingsStore;