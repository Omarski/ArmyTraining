var AppDispatcher = require('../dispatcher/AppDispatcher');
var BookmarkConstants = require('../constants/BookmarkConstants');

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
        AppDispatcher.dispatch({
            actionType: BookmarkConstants.BOOKMARK_CREATE,
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