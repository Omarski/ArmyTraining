var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');
var ActiveDialogActions = require('../../../../actions/active_dialog/ActiveDialogActions');
var ActiveDialogCOAActions = require('../../../../actions/active_dialog/ActiveDialogCOAActions');
var ActiveDialogCOAStore = require('../../../../stores/active_dialog/ActiveDialogCOAStore');
var ActiveDialogHistoryActions = require('../../../../actions/active_dialog/ActiveDialogHistoryActions');

function getCompState(show) {
    return {
        show: show,
        coas: ActiveDialogCOAStore.data() || []
    };
}

var _actionSound = "";

var ActiveDialogCOAs = React.createClass({

    play: function(compName, symbolName, childName, animKey, start, end) {
        var sym = AdobeEdge.getComposition(compName).getStage().getSymbol(symbolName);
        var symChild = sym.$(childName)[0];
        var pos = sym.getLabelPosition(start)/1000;
        var pause = sym.getLabelPosition(end)/1000;

        symChild.currentTime = pos;

        symChild.addEventListener("timeupdate", function() {
            if(symChild.currentTime >= pause) {
                symChild.pause();
                symChild.removeEventListener("timeupdate");
            }
        });

        symChild.play();
    },

    coaAction: function (coa, realization) {
        this.hideModal();
        var animationName = realization.anima;
        var symbol = ActiveDialogStore.findInfoSymbolByAnimationName(animationName);
        var ani = ActiveDialogStore.findInfoAnimationByName(symbol, animationName);
        this.play(ActiveDialogStore.info().composition, symbol.symbolName, symbol.videoName, ani.animationName, ani.start, ani.stop);
        ActiveDialogActions.handleInput(coa);
        console.log('realization')
        console.log(realization)

        var outputs = ActiveDialogStore.activeDialog().outputs;
        var speaker = "";
        var sounds = [];
        if (outputs) {
            var len = outputs.length;
            for (var i = 0; i < len; i++) {
                var o = outputs[i];
                var action = o.action;
                speaker = o.speaker;
                sounds.push(action.sound);
                var animation = action.anima;
                var oSymbol = ActiveDialogStore.findInfoSymbolByAnimationName(animation);
                var oAni = ActiveDialogStore.findInfoAnimationByName(oSymbol, animation);
                this.play(ActiveDialogStore.info().composition, oSymbol.symbolName, oSymbol.videoName, oAni.animationName, oAni.start, oAni.stop);
            }
        }
        console.log('in coaAction')
        ActiveDialogHistoryActions.create({coa: coa, realization:realization, speaker: speaker});
        this.playSounds(sounds);
    },

    playSounds: function(sounds) {
        if (sounds.length) {
            var self = this;
            var sound = sounds.shift();

            if (_actionSound !== sound) {
                _actionSound = sound;

                var player = document.getElementById('activeDialogAudioPlayer');
                player.setAttribute('src', 'data/media/' + sound + '.mp3');

                player.addEventListener('loadeddata', function(ev) {
                    this.removeEventListener('loadeddata');
                    this.play();
                });

                player.addEventListener('ended', function(ev) {
                    this.removeEventListener('ended');
                    self.playSounds(sounds);
                });

                player.load();
            }
        }
    },

    hideModal: function() {
        this.setState(getCompState(false));
    },

    getInitialState: function() {
        return getCompState(false);
    },

    componentWillMount: function() {
        ActiveDialogCOAStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentDidMount: function() {
        ActiveDialogCOAStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentWillUnmount: function() {
        ActiveDialogCOAStore.removeChangeListener(this._onChange);
        ActiveDialogStore.removeChangeListener(this._onDialogChange);
    },

    render: function() {

        var _self = this;

        var coasList = <ListGroupItem />;

        if (this.state.coas && this.state.coas.length > 0) {
            coasList = this.state.coas.map(function(item, index) {
                var name = item.realization.anima;
                return  <ListGroupItem key={index}>
                    <a className="" href="#" data-animation-name={name} onClick={_self.coaAction.bind(_self, item.coa, item.realization)}>
                        {item.realization.uttText}
                    </a>
                </ListGroupItem>
            });
        }

        return (
            <Modal
                id="coasModal"
                show={this.state.show}
                onHide={this.hideModal}
                >
                <Modal.Header>
                    <Modal.Title>Choose</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <ListGroup>
                        {coasList}
                    </ListGroup>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={this.hideModal}>Close</Button>
                </Modal.Footer>

            </Modal>
        );
    },

    _onChange: function() {
        var show = (this.state.coas && this.state.coas.length > 0);
        this.setState(getCompState(show));
    },

    _onDialogChange: function() {
        if (ActiveDialogStore.activeDialog() && ActiveDialogStore.activeDialog().activeCOA) {
            setTimeout(function() {
                ActiveDialogCOAActions.create(ActiveDialogStore.activeDialog().activeCOA);
            }, .25);
        }
    }
});



module.exports = ActiveDialogCOAs;