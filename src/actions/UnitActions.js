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
    }

};

module.exports = UnitActions;