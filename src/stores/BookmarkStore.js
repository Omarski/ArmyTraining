var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var BookmarkConstants = require('../constants/BookmarkConstants');
var PersistenceActions = require('../actions/PersistenceActions');
var PersistenceStore = require('../stores/PersistenceStore');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';

function setCurrent(data) {
    var bm = PersistenceStore.getBookmark();
    var obj = {};
    if (bm) {
        obj.current = data;
        obj.bookmarks = bm.bookmarks;
    } else {
        obj['current'] = data;
        obj['bookmarks'] = [];
    }

    setTimeout(function() {
        PersistenceActions.setBookmark(obj);
    }, 0.1);
}


function create(data) {
    var bm = PersistenceStore.getBookmark();
    var obj = {};
    if (bm) {
        obj.current = data;
        obj.bookmarks = bm.bookmarks;
        obj.bookmarks.push(data);
    } else {
        obj['current'] = data;
        obj['bookmarks'] = [data];
    }

    setTimeout(function() {
        PersistenceActions.setBookmark(obj);
    }, 0.1);
    //"in bookmark update"
}

function destroy() {
    setTimeout(function() {
        PersistenceActions.removeBookmark()
    }, 0.1);
}

function remove(item) {
    var bm = PersistenceStore.getBookmark();
    if (bm) {
        var bookmarks = bm.bookmarks;
        var len = bookmarks.length;
        var newBookmarks = [];
        for (var i = 0; i < len; i++) {
            var existingBookmark = bookmarks[i];
            if (existingBookmark.page !== item.page) {
                newBookmarks.push(existingBookmark);
            }
        }
        bm.bookmarks = newBookmarks;
    }
    setTimeout(function() {
        PersistenceActions.setBookmark(bm);
    }, 0.1);
}

var BookmarkStore = assign({}, EventEmitter.prototype, {

    current: function() {
        var bm = PersistenceStore.getBookmark();
        return (bm) ? bm.current : null;
    },

    bookmarks: function() {
        var bm = PersistenceStore.getBookmark();
        return (bm) ? bm.bookmarks : null;
    },

    bookmarkExists: function(data) {
        var bm = PersistenceStore.getBookmark();
        var bookmarks = bm.bookmarks;
        var len = bookmarks.length;
        while (len--) {
            var existingBookmark = bookmarks[len];
            if (data.page === existingBookmark.page) {
                return true;
            }
        }
        return false;
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
            //BookmarkStore.emitChange();
            break;
        case BookmarkConstants.BOOKMARK_CREATE:
            create(action.data);
            BookmarkStore.emitChange();
            break;
        case BookmarkConstants.BOOKMARK_REMOVE:
            remove(action.data);
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