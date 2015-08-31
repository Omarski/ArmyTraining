var AppDispatcher = require('../dispatcher/AppDispatcher');
var PageConstants = require('../constants/PageConstants');

var PageActions = {

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
    }
    ,
    loadPrevious: function(data) {
        AppDispatcher.dispatch({
            actionType: PageConstants.PAGE_LOAD_PREVIOUS,
            data: data
        });
    },
    jump: function(data) {
        AppDispatcher.dispatch({
            actionType: PageConstants.PAGE_JUMP,
            data: data
        });
    }



};

module.exports = PageActions;