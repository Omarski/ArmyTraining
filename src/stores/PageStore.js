var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var PageConstants = require('../constants/PageConstants');
var PageActions = require('../actions/PageActions');
var NotificationActions = require('../actions/NotificationActions');
var UnitStore = require('../stores/UnitStore');

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
    var prevPage = _currentChapter.pages[newIndex];
    load({unit:_currentUnit, chapter:_currentChapter, page:prevPage});
}

/**
 * Create a PAGE item.
 * @param  {string} text The content of the PAGE
 */
function load(data) {
    setTimeout(function() {
        NotificationActions.updateBody("Loading Page : " + data.page.title );
    });

    _loaded = false;
    console.log("data/content/" + data.chapter.xid + "/" + data.page.xid + ".json");
    $.getJSON("data/content/" + data.chapter.xid + "/" + data.page.xid + ".json", function(result) {

        _currentUnit = data.unit;
        _currentChapter = data.chapter;
        _currentPage = data.page;

        _data = result.page;


        var storedPages = store.get('pages');
        if (!storedPages) {
            storedPages = {};
        }

        var state = {visited: true};
        _currentPage.state = state;
        storedPages[_currentUnit.data.xid + "_" + _currentChapter.xid + "_" + _currentPage.xid] = state;

        store.set('pages', storedPages);

        PageActions.complete(result);
    });
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

    emitChange: function() {
        this.emit(CHANGE_EVENT);
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

        default:
        // no op
    }
});

PageStore.setMaxListeners(20);

module.exports = PageStore;