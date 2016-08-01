var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var DevToolsConstants = require('../constants/DevToolsConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';
var _visible = false;
var _console = [];

function show() {
    _visible = true;
    $('#devToolsView').modal('show');
}

function hide() {
    _visible = false;
    if ($('#devToolsView').modal) {
        $('#devToolsView').modal('hide');
    }
}

function log(data) {
    _console.push(data);
}

function clearLog() {
    _console = [];
}

var DevToolsStore = assign({}, EventEmitter.prototype, {

    isVisible: function() {
        return _visible;
    },

    console: function() {
        return _console;
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
        case DevToolsConstants.DEV_TOOLS_LOG_CLEAR:
            clearLog();
            DevToolsStore.emitChange();
            break;
        case DevToolsConstants.DEV_TOOLS_LOG:
            log(action.data);
            DevToolsStore.emitChange();
            break;
        case DevToolsConstants.DEV_TOOLS_SHOW:
            show(action.data);
            DevToolsStore.emitChange();
            break;
        case DevToolsConstants.DEV_TOOLS_HIDE:
            hide();
            DevToolsStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = DevToolsStore;