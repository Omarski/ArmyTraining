var AppDispatcher = require('../dispatcher/AppDispatcher');
var BookConstants = require('../constants/BookConstants');

var BookActions = {

    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: BookConstants.BOOK_CREATE,
            data: data
        });
    },

    /**
     * @param  {string} id The ID of the Book item
     * @param  {string} text
     */
    updateText: function(id, text) {
        AppDispatcher.dispatch({
            actionType: BookConstants.BOOK_UPDATE_TEXT,
            id: id,
            text: text
        });
    },

    /**
     * Toggle whether a single Book is complete
     * @param  {object} book
     */
    toggleComplete: function(book) {
        var id = book.id;
        var actionType = book.complete ?
            BookConstants.BOOK_UNDO_COMPLETE :
            BookConstants.BOOK_COMPLETE;

        AppDispatcher.dispatch({
            actionType: actionType,
            id: id
        });
    },

    /**
     * Mark all Books as complete
     */
    toggleCompleteAll: function() {
        AppDispatcher.dispatch({
            actionType: BookConstants.BOOK_TOGGLE_COMPLETE_ALL
        });
    },

    /**
     * @param  {string} id
     */
    destroy: function(id) {
        AppDispatcher.dispatch({
            actionType: BookConstants.BOOK_DESTROY,
            id: id
        });
    },

    /**
     * Delete all the completed Books
     */
    destroyCompleted: function() {
        AppDispatcher.dispatch({
            actionType: BookConstants.BOOK_DESTROY_COMPLETED
        });
    }

};

module.exports = BookActions;