var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var BookmarkConstants = require('../constants/BookmarkConstants');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';

function setCurrent(data) {
    var bm = store.get('bookmark');
    var obj = {};
    if (bm) {
        obj.current = data;
        obj.bookmarks = bm.bookmarks;
    } else {
        obj['current'] = data;
        obj['bookmarks'] = [];
    }
    store.set('bookmark', obj);
}


function create(data) {
    var bm = store.get('bookmark');
    var obj = {};
    if (bm) {
        obj.current = data;
        obj.bookmarks = bm.bookmarks;
        obj.bookmarks.push(data);
    } else {
        obj['current'] = data;
        obj['bookmarks'] = [data];
    }

    store.set('bookmark', obj);
}

function destroy() {
    store.remove('bookmark');
}

var BookmarkStore = assign({}, EventEmitter.prototype, {

    current: function() {
        var bm = store.get('bookmark');
        return (bm) ? bm.current : null;
    },

    bookmarks: function() {
        var bm = store.get('bookmark');
        return (bm) ? bm.bookmarks : null;
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
        case BookmarkConstants.BOOKMARK_SET_CURRENT:
            setCurrent(action.data);
            BookmarkStore.emitChange();
            break;
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