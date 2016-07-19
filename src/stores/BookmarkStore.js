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
    console.log("in bookmark update")
}

function destroy() {
    store.remove('bookmark');
}

function remove(item) {
    var bm = store.get('bookmark');
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
    store.set('bookmark', bm);

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

    bookmarkExists: function(data) {
        var bm = store.get('bookmark');
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