var keyMirror = require('keymirror');

module.exports = keyMirror({
    ACTIVE_DIALOG_CREATE: null,
    ACTIVE_DIALOG_DESTROY: null,
    ACTIVE_DIALOG_LOAD: null,
    ACTIVE_DIALOG_HANDLE_INPUT: null, // when option is selected
    ACTIVE_DIALOG_SET_ACTIVE_COA: null, // when hint is selected
    ACTIVE_DIALOG_HINTS_SHOWN: null // when hints are shown to user from button click
});