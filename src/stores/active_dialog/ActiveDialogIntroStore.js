var AppDispatcher = require('../../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActiveDialogIntroConstants = require('../../constants/active_dialog/ActiveDialogIntroConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var _data = {};

function create(data) {
    _data = data;
}

function destroy() {

}

var ActiveDialogIntroStore = assign({}, EventEmitter.prototype, {

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
        case ActiveDialogIntroConstants.ACTIVE_DIALOG_INTRO_CREATE:
            create(action.data);
            ActiveDialogIntroStore.emitChange();
            break;
        case ActiveDialogIntroConstants.ACTIVE_DIALOG_INTRO_DESTROY:
            destroy();
            ActiveDialogIntroStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = ActiveDialogIntroStore;