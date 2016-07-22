var AppDispatcher = require('../dispatcher/AppDispatcher');
var PageConstants = require('../constants/PageConstants');

var PageActions = {

    /**
     * @param  {map} data
     */
    answer: function(data) {
        AppDispatcher.dispatch({
            actionType: PageConstants.PAGE_ANSWER,
            data: data
        });
    },
    /**
     * @param  {string} text
     */
    complete: function(data) {
        AppDispatcher.dispatch({
            actionType: PageConstants.PAGE_COMPLETE,
            data: data
        });
    },
    load: function(data) {
        AppDispatcher.dispatch({
            actionType: PageConstants.PAGE_LOAD,
            data: data
        });
    },
    loadNext: function(data) {
        AppDispatcher.dispatch({
            actionType: PageConstants.PAGE_LOAD_NEXT,
            data: data
        });
    },
    loadPrevious: function(data) {
        AppDispatcher.dispatch({
            actionType: PageConstants.PAGE_LOAD_PREVIOUS,
            data: data
        });
    },
    /**
     * Marks the current chapter complete
     */
    markChapterComplete: function() {
        AppDispatcher.dispatch({
            actionType: PageConstants.CHAPTER_MARK_COMPLETE
        });
    },
    jump: function(data) {
        AppDispatcher.dispatch({
            actionType: PageConstants.PAGE_JUMP,
            data: data
        });
    },
    reset: function() {
        AppDispatcher.dispatch({
            actionType: PageConstants.PAGE_RESET
        });
    },

    /**
     * Resets current sections quiz answers
     */
    resetQuiz: function() {
        AppDispatcher.dispatch({
            actionType: PageConstants.QUIZ_RESET
        });
    },

    /**
     * Restart the current sections quiz and jumps to the start of it
     */
    restartQuiz: function() {
        AppDispatcher.dispatch({
            actionType: PageConstants.QUIZ_RESTART
        });
    }
};

module.exports = PageActions;