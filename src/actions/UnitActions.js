var AppDispatcher = require('../dispatcher/AppDispatcher');
var UnitConstants = require('../constants/UnitConstants');

var UnitActions = {

    /**
     * @param  {string} text
     */
    create: function(data) {
        AppDispatcher.dispatch({
            actionType: UnitConstants.UNIT_CREATE,
            data: data
        });
    },

    /**
     * Checks for unit complete by checking its chapters
     * @param unitId
     */
    evaluateUnitComplete: function(unitId) {
        AppDispatcher.dispatch({
            actionType: UnitConstants.UNIT_EVALUATE_COMPLETE,
            data: unitId
        });
    },

    evaluateUnitPassed: function(unitId) {
        AppDispatcher.dispatch({
            actionType: UnitConstants.UNIT_EVALUATE_PASSED,
            data: unitId
        });
    },

    /**
     * Mark unit with given id as complete
     * @param unitId
     */
    markUnitComplete: function(unitId) {
        AppDispatcher.dispatch({
            actionType: UnitConstants.UNIT_COMPLETE,
            id: unitId
        });
    },

    /**
     * Mark unit with given id as passed and complete
     * @param unitId
     */
    markUnitPassed: function(unitId) {
        AppDispatcher.dispatch({
            actionType: UnitConstants.UNIT_PASSED,
            id: unitId
        });
    },

    /**
     * Marks chapter in a unit complete
     * @param unitId
     * @param chapterId
     */
    markChapterComplete: function(unitId, chapterId) {
        AppDispatcher.dispatch({
            actionType: UnitConstants.UNIT_CHAPTER_COMPLETE,
            id: unitId,
            chapterId: chapterId
        });
    },

    /**
     * Marks chapter in a unit passed
     * @param unitId
     * @param chapterId
     */
    markChapterPassed: function(unitId, chapterId) {
        AppDispatcher.dispatch({
            actionType: UnitConstants.UNIT_CHAPTER_PASSED,
            id: unitId,
            chapterId: chapterId
        });
    },

    /**
     * Mark unit with given id as required
     * @param (string) unitId - id of unit to mark as required
     */
    markUnitRequired: function(unitId) {
        AppDispatcher.dispatch({
            actionType: UnitConstants.UNIT_MARK_REQUIRED,
            id: unitId
        });
    },

    /**
     * Toggle whether a single Unit is complete
     * @param  {object} unit
     */
    toggleComplete: function(unit) {
        var id = unit.id;
        var actionType = unit.complete ?
            UnitConstants.UNIT_UNDO_COMPLETE :
            UnitConstants.UNIT_COMPLETE;

        AppDispatcher.dispatch({
            actionType: actionType,
            id: id
        });
    },

    /**
     * Mark all Units as complete
     */
    toggleCompleteAll: function() {
        AppDispatcher.dispatch({
            actionType: UnitConstants.UNIT_TOGGLE_COMPLETE_ALL
        });
    },

    /**
     * @param  {string} id
     */
    destroy: function(id) {
        AppDispatcher.dispatch({
            actionType: UnitConstants.UNIT_DESTROY,
            id: id
        });
    },

    /**
     * Delete all the completed Units
     */
    destroyCompleted: function() {
        AppDispatcher.dispatch({
            actionType: UnitConstants.UNIT_DESTROY_COMPLETED
        });
    },

    /**
     * Resets all unit saved data
     */
    reset: function() {
        AppDispatcher.dispatch({
            actionType: UnitConstants.UNIT_RESET
        });
    }

};

module.exports = UnitActions;