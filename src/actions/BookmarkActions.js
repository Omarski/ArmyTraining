var AppDispatcher = require('../dispatcher/AppDispatcher');
var BookmarkConstants = require('../constants/BookmarkConstants');
var BookmarkStore = require('../stores/BookmarkStore');
var LocalizationStore = require('../stores/LocalizationStore');
var NotificationActions = require('../actions/NotificationActions');

var BookmarkActions = {

    /**
     * @param  {string} text
     */
    setCurrent: function(data) {
        AppDispatcher.dispatch({
            actionType: BookmarkConstants.BOOKMARK_SET_CURRENT,
            data: data
        });
    },

    /**
     * @param  {string} text
     */
    create: function(data) {
        var existingBookmarks = BookmarkStore.bookmarks();
        if (existingBookmarks.length >= 5) {
            NotificationActions.show({
                title: LocalizationStore.labelFor("bookmarks", "lblTitle"),
                body: LocalizationStore.labelFor("bookmarks", "lblLimitWarning"),
                allowDismiss: true,
                percent: "",
                image: null
            });
        } else if (BookmarkStore.bookmarkExists(data)) {
            NotificationActions.show({
                title: LocalizationStore.labelFor("bookmarks", "lblTitle"),
                body: LocalizationStore.labelFor("bookmarks", "lblExistsWarning"),
                allowDismiss: true,
                percent: "",
                image: null
            });
        } else {
            AppDispatcher.dispatch({
                actionType: BookmarkConstants.BOOKMARK_CREATE,
                data: data
            });
        }
    },

    /**
     * @param  {string} text
     */
    remove: function(data) {
        AppDispatcher.dispatch({
            actionType: BookmarkConstants.BOOKMARK_REMOVE,
            data: data
        });
    },

    /**
     * @param  {string} id
     */
    destroy: function() {
        AppDispatcher.dispatch({
            actionType: BookmarkConstants.BOOKMARK_DESTROY
        });
    }

};

module.exports = BookmarkActions;