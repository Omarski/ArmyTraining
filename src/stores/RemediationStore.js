var Assign = require('object-assign');
var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var RemediationActions = require('../actions/RemediationActions');
var RemediationConstants = require('../constants/RemediationConstants');

var CHANGE_EVENT = 'change';

var _currentPage = null;
var _currentPageData = null;
var _data = [];
var _pageLoaded = false;

function create(data) {
    // reset data
    destroy();

    // load first page
    if (data && data.length > 0) {
        // set current data
        _data = data;

        // load the first page
        load(_data[0]);
    }
}

function destroy() {
    _currentPage = null;
    _currentPageData = null;
    _data = [];
    _pageLoaded = false;
}

function findCurrentPageIndex() {
    var result = 0;
    var pagesLen = _data.length;
    for (var i = 0; i < pagesLen; i++) {
        var page = _data[i];
        if (page === _currentPageData) {
            result = i;
            break;
        }
    }
    return result;
}

function load(remediationPageData) {
    // reset loaded flag
    _pageLoaded = false;

    // split data by colon
    var pageArray = remediationPageData.split(':');
    if (pageArray.length > 1) {

        var chapterId = pageArray[0];
        var pageId = pageArray[1];

        // load page data
        var pageContentPath = "data/content/" + chapterId + "/" + pageId + ".json";
        $.getJSON(pageContentPath, function(result) {
            // set current page
            _currentPage = result.page;
            _currentPageData = remediationPageData;

            // broadcast that loading is complete
            RemediationActions.loadComplete();
        });
    }
}

function loadNext() {
    var currentIndex = findCurrentPageIndex();
    var newIndex = currentIndex + 1;
    if (newIndex < _data.length) {
        load(_data[newIndex]);
    }
}

function loadPrev() {
    var currentIndex = findCurrentPageIndex();
    var newIndex = currentIndex - 1;
    if (newIndex >= 0) {
        load(_data[newIndex]);
    }
}

var RemediationStore = Assign({}, EventEmitter.prototype, {
    /**
     * Returns the loaded page json data
     */
    getCurrentPage: function() {
        return _currentPage;
    },

    /**
     * Return true if there are previous pages in the remediation list
     * @returns {boolean}
     */
    hasPreviousPage: function() {
        return (findCurrentPageIndex() > 0);
    },

    /**
     * Returns true if there are next pages in the remedation list
     * @returns {boolean}
     */
    hasNextPage: function() {
        if (_data) {
            return (findCurrentPageIndex() < _data.length - 1);
        }
        return false;
    },

    /**
     * @returns {boolean} - Return if remediation page is loaded
     */
    loadingComplete: function() {
        return _pageLoaded;
    },

    /**
     * Broadcast change event to listeners
     */
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
        case RemediationConstants.REMEDIATION_CREATE:
            create(action.data);
            break;
        case RemediationConstants.REMEDIATION_DESTROY:
            destroy();
            RemediationStore.emitChange();
            break;
        case RemediationConstants.REMEDIATION_LOAD_COMPLETE:
            _pageLoaded = true;
            RemediationStore.emitChange();
            break;
        case RemediationConstants.REMEDIATION_LOAD_NEXT:
            loadNext();
            break;
        case RemediationConstants.REMEDIATION_LOAD_PREV:
            loadPrev();
            break;
        default:
        // no op
    }
});

module.exports = RemediationStore;