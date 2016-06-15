var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var InfoTagConstants = require('../constants/InfoTagConstants');
var PageConstants = require('../constants/PageConstants');
var PageActions = require('../actions/PageActions');
var NotificationActions = require('../actions/NotificationActions');
var UnitStore = require('../stores/UnitStore');
var BookmarkActions = require('../actions/BookmarkActions');
var BookmarkStore = require('../stores/BookmarkStore');
var Utils = require('../components/widgets/Utils');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';
var _loaded = false;
var _data = null;
var _currentUnit = null;
var _currentChapter = null;
var _currentPage = null;


function findCurrentUnitKey() {
    var result = null;
    var units = UnitStore.getAll();

    for (key in units) {
        var unit = units[key];
        if (unit === _currentUnit) {
            result = key;
            break;
        }
    }

    return result;
}


function findCurrentUnitById(xid) {
    var result = null;
    var units = UnitStore.getAll();

    for (key in units) {
        var unit = units[key];
        if (unit.data.xid === xid) {
            result = unit;
            break;
        }
    }

    return result;
}

function findUnitByKey(key) {
    return UnitStore.getAll()[key];
}

function findChapterById(unit, xid) {
    var chapter = null;
    var chapters = unit.data.chapter;
    var len = chapters.length;
    while(len--) {
        var c = chapters[len];
        if (c.xid === xid) {
            chapter = c;
            break;
        }
    }
    return chapter;
}

function findPageById(chapter, xid) {
    var page = null;
    var pages = chapter.pages;
    var len = pages.length;
    while(len--) {
        var p = pages[len];
        if (p.xid === xid) {
            page = p;
            break;
        }
    }
    return page;
}

function findNextUnitKey(unitKey) {
    var result = null;
    var units = UnitStore.getAll();
    var found = false;
    for (key in units) {
        var unit = units[key];
        if (found) {
            result = key;
            break;
        }
        if (key === unitKey) {
            found = true;
        }
    }

    return result;
}

function findPrevUnitKey(unitKey) {
    var result = null;
    var units = UnitStore.getAll();
    var prev = "";
    for (key in units) {
        var unit = units[key];

        if (key === unitKey) {
            result = prev;
        }
        prev = key;
    }

    return result;
}

function findCurrentChapterIndex() {
    var result = null;
    var chapters = _currentUnit.data.chapter;
    var chaptersLen = chapters.length;
    for (var i = 0; i < chaptersLen; i++) {
        var chapter = chapters[i];
        if (chapter === _currentChapter) {
            result = i;
            break;
        }
    }
    return result;
}

function findCurrentPageIndex() {
    var result = null;
    var pages = _currentChapter.pages;
    var pagesLen = pages.length;
    for (var i = 0; i < pagesLen; i++) {
        var page = pages[i];
        if (page === _currentPage) {
            result = i;
            break;
        }
    }
    return result;
}

function answer(data) {
    // get current page
    if (_currentPage) {

        // get timestamp
        data = assign({}, data, {lastUpdated: Date.now()});

        // save answer data in state
        _currentPage.state = assign({}, _currentPage.state, data);
    }
}


function loadNext() {

    var currentIndex = findCurrentPageIndex();
    var newIndex = currentIndex + 1;
    if (newIndex >= _currentChapter.pages.length) {
        var chapIndex = findCurrentChapterIndex() + 1;
        if (chapIndex >= _currentUnit.data.chapter.length) {
            chapIndex = 0;
            var unitKey = findCurrentUnitKey();
            unitKey = findNextUnitKey(unitKey);
            _currentUnit = UnitStore.getAll()[unitKey];
        }
        _currentChapter = _currentUnit.data.chapter[chapIndex];
        newIndex = 0;
    }
    console.log("newIndex", newIndex);
    var nextPage = _currentChapter.pages[newIndex];
    load({unit:_currentUnit, chapter:_currentChapter, page:nextPage});
}

function loadPrevious() {

    var currentIndex = findCurrentPageIndex();
    var newIndex = currentIndex - 1;
    if (newIndex === -1) {
        var chapIndex = findCurrentChapterIndex() - 1;
        if (chapIndex === - 1) {
            var unitKey = findCurrentUnitKey();
            unitKey = findPrevUnitKey(unitKey);
            if (!unitKey) return;
            _currentUnit = UnitStore.getAll()[unitKey];
            chapIndex = _currentUnit.data.chapter.length -1;
        }
        _currentChapter = _currentUnit.data.chapter[chapIndex];
        newIndex = _currentChapter.pages.length - 1;
    }
    console.log("previous newIndex", newIndex);
    var prevPage = _currentChapter.pages[newIndex];
    load({unit:_currentUnit, chapter:_currentChapter, page:prevPage});
}

/**
 * Create a PAGE item.
 * @param  {string} data The content of the PAGE
 */
