var AppDispatcher = require('../../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActiveDialogConstants = require('../../constants/active_dialog/ActiveDialogConstants');
var ActiveDialogActions = require('../../actions/active_dialog/ActiveDialogActions');
var PageStore = require('../../stores/PageStore');

var assign = require('object-assign');
var CHANGE_EVENT = 'change';
var _data = {};
var _info = {};
var _briefings = "";
var _metrics = {};
var DATA, memory, activityState, blockImg, blockId, objectives;
var asrMode = false;


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

        res.isChoice = res.realizations[0].gesture !== null || res.realizations[0].terp === "L1";
        res.isChoice = !asrMode || res.isChoice; // always use choice if no asr

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
        var token = evalVar( _token )

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
    } )

    return stack[0] === true;
}

function getCOAs() {

    var coas = [];

    DATA.transitions.forEach(function (o, i) {

        if (o.startState === activityState && checkVRQ(o)) {

            coas = coas.concat( makeCOAs( o.inputSymbols, i ) );
        }
    });

    Object.keys(DATA.retq).forEach(function (rid) {

        if( memory[ 'RET_' + rid ] )
        {
            var ret = DATA.retq[rid];

            Object.keys(ret.inputq).forEach(function (iid) {

                if (ret.inputq[iid].outputq.some(checkVRQ)) {

                    coas = coas.concat( makeCOAs( [iid], -1, rid, iid ) );
                }
            });
        }
    });

    return coas;
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

function handleTransitionInput( trans ) {

    activityState = trans.endState;

    // only set if defined
    if (trans.blockImg)
        blockImg = trans.blockImg;

    trans.actions.forEach( function(a)
    {
        if( a.indexOf('GoToBlocking') != -1 )
        {
            blockId = 'b' + a.substring( a.lastIndexOf('-') + 1 );
        }
    } );

    trans.effects.forEach(applyEffect);

    return trans.actions;
}

function handleRetInput(retId, retInputId) {

    return DATA.retq[retId].inputq[retInputId].outputq.filter(checkVRQ).mapFlat(function (output) {

        output.effects.forEach(applyEffect);

        return output.speakerActq;
    });
}

function makeResult( transInd, inputq, outputq, retVid ) {

    var coached = []

    outputq.forEach( function(output) {
        if( output.substr(0, output.indexOf('-') ) == DATA.roles['Coach'] ||
            output.substr(0, output.indexOf('-') ) == DATA.roles['coach']) {
            coached.push( DATA.outputMappings[output]['L1'] );
        }
    });

    var result = {
        'inputs': inputq,
        'outputs': outputq.map( function(output) {
            return {
                'speaker': output.substr(0, output.indexOf('-')),
                'act': output.substr(output.indexOf('-') + 1),
                'action': DATA.outputMappings[output]
            };
        }),
        /**
         *  FSM.handleInput requires a coa from this array as the argument
         */
        'coas': getCOAs(),
        'state' : activityState,
        'memory' : memory,
        'objectives': objectives,
        'image': blockImg,
        'coached': coached,
        'video': transInd === -1 ? retVid : DATA.transitions[transInd].video
    };

    //console.dir(result);
    return result;
}

function handleInput( coa ) {

    nextRandom();

    if( coa === null )
    {
        var garbageInq = DATA.retq['GARBAGE']['inputq'];

        var garbageVids = garbageInq[ Object.keys( garbageInq )[0] ].video;

        return {
            'outputs': [ {'act':'GARBAGE', 'action':'GARBAGE'} ],
            'coas': getCOAs(),
            'state' : activityState,
            'memory' : memory,
            'objectives': objectives,
            'image': blockImg,
            'coached': [],
            'video': garbageVids == null ? null :
                garbageVids[ blockId ] ? garbageVids[ blockId ] :
                    garbageVids['b0000']
        };
    }

    var inputq = coa.realizations;

    var outputq = coa.transitionIndex > -1 ?

        handleTransitionInput( DATA.transitions[coa.transitionIndex] ) :

        handleRetInput( coa.retId, coa.retInputId );

    objectives.forEach( function( o )
    {
        o.pass = evalPostfix( o.condition );
    } );

    var retVideo = coa.transitionIndex > -1 ? null : DATA.retq[coa.retId].inputq[coa.retInputId].video;

    var retVid = retVideo == null ? null :
        retVideo[ blockId ] ? retVideo[ blockId ] :
            retVideo[ 'b0000' ];

    _data = makeResult( coa.transitionIndex, inputq, outputq, retVid );


}

function create(fsm) {
    DATA = fsm.data;

    memory = JSON.parse( JSON.stringify( DATA.initialMemory ) ); // deep copy so DATA contents never mutated

    objectives = JSON.parse( JSON.stringify( DATA.objectives ) ); // deep copy so DATA contents never mutated


    objectives.forEach( function( o ) { o.pass = false; } );

    activityState = 's0';

    // set initial blocking image
    if (fsm.nodesPy) {
        blockImg = fsm.nodesPy;
    }
    // overwrite old method if new one is in place
    if (DATA.blockings) {
        if (DATA.blockings["InitialBlocking"]) {
            blockImg = DATA.blockings["InitialBlocking"].background;
        }
    }

    blockId = 'b0000';

    nextRandom();

    if( DATA.transitions.length > 0 && DATA.transitions[0].inputSymbols[0] === 'automatic' )
    {
        _data =  makeResult( 0, [], handleTransitionInput(DATA.transitions[0], 0) );
    }
    else
    {
        _data = makeResult( -1, [], [], null );
    }
    _info = fsm.info;
    _briefings = DATA.briefings.s0.description;
}

function destroy() {
    DATA = null;
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
            ActiveDialogActions.create({data: result, info: info});
        });
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        console.log("error " + textStatus);
        console.log("incoming Text " + jqXHR.responseText);
    });
}


function setActiveCOA(coa) {
    if (coa) {
        _data['activeCOA'] = coa;
    }

}

function hintsShown() {
    // Greg here is where you would store the hints shown count
    /*
    var metrics = {
        duration: PageStore.duration(),
        hintsShown: 25,
        objectives: ActiveDialogStore.activeDialog().objectives,
        inputs: ActiveDialogStore.activeDialog().inputs,
        outputs: ActiveDialogStore.activeDialog().outputs
    }*/

}

var ActiveDialogStore = assign({}, EventEmitter.prototype, {

    activeDialog: function() {
        return _data;
    },

    info: function() {
        return _info;
    },

    briefings: function () {
        return _briefings;
    },

    findInfoSymbolByAnimationName: function(name) {
        var len = _info.symbols.length;
        var symbol = null;
        var found = false;
        while(len--) {
            var sym = _info.symbols[len];
            var aniLen = sym.animations.length;
            while(aniLen--) {
                var ani = sym.animations[aniLen];
                if (ani.animationName === name) {
                    symbol = sym;
                    found = true;
                    break;
                }
            }

            if (found) {
                break;
            }
        }

        return symbol;
    },

    findInfoAnimationByName: function(symbol, name) {
        var len = symbol.animations.length;
        var animation = null;

        while(len--) {
            var ani = symbol.animations[len];
            if (ani.animationName === name) {
                animation = ani;
                break;
            }
        }

        return animation;
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
            create(action.data);
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
        case ActiveDialogConstants.ACTIVE_DIALOG_SET_ACTIVE_COA:
            setActiveCOA(action.data);
            ActiveDialogStore.emitChange();
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