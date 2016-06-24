var AppDispatcher = require('../dispatcher/AppDispatcher');
var PageActions = require('../actions/PageActions');
var PageStore = require('../stores/PageStore');
var PageTypeConstants = require('../constants/PageTypeConstants');
var QuestionnaireConstants = require('../constants/QuestionnaireConstants');

var QuestionnaireActions = {
    answer: function(data) {
        AppDispatcher.dispatch({
            actionType: QuestionnaireConstants.QUESTIONNAIRE_ANSWER,
            data: data
        });
    },

    /**
     * Reset saved questionnaire answers
     */
    reset: function() {
        AppDispatcher.dispatch({
            actionType: QuestionnaireConstants.QUESTIONNAIRE_RESET
        });
    },

    /**
     * Restart the quiz by resetting answers and jumping to start of questionnaire
     */
    restart: function() {
        // clear previous choices
        this.reset();

        // get current unit
        var currentUnit = PageStore.unit();

        // get current chapter
        var currentChapter = PageStore.chapter();

        // get pages in the current chapter
        var chapterPages = currentChapter.pages;
        var pageIndex = 0;

        // find the first questionnaire page type and jump to it
        while (pageIndex < chapterPages.length) {
            var page = chapterPages[pageIndex];
            if (page.type && page.type === PageTypeConstants.QUESTIONNAIRE) {
                PageActions.jump({page:page.xid, chapter:currentChapter.xid, unit:currentUnit.id});
                break;
            }
            pageIndex++;
        }
    }

};

module.exports = QuestionnaireActions;