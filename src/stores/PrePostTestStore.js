var AppDispatcher = require('../dispatcher/AppDispatcher');
var Assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var PrePostTestActions = require('../actions/PrePostTestActions');
var PrePostTestConstants = require('../constants/PrePostTestConstants');

var CHANGE_EVENT = 'change';

var _pageToChapterMapping = {};

/**
 * Adds the pageId to the chapter mapping
 * @param data
 */
function addPage(data) {
    var pageId = data.pageId;
    var chapterId = data.chapterId;
    var chapterTitle = data.chapterTitle;
    var unitId = data.unitId;
    var unitTitle = data.unitTitle;

    if (pageId != null && chapterId != null && unitId != null && chapterTitle != null && unitTitle != null) {
        var referenceId = chapterId + "_" + pageId;

        // add new entry
        _pageToChapterMapping[referenceId] = {
            pageId: pageId,
            chapterId: chapterId,
            chapterTitle: chapterTitle,
            unitId: unitId,
            unitTitle: unitTitle
        };
    }
}

/**
 * Resets the mapping data
 */
function reset() {
    _pageToChapterMapping = {};
}

var PrePostTestStore = Assign({}, EventEmitter.prototype, {
    getChapterIdByPageId: function(referenceId) {
        if (_pageToChapterMapping[referenceId]) {
            var originalChapterId = _pageToChapterMapping[referenceId].chapterId;
            if (originalChapterId) {
                return originalChapterId;
            }
        }
        return null;
    },

    getChapterTitleByPageId: function(referenceId) {
        if (_pageToChapterMapping[referenceId]) {
            var originalChapterTitle = _pageToChapterMapping[referenceId].chapterTitle;
            if (originalChapterTitle) {
                return originalChapterTitle;
            }
        }
        return null;
    },

    getUnitIdByPageId: function(referenceId) {
        if (_pageToChapterMapping[referenceId]) {
            var originalUnitId = _pageToChapterMapping[referenceId].unitId;
            if (originalUnitId) {
                return originalUnitId;
            }
        }
        return null;
    },

    getUnitTitleByPageId: function(referenceId) {
        if (_pageToChapterMapping[referenceId]) {
            var originalUnitTitle = _pageToChapterMapping[referenceId].unitTitle;
            if (originalUnitTitle) {
                return originalUnitTitle;
            }
        }
        return null;
    },

    getPagePathByPageId: function(referenceId) {
        if (_pageToChapterMapping[referenceId]) {
            var originalChapterId = _pageToChapterMapping[referenceId].chapterId;
            var originalPageId = _pageToChapterMapping[referenceId].pageId;

            if (originalChapterId && originalPageId) {
                return "data/content/" + originalChapterId + "/" + originalPageId + ".json";
            }
        }
        return null;
    }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
    switch(action.actionType) {
        case PrePostTestConstants.PRE_POST_TEST_ADD_PAGE:
            addPage(action.data);
            break;
        case PrePostTestConstants.PRE_POST_TEST_RESET:
            reset();
            break;
        default:
        // no op
    }
});


module.exports = PrePostTestStore;