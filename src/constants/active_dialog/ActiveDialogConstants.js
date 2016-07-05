var keyMirror = require('keymirror');

module.exports = keyMirror({
    ACTIVE_DIALOG_ACTION_BLOCKING: null,
    ACTIVE_DIALOG_ACTION_COA_SET: null,
    ACTIVE_DIALOG_ACTION_COMPLETE: null,
    ACTIVE_DIALOG_ACTION_OUTPUT: null,
    ACTIVE_DIALOG_CONTINUE_DIALOG: null,
    ACTIVE_DIALOG_CREATE: null,
    ACTIVE_DIALOG_DESTROY: null,
    ACTIVE_DIALOG_LOAD: null,
    ACTIVE_DIALOG_HANDLE_INPUT: null,   // when option is selected
    ACTIVE_DIALOG_RESTART: null,
    ACTIVE_DIALOG_SET_ACTIVE_COA: null, // when hint is selected
    ACTIVE_DIALOG_SHOW_REMEDIATION: null,
    ACTIVE_DIALOG_START_DIALOG: null,   // when intro is closed
    ACTIVE_DIALOG_HINTS_SHOWN: null     // when hints are shown to user from button click
});