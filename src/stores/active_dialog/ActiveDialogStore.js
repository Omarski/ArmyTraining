var AppDispatcher = require('../../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActiveDialogConstants = require('../../constants/active_dialog/ActiveDialogConstants');
var ActiveDialogActions = require('../../actions/active_dialog/ActiveDialogActions');
var PageStore = require('../../stores/PageStore');
var RemediationActions = require('../../actions/RemediationActions');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';
var _info = {};
var _metrics = {};

var DATA, memory, activityState, blockImg, blockId;
var asrMode = false;

// dialog state data
var _actionQueue = [];
var _briefings = "";
var _courseOfActions = [];
var _currentAction = null;
var _currentBlocking = null;
var _currentBlockingId = "0000";
var _currentSpeakerName = null;
var _currentDialogHistory = null;
var _dialogStarted = false;
var _objectives;

function makeCOAs( acts, transInd, retId, retInputId ) {

    if( retId == 'GARBAGE' ) return [];

    return acts.map(function (act) {

        var res = {
            'act': DATA.nls[act],
            'transitionIndex': transInd,
            'retId': retId,
            'retInputId': retInputId,
            'realizations': DATA.inputMappings[act].map(function (utt) {
                return {
                    'anima': utt.anima ? utt.anima : null,
                    'uttText': utt[ utt.terp ],
                    'gesture': ( utt.L2 || utt.L1 ) ? null : DATA.nls[ act ],
                    'sound': utt.sound ? utt.sound : null,
                    'terp': utt.terp
                };
            })};

        res.isChoice = res.realizations[0].gesture !== null;
        //res.isChoice = !asrMode || res.isChoice; // always use choice if no asr

        return res
    });
}

function changeBlockingImage(blockingId) {

    if (DATA.blockings) {
        if (DATA.blockings[blockingId]) {
            blockImg = DATA.blockings[blockingId].background;

            return blockImg;
        }
    }

    return null;
}

function changeBlocking(blockingAction) {
    var blockingId = blockingAction.data;

    // look up blocking by id
    if (_info.blockings && _info.blockings.hasOwnProperty(blockingId)) {
        _currentBlocking = _info.blockings[blockingId];
        _currentBlockingId = blockingId;
    }
}

function changeDialogHistory(outputAction) {
    var speaker = outputAction.speaker;
    _currentSpeakerName = getNameByParticipant(speaker);
    _currentDialogHistory = outputAction.text
}

function checkVR(VR) { // Check Variable Range

    var val = memory[VR.variable];
    var vrRangeValue = VR.range[0];

    // attempt to convert to number
    if (!isNaN(parseFloat(vrRangeValue))) {
        vrRangeValue = parseFloat(vrRangeValue);
    }

    switch(VR.operator) {
        case '==': return val === vrRangeValue;
        case '!=': return val !== vrRangeValue;
        case '<' : return val <   vrRangeValue;
        case '<=': return val <=  vrRangeValue;
        case '>' : return val >   vrRangeValue;
        case '>=': return val >=  vrRangeValue;
        default  : console.warn('UNKNOWN OP: ' + VR.operator);
    }

    return false;
}

function checkVRQ(VRQ) {
    return VRQ.variableRanges.every(checkVR);
}

function evalPostfix( str )
{
    function evalVar( v )
    {
        return v == "true" ? true :
            v == "false" ? false :
                ( typeof memory[v] === 'undefined' ) ? v : memory[v];
    }

    var stack = [];

    str.split(" ").forEach( function( _token )
    {
        var token = evalVar( _token );

        switch( token )
        {
            case '&':
            {
                // need to pre-pop to prevent early return when a is false
                var a = stack.pop();
                var b = stack.pop();
                stack.push( a && b );
                break;
            }
            case '|':
            {
                a = stack.pop();
                b = stack.pop();
                stack.push( a || b );
                break;
            }
            case '==': stack.push( stack.pop() == stack.pop() ); break;
            case '<': stack.push( stack.pop() > stack.pop() ); break;
            case '>': stack.push( stack.pop() < stack.pop() ); break;
            case '<=': stack.push( stack.pop() >= stack.pop() ); break;
            case '>=': stack.push( stack.pop() <= stack.pop() ); break;
            default: stack.push( token ); break;
        }
    } );

    return stack[0] === true;
}

function getCOAs() {
    // reset
    _courseOfActions = [];

    // transitions
    DATA.transitions.forEach(function (transitionObj, index) {
        // check if valid transition
        if (transitionObj.startState === activityState && checkVRQ(transitionObj)) {
            _courseOfActions = _courseOfActions.concat(makeCOAs(transitionObj.inputSymbols, index));
        }
    });

    // range enabled transitions (RETs)
    Object.keys(DATA.retq).forEach(function (rid) {
        if( memory[ 'RET_' + rid ] ) {
            var ret = DATA.retq[rid];
            Object.keys(ret.inputq).forEach(function (iid) {
                if (ret.inputq[iid].outputq.some(checkVRQ)) {
                    _courseOfActions = _courseOfActions.concat( makeCOAs( [iid], -1, rid, iid ) );
                }
            });
        }
    });

    // add to action queue HACK
    if (_courseOfActions.length > 0) {
        _actionQueue.push({
            type: ActiveDialogConstants.ACTIVE_DIALOG_ACTION_COA_SET
        });
    } else {
        _actionQueue.push({
            type: ActiveDialogConstants.ACTIVE_DIALOG_ACTION_COMPLETE
        });
    }
}

function getParticipantByRole(role) {
    if (DATA && DATA.roles) {
        if (DATA.roles.hasOwnProperty(role)) {
            return DATA.roles[role];
        }
    }
    return null;
}

function getNameByParticipant(participant) {
    if (DATA && DATA.participants) {
        return DATA.participants[participant];
    }
    return null;
}

function applyEffect(effect) {

    var val = effect.operand2; // || val = memory[val]

    switch (effect.operator) {
        case '=' : memory[effect.operand] = val; break;
        case '+=': memory[effect.operand] += ( 1 * val ); break; // todo clean up
        case '-=': memory[effect.operand] -= ( 1 * val ); break;
        default  : console.warn('UNKNOWN OP: ' + effect.operator);
    }
}

function nextRandom() {
    memory.RANDOM = Math.random() * 10;
}

function addOutputMappingActionByAct(actName) {

    // look up output mapping
    var outputMapping = DATA.outputMappings[actName];
    if (outputMapping) {
        // get speaker
        var speaker = actName.substr(0, actName.indexOf('-'));
        var animation = outputMapping.anima;
        var sound = outputMapping.sound;
        var terp = outputMapping.terp;
        var text = outputMapping[terp] ? outputMapping[terp] : outputMapping.title;

        // add to action queue
        _actionQueue.push({
            type: ActiveDialogConstants.ACTIVE_DIALOG_ACTION_OUTPUT,
            anima: animation,
            text: text,
            sound: sound,
            speaker: speaker
        });
    }
}

function handleTransitionInput(trans) {
    // update current state
    activityState = trans.endState;

    // only set if defined
    if (trans.blockImg)
        blockImg = trans.blockImg;

    trans.actions.forEach(function(action)
    {
        if(action.indexOf('GoToBlocking') != -1 ) {
            blockId = action.substring(action.lastIndexOf('-') + 1 );

            _actionQueue.push({
                type: ActiveDialogConstants.ACTIVE_DIALOG_ACTION_BLOCKING,
                data: blockId
            });

        } else {
            addOutputMappingActionByAct(action);
        }
    });

    // update effects
    trans.effects.forEach(applyEffect);
}

function handleRetInput(retId, retInputId) {
    var outputQ = DATA.retq[retId].inputq[retInputId].outputq;
    var filteredOutputQ = outputQ.filter(checkVRQ);

    filteredOutputQ.forEach(function(output) {
        output.speakerActq.forEach(function(actName) {
            addOutputMappingActionByAct(actName);
        });

        // update effects
        output.effects.forEach(applyEffect);

        // update current state if specified
        if (output.endState != null && (output.endState.length > 0)) {
            activityState = output.endState;
        }
    });
}

function makeResult( transInd, inputq, outputq, retVid ) {

    // strip out coach output into its own queue
    outputq.forEach( function(output) {
        if( output.substr(0, output.indexOf('-') ) == DATA.roles['Coach'] ||
            output.substr(0, output.indexOf('-') ) == DATA.roles['coach']) {
            coached.push( DATA.outputMappings[output]['L1'] );
        }
    });
}

// TODO move to actions
function handleInput(coa) {

    // update random memory value
    nextRandom();

    // get player role
    var playerRole = getParticipantByRole("player");

    // handle inputs
    var inputq = coa.realizations;
    for (var inputRealizationIndex in inputq) {
        var realization = inputq[inputRealizationIndex];

        // add to action queue
        _actionQueue.push({
            type: ActiveDialogConstants.ACTIVE_DIALOG_ACTION_OUTPUT,
            anima: realization.anima,
            text: realization.uttText,
            sound: realization.sound,
            speaker: playerRole
        });
    }

    // handle outputs
    if (coa.transitionIndex > -1) {
        handleTransitionInput(DATA.transitions[coa.transitionIndex])
    } else {
        handleRetInput( coa.retId, coa.retInputId );
    }


    // update course of action options
    getCOAs();


    // update objectives
    _objectives.forEach( function( o ) {
        o.pass = evalPostfix( o.condition );
    });

    var retVideo = coa.transitionIndex > -1 ? null : DATA.retq[coa.retId].inputq[coa.retInputId].video;

    var retVid = retVideo == null ? null :
        retVideo[ blockId ] ? retVideo[ blockId ] :
            retVideo[ 'b0000' ];

}

function create(fsmData, infoData) {

    // reset any old data
    resetDialog();

    // get scenario data
    DATA = fsmData;

    // parse memory data
    memory = JSON.parse( JSON.stringify( DATA.initialMemory ) ); // deep copy so DATA contents never mutated

    // parse objectives
    _objectives = JSON.parse( JSON.stringify( DATA.objectives ) ); // deep copy so DATA contents never mutated
    _objectives.forEach( function( o ) { o.pass = false; } );

    // set initial state
    activityState = 's0';

    // set initial blocking image
    if (fsmData.nodesPy) {
        blockImg = fsmData.nodesPy;
    }
    // overwrite old method if new one is in place
    if (DATA.blockings) {
        if (DATA.blockings["InitialBlocking"]) {
            blockImg = DATA.blockings["InitialBlocking"].background;
        }
    }

    // set info data
    _info = infoData;

    // set briefing data
    _briefings = DATA.briefings.s0.description;

    // set initial blocking value
    blockId = 'b0000';

    // add initial blocking action
    _actionQueue.push({
        type: ActiveDialogConstants.ACTIVE_DIALOG_ACTION_BLOCKING,
        data: "0000"
    });

    // trigger initial action
    continueDialog();
}


function continueDialog() {
    // reset states
    _currentAction = null;

    // set next action in queue
    if (_actionQueue.length > 0) {
        _currentAction = _actionQueue.shift();

        // update internal data based on action
        switch (_currentAction.type) {
            case ActiveDialogConstants.ACTIVE_DIALOG_ACTION_BLOCKING:
                changeBlocking(_currentAction);
                break;
            case ActiveDialogConstants.ACTIVE_DIALOG_ACTION_OUTPUT:
                changeDialogHistory(_currentAction);
                break;
            default:
                // no op
        }
    } else {
        // TODO do something?
    }
}

function destroy() {
    DATA = null;
    resetDialog();
}

/*
return {
    init: init,
    changeBlockingImage: changeBlockingImage,
    handleInput: handleInput,
    singleton: true
};*/

function load(args) {
    $.getJSON("data/content/" + args.chapterId + "/" + args.dialogId + "_info.json", function(info) {
        $.getJSON("data/content/" + args.chapterId + "/" + args.dialogId + ".json", function (result) {
            ActiveDialogActions.create(result, info);
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.log("error " + textStatus);
        console.log("incoming Text " + jqXHR.responseText);
    });
}



function hintsShown() {
    // Greg here is where you would store the hints shown count
    /*
    var metrics = {
        duration: PageStore.duration(),
        hintsShown: 25,
        inputs: ActiveDialogStore.activeDialog().inputs,
        outputs: ActiveDialogStore.activeDialog().outputs
    }*/
}

function resetDialog() {
    _actionQueue = [];
    _briefings = "";
    _courseOfActions = [];
    _currentAction = null;
    _currentBlocking = null;
    _currentBlockingId = "0000";
    _currentSpeakerName = null;
    _currentDialogHistory = null;
    _dialogStarted = false;
    _objectives = null;
}

// TODO this probably shouldnt be in here but instead in ActiveDialogActions
// TODO this along with other methods
function showRemediation() {

    // gather objectives
    if (_objectives) {

        var gatheredRemedationPages = [];

        _objectives.forEach( function(objective) {
            if (objective.pass !== true) {
                if (objective.remediationq) {
                    gatheredRemedationPages = gatheredRemedationPages.concat(objective.remediationq)
                }
            }
        });

        // if remediation pages found trigger remediation
        if (gatheredRemedationPages.length > 0) {
            setTimeout(function() {
                RemediationActions.create(gatheredRemedationPages);
            }, 0.1);
        }
    }
}

function startDialog() {
    // mark it has started
    _dialogStarted = true;

    // attempt automatic input
    if( DATA.transitions.length > 0 && DATA.transitions[0].inputSymbols[0] === 'automatic' ) {
        var automaticCOA = {
            transitionIndex: 0
        };
        handleInput(automaticCOA);
    } else {
        // update random memory value
        nextRandom();

        // update course of action options
        getCOAs();
    }
}

var ActiveDialogStore = assign({}, EventEmitter.prototype, {
    coas: function() {
        return _courseOfActions;
    },

    info: function() {
        return _info;
    },

    briefings: function () {
        return _briefings;
    },

    isDialogStarted: function() {
        return _dialogStarted;
    },

    getCurrentAction: function() {
        return _currentAction;
    },

    getCurrentBlocking: function() {
        return _currentBlocking;
    },

    getCurrentDialogHistory: function() {
        return _currentDialogHistory;
    },

    getCurrentSpeakerName: function() {
        return _currentSpeakerName;
    },

    getObjectives: function() {
        return _objectives;
    },

    getCurrentBlockingAssets: function() {
        if (_currentBlocking !== null && _info !== null) {

            // gather assets in blocking
            var blockingAssets = [];
            for (var index in _currentBlocking.assets) {
                var assetName = _currentBlocking.assets[index];

                switch(typeof assetName) {
                    case "string":
                        if (_info.assets.hasOwnProperty(assetName)) {
                            blockingAssets.push({
                                name: index,
                                assets: [{
                                    name: assetName,
                                    assetData: _info.assets[assetName]
                                }],
                                blockingId: _currentBlockingId
                            });
                        }
                        break;
                    case "object":
                        // create new array
                        var assetArray = [];
                        for (var assetIndex in assetName) {
                            if (_info.assets.hasOwnProperty(assetName[assetIndex])) {
                                assetArray.push({
                                    name: assetName,
                                    assetData: _info.assets[assetName[assetIndex]]
                                });
                            }
                        }

                        blockingAssets.push({
                            name: index,
                            assets: assetArray,
                            blockingId: _currentBlockingId
                        });
                        break;
                    default:
                        break;
                }
            }

            return blockingAssets;
        }
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
    switch(action.actionType) {
        case ActiveDialogConstants.ACTIVE_DIALOG_CREATE:
            create(action.data, action.info);
            ActiveDialogStore.emitChange();
            break;
        case ActiveDialogConstants.ACTIVE_DIALOG_CONTINUE_DIALOG:
            continueDialog();
            ActiveDialogStore.emitChange();
            break;
        case ActiveDialogConstants.ACTIVE_DIALOG_DESTROY:
            destroy();
            ActiveDialogStore.emitChange();
            break;
        case ActiveDialogConstants.ACTIVE_DIALOG_LOAD:
            load(action.data);
            ActiveDialogStore.emitChange();
            break;
        case ActiveDialogConstants.ACTIVE_DIALOG_HANDLE_INPUT:
            handleInput(action.data);
            ActiveDialogStore.emitChange();
            break;
        case ActiveDialogConstants.ACTIVE_DIALOG_RESTART:
            create(DATA, _info);
            ActiveDialogStore.emitChange();
            break;
        case ActiveDialogConstants.ACTIVE_DIALOG_SHOW_REMEDIATION:
            showRemediation();
            break;
        case ActiveDialogConstants.ACTIVE_DIALOG_SET_ACTIVE_COA:
            ActiveDialogStore.emitChange();
            break;
        case ActiveDialogConstants.ACTIVE_DIALOG_START_DIALOG:
            startDialog();
            break;
        case ActiveDialogConstants.ACTIVE_DIALOG_HINTS_SHOWN:
            hintsShown(action.data);
            ActiveDialogStore.emitChange();
            break;
        default:
        // no op
    }
});

ActiveDialogStore.setMaxListeners(20);

module.exports = ActiveDialogStore;