var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var InfoTagConstants = require('../constants/InfoTagConstants');
var PageConstants = require('../constants/PageConstants');
var PageActions = require('../actions/PageActions');
var PageTypeConstants = require('../constants/PageTypeConstants');
var PersistenceActions = require('../actions/PersistenceActions');
var PersistenceStore = require('../stores/PersistenceStore');
var PrePostTestStore = require('../stores/PrePostTestStore');
var NotificationActions = require('../actions/NotificationActions');
var UnitActions = require('../actions/UnitActions');
var UnitStore = require('../stores/UnitStore');
var BookmarkActions = require('../actions/BookmarkActions');
var BookmarkStore = require('../stores/BookmarkStore');
var FooterActions = require('../actions/FooterActions');
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
    var nextPage = _currentChapter.pages[newIndex];
    load({unit:_currentUnit, chapter:_currentChapter, page:nextPage});
}


/**
 * Checks current state to see if the requested previous unit is valid to switch
 * @param unit
 * @returns {boolean}
 */
function isValidPrevUnit(unit) {
    if (unit.data && unit.data && unit.data.chapter) {
        // iterate over chapters
        var chapterLength = unit.data.chapter.length;
        while (chapterLength--) {
            var chapter = unit.data.chapter[chapterLength];

            if (chapter.info) {
                // return false if prologue chapter
                if (Utils.findInfo(chapter.info, InfoTagConstants.INFO_PROP_PROLOGUE) !== null) {
                    return false;
                }
            }
        }
    }

    return true;
}

/**
 * Checks current state to see if the requested previous page is valid to show
 * @param page
 * @returns {boolean}
 */
function isValidPrevPage(page) {

    var inQuiz = false;
    if (_currentPage && _currentPage.state && _currentPage.state.quizpage) {
        inQuiz = true;
    }

    // return false if coming from a non quiz page
    if (page.state && page.state.quizpage && inQuiz === false) {
        return false;
    }
    return true;
}

function loadPrevious() {

    var currentIndex = findCurrentPageIndex();
    var newIndex = currentIndex - 1;
    var validPrevPage = false;

    while (validPrevPage === false) {
        if (newIndex === -1) {
            var chapIndex = findCurrentChapterIndex() - 1;
            if (chapIndex === - 1) {
                var unitKey = findCurrentUnitKey();
                unitKey = findPrevUnitKey(unitKey);
                if (!unitKey) return;

                var prevUnit = UnitStore.getAll()[unitKey];
                var validPrevUnit = isValidPrevUnit(prevUnit);
                if (validPrevUnit === false) return;

                _currentUnit = UnitStore.getAll()[unitKey];
                chapIndex = _currentUnit.data.chapter.length -1;
            }
            _currentChapter = _currentUnit.data.chapter[chapIndex];
            newIndex = _currentChapter.pages.length - 1;
        }
        var prevPage = _currentChapter.pages[newIndex];

        // if the previous page is a quiz then skip
        validPrevPage = isValidPrevPage(prevPage);

        // if not valid get next index
        if (validPrevPage === false) {
            newIndex--;
        }
    }

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

        // default path
        var pageContentPath = "data/content/" + data.chapter.xid + "/" + data.page.xid + ".json";

        // check if page is a copied page, if so get original path
        if (data.page.preposttest === true) {
            // if found, update path to load from
            var newPath = PrePostTestStore.getPagePathByPageId(data.page.xid);
            if (newPath) {
                pageContentPath = newPath;
            }
        }

        // load page data
        $.getJSON(pageContentPath, function(result) {
            _currentUnit = data.unit;
            _currentChapter = data.chapter;
            _currentPage = data.page;

            _data = result.page;

            // check if page is a copied page if so update title
            if (data.page.preposttest === true) {
                _data.title = data.page.title;
            }

            // create and add state property
            var state = {visited: true};
            _currentPage.state = assign({}, state, _currentPage.state);

            // save current page
            saveCurrentPage();

            PageActions.complete(result);
            FooterActions.enableAll(); // TODO: dont like this here <---

        });
    } else {
        //BookmarkActions.destroy(); // if the data directory has changed, it can mess up the bookmark situation.  force remove bookmark and alert user
        //alert("An error has occurred, please reload this browser");
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
        _currentChapter.state = assign({}, state, {complete: true});

        // check if the unit is complete
        setTimeout(function() {
            if (_currentUnit && _currentUnit.id) {
                UnitActions.evaluateUnitComplete(_currentUnit.id);
            }
        }, 0.1);

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
    setTimeout(function() {
        PersistenceActions.remove('pages');

        var units = UnitStore.getAll();
        for (var key in units) {
            _currentUnit = units[key];
            _currentChapter = _currentUnit.data.chapter[0];
            _currentPage = _currentChapter.pages[0];
            load({unit:_currentUnit, chapter:_currentChapter, page:_currentPage});
            break;
        }
    });
}

function resetQuiz() {
    if (_currentChapter) {
        var pages = _currentChapter.pages;
        var pagesLen = pages.length;

        while (pagesLen--) {
            var page = pages[pagesLen];

            // skip some page types that are in a quiz
            if (page.state && page.state.quizpage && page.state.answer) {
                switch(page.type) {
                    case PageTypeConstants.QUIZ_END:
                    case PageTypeConstants.QUIZ_START:
                    case PageTypeConstants.SECTION_END:
                        break;  // skip
                    default:
                        // delete answer data
                        delete page.state.answer;

                        // update timestamp
                        page.state = assign({}, page.state, {lastUpdated: Date.now()});
                }
            }
        }
    }

    // TODO dispatch quiz reset event?
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

    setTimeout(function() {
        // load pages
        var storedPages = PersistenceStore.get('pages');
        if (!storedPages) {
            storedPages = {};
        }

        // update data
        storedPages[_currentUnit.data.xid + "_" + _currentChapter.xid + "_" + _currentPage.xid] = _currentPage.state;

        // save page
        PersistenceActions.set('pages', storedPages);
    });

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

    isChapterComplete: function() {
        if (_currentChapter && _currentChapter.state && (_currentChapter.state.complete === true)) {
            return true;
        }
        return false;
    },

    isUnitComplete: function() {
        if (_currentUnit && _currentUnit.state && (_currentUnit.state.complete === true)) {
            return true;
        }
        return false;
    },

    isQuizPage: function() {
        if (_currentPage && _currentPage.state && _currentPage.state.quizpage) {
            return true;
        }

        return false;
    },

    getPageAnswer: function() {
        if(_currentPage && _currentPage.state && _currentPage.state.answer) {
            return _currentPage.state.answer;
        }

        return null;
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    /**
     * @returns (Array) Returns an ordered list of pages that are valid quiz pages
     */
    getChapterQuizPages: function() {
        var results = [];

        if (_currentChapter) {
            var pages = _currentChapter.pages;
            var pagesLen = pages.length;

            for (var i = 0; i < pagesLen; i++) {
                var page = pages[i];

                // skip some page types that are in a quiz
                if (page.state && page.state.quizpage) {
                    switch(page.type) {
                        case PageTypeConstants.QUIZ_END:
                        case PageTypeConstants.QUIZ_START:
                        case PageTypeConstants.SECTION_END:
                        case PageTypeConstants.TEST_OUT_QUIZ_END:
                        case PageTypeConstants.POST_TEST_QUIZ_END:
                            break;  // skip
                        default:
                            results.push(page);
                    }
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