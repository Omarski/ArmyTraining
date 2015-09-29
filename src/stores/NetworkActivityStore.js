var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var NetworkActivityConstants = require('../constants/NetworkActivityConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';
var _data = [];

function create(data) {
    _data.push(data);
}

function destroy() {
    _data = [];
}


var NetworkActivityStore = assign({}, EventEmitter.prototype, {

    data: function() {
        return _data;
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
        case NetworkActivityConstants.NETWORK_ACTIVITY_CREATE:
            create(action.data);
            NetworkActivityStore.emitChange();
            break;
        case NetworkActivityConstants.NETWORK_ACTIVITY_DESTROY:
            destroy();
            NetworkActivityStore.emitChange();
            break;
        default:
        // no op
    }
});


module.exports = NetworkActivityStore;