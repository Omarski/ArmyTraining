var AppDispatcher = require('../../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActiveDialogHintConstants = require('../../constants/active_dialog/ActiveDialogHintContstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var _data = [];

function create(data) {

}

function destroy() {

}

var ActiveDialogHintStore = assign({}, EventEmitter.prototype, {

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
        case ActiveDialogHintConstants.ACTIVE_DIALOG_HINT_CREATE:
            create(action.data);
            ActiveDialogHintStore.emitChange();
            break;
        case ActiveDialogHintConstants.ACTIVE_DIALOG_HINT_DESTROY:
            destroy();
            ActiveDialogHintStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ActiveDialogHintStore;