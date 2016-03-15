/**
 * Created by Alec on 3/9/2016.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ConfigConstants = require('../constants/ConfigConstants');
var PageStore = require('../stores/PageStore');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var _data = {};

function create(data) {
    _data = {
        objectives: data
    }
}

function destroy() {

}

var _needsASR = false;


var ConfigStore = assign({}, EventEmitter.prototype, {

    data: function() {
        return _data;
    },

    loadConfig: function() {
        // read in config file and store in memeory
    },

    isASREnabled: function(){
        return _needsASR;
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
        case ConfigConstants.ACTIVE_DIALOG_OBJECTIVE_CREATE:
            create(action.data);
            ConfigStore.emitChange();
            break;
        case ConfigConstants.ACTIVE_DIALOG_OBJECTIVE_DESTROY:
            destroy();
            ConfigStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ConfigStore;
window.ConfigStore = ConfigStore;