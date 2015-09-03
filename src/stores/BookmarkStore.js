var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var BookmarkConstants = require('../constants/BookmarkConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';


function create(data) {
    store.set('bookmark', data);
}

function destroy() {
    store.remove('bookmark');
}

var BookmarkStore = assign({}, EventEmitter.prototype, {

    bookmark: function() {
        return store.get('bookmark');
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
        case BookmarkConstants.BOOKMARK_CREATE:
            create(action.data);
            BookmarkStore.emitChange();
            break;
        case BookmarkConstants.BOOKMARK_DESTROY:
            destroy();
            BookmarkStore.emitChange();
            break;
        default:
        // no op
    }
});

module.exports = BookmarkStore;