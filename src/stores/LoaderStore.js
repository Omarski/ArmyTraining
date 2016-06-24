var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var LoaderConstants = require('../constants/LoaderConstants');
var LoaderActions = require('../actions/LoaderActions');
var BookStore = require('../stores/BookStore');
var BookActions = require('../actions/BookActions');
var BookmarkStore = require('../stores/BookmarkStore');
var PageActions = require('../actions/PageActions');
var UnitStore = require('../stores/UnitStore');
var UnitActions = require('../actions/UnitActions');
var NotificationActions = require('../actions/NotificationActions');
var assign = require('object-assign');


var CHANGE_EVENT = 'change';
var _loading = false;
var _loaded = false;
var _totalUnits = 0;
var _parsedUnitIndex = 0;

/**
 * Create a LOADER item.
 * @param  {string} text The content of the LOADER
 */
function load() {

    _loading = true;
    $.getJSON("data/content/toc.json", function(result) {
        BookActions.create(result.book);
        var books = BookStore.getAll();

        for (var key in books) {
            var book = books[key];
            var uLen = book.data.unit.length;
            for ( var i = 0; i < uLen; i++ ) {
                UnitStore.create(book.data.unit[i]);
            }
            var units = UnitStore.getAll();
            var copy = [];
            for (var uKey in units) {
                copy.push({key: uKey, unit:units[uKey]});
            }
            _totalUnits = copy.length;
            loadUnitData(copy);
        }

    });
}


function loadUnitData(units, cb) {
    var item = units.shift();

    _parsedUnitIndex++;
    if (item) {
        loadChapterPages(units, item.unit, 0);
    } else {
        cb();
    }
}

function loadChapterPages(units, unit, index) {



    if ((unit.data.chapter) && (index < unit.data.chapter.length)) {
        setTimeout(function () {
            var chapter = unit.data.chapter[index];
            chapter.pages = [];
            NotificationActions.updateBody("Loading  " + unit.data.title + " : " + chapter.title);
            if (index && units) {
                NotificationActions.updatePercent(Math.round(((_parsedUnitIndex) / _totalUnits) * 100));
            }

            index++;

            $.getJSON("data/content/" + chapter.xid + "/toc.json", function (result) {

                var storedPages = store.get('pages');

                var sections = result.chapter.section;
                var preposttestpages = result.chapter.preposttest;

                for (var i = 0; i < sections.length; i++) {

                    // get section mode
                    var sectionMode = "practice"; // default
                    if (sections[i].mode) {
                        sectionMode = sections[i].mode;
                    }

                    var pages = sections[i].pageRef;
                    for (var j = 0; j < pages.length; j++) {
                        var page = pages[j];

                        // mark as a quiz page
                        if (sectionMode == "quiz") {
                            page.state = {quizpage: true};
                        }

                        // mark as a preposttestpage
                        if (preposttestpages && (preposttestpages.indexOf(page.xid) != -1)) {
                            page.preposttest = true;
                        }

                        // load saved page state
                        if (storedPages) {
                            var storeId = unit.data.xid + '_' + chapter.xid + '_' + page.xid
                            if (storedPages[storeId]) {
                                page.state = storedPages[storeId];

                                page.state = assign({}, storedPages[storeId], page.state);
                            }
                        }

                        // add page to list
                        chapter.pages.push(page);
                    }

                }


                loadChapterPages(units, unit, index);

            });
        }, 100);


    } else {
        loadUnitData(units, function () {

            var units = UnitStore.getAll();
            for (key in units) {
                unit = units[key];
                var chapter = unit.data.chapter[0];
                var page = chapter.pages[0];

                NotificationActions.updateBody("Loading Page : " + page.title);

                setTimeout(function () {
                    var bookmark = BookmarkStore.current();
                    if (bookmark) {
                        PageActions.jump(bookmark);
                    } else {
                        PageActions.load({unit: unit, chapter: chapter, page: page});
                    }

                    LoaderActions.complete({});
                    _loaded = true;
                }, 100);

                break;
            }
        });
    }


}

var LoaderStore = assign({}, EventEmitter.prototype, {

    loading: function() {
      return _loading;
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
        case LoaderConstants.LOADER_COMPLETE:
            _loading = false;
            LoaderStore.emitChange();
            break;
        case LoaderConstants.LOADER_LOAD:
            load();
            LoaderStore.emitChange();
            break;

        default:
        // no op
    }
});

module.exports = LoaderStore;