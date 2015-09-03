var AppDispatcher = require('../dispatcher/AppDispatcher');
var BookmarkConstants = require('../constants/BookmarkConstants');

var BookmarkActions = {

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
    destroy: function(id) {
        AppDispatcher.dispatch({
            actionType: BookmarkConstants.BOOKMARK_DESTROY,
            id: id
        });
    }

};

module.exports = BookmarkActions;