function load(data) {
    if (data && data.chapter && data.page) {
        setTimeout(function() {
            NotificationActions.updateBody("Loading Page : " + data.page.title );
        });

        // save current page before changing to new one
        saveCurrentPage();

        _loaded = false;
        $.getJSON("data/content/" + data.chapter.xid + "/" + data.page.xid + ".json", function(result) {

            _currentUnit = data.unit;
            _currentChapter = data.chapter;
            _currentPage = data.page;

            _data = result.page;

            // create and add state property
            var state = {visited: true};
            _currentPage.state = assign({}, state, _currentPage.state);

            // save current page
            saveCurrentPage();

            PageActions.complete(result);
        });
    } else {
        BookmarkActions.destroy(); // if the data directory has changed, it can mess up the bookmark situation.  force remove bookmark and alert user
        alert("An error has occurred, please reload this browser");
    }
}

/**
 * Marks the current chapter as complete
 */
function markChapterComplete() {
    // get current chapter
    if (_currentChapter) {
        var state = {};

        // get chapter state
        if (_currentChapter.state) {
            state = _currentChapter.state;
        }

        // mark it as complete
        _currentChapter.state = assign({}, state, {completed: true});
    }
}

function jump(data) {
    var pageId = data.page;
    var chapterId = data.chapter;
    var unitId = data.unit;
    var unit = findUnitByKey(unitId);

    if (!unit) {
        unit = findCurrentUnitById(unitId);
    }

    var chapter = findChapterById(unit, chapterId);
    var page = findPageById(chapter, pageId);

    load({unit: unit, chapter: chapter, page:page});
}

function reset() {
    store.remove('pages');

    var units = UnitStore.getAll();
    for (var key in units) {
        _currentUnit = units[key];
        _currentChapter = _currentUnit.data.chapter[0];
        _currentPage = _currentChapter.pages[0];
        load({unit:_currentUnit, chapter:_currentChapter, page:_currentPage});
        break;
    }

}

function resetQuiz() {

    // get current chapter
    if (_currentChapter) {

        // TODO

        // get quiz pages

        // for each quiz page remove the answer state object

    }

}

function saveCurrentPage() {

    // check for valid current unit
    if (!(_currentUnit && _currentUnit.data && _currentUnit.data.xid)) {
        return false;
    }

    // check for valid current chapter
    if (!(_currentChapter && _currentChapter.xid)) {
        return false;
    }

    // check for valid current page
    if (!(_currentPage && _currentPage.xid)) {
        return false;
    }

    // check fo anything to save
    if (!(_currentPage.state)) {
        return false;
    }

    // load pages
    var storedPages = store.get('pages');
    if (!storedPages) {
        storedPages = {};
    }

    // update data
    storedPages[_currentUnit.data.xid + "_" + _currentChapter.xid + "_" + _currentPage.xid] = _currentPage.state;

    // save page
    store.set('pages', storedPages);

    return true;
}

var PageStore = assign({}, EventEmitter.prototype, {

    page: function() {
        return _data;
    },

    unit: function() {
        return _currentUnit;
    },

    chapter: function() {
        return _currentChapter;
    },

    loadingComplete: function() {
        return _loaded;
    },

    isQuizPage: function() {
        if (_currentPage && _currentPage.state && _currentPage.state.quizpage) {
            return true;
        }

        return false;
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    /**
     * @returns (Array) Returns an ordered list of pages that match
     */
    getChapterQuizPages: function() {
        var results = [];

        if (_currentChapter) {
            var pages = _currentChapter.pages;
            var pagesLen = pages.length;

            for (var i = 0; i < pagesLen; i++) {
                var page = pages[i];

                if (page.state && page.state.quizpage) {
                    results.push(page);
                }
            }
        }

        return results;
    },

    /**
     * @param {function} callback
     */
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    /**
     * @param {function} callback
     */
    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {


    switch(action.actionType) {
        case PageConstants.CHAPTER_MARK_COMPLETE:
            markChapterComplete();
            break;
        case PageConstants.PAGE_ANSWER:
            answer(action.data);
            break;
        case PageConstants.PAGE_COMPLETE:
            _loaded = true;
            PageStore.emitChange();
            break;
        case PageConstants.PAGE_LOAD:
            load(action.data);
            //PageStore.emitChange();
            break;
        case PageConstants.PAGE_LOAD_NEXT:
            loadNext();
            //PageStore.emitChange();
            break;
        case PageConstants.PAGE_LOAD_PREVIOUS:
            loadPrevious();
            //PageStore.emitChange();
            break;
        case PageConstants.PAGE_JUMP:
            jump(action.data);
            //PageStore.emitChange();
            break;
        case PageConstants.PAGE_RESET:
            reset();
            PageStore.emitChange();
            break;
        case PageConstants.QUIZ_RESET:
            resetQuiz();
            break;

        default:
        // no op
    }
});

PageStore.setMaxListeners(20);

module.exports = PageStore;