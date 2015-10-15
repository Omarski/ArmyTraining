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

function getCompState() {
    return {
        coas: ActiveDialogCOAStore.data() || []
    };
}

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
        var animationName = realization.anima;
        var symbol = ActiveDialogStore.findInfoSymbolByAnimationName(animationName);
        var ani = ActiveDialogStore.findInfoAnimationByName(symbol, animationName);
        this.play(ActiveDialogStore.info().composition, symbol.symbolName, symbol.videoName, ani.animationName, ani.start, ani.stop);
        ActiveDialogActions.handleInput(coa);
    },

    getInitialState: function() {
        return getCompState();
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

        if (this.state.coas) {
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
            <Modal.Dialog id="coasModal" title='COAs'>
                <Modal.Header>
                    <Modal.Title>Modal title</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <ListGroup>
                        {coasList}
                    </ListGroup>
                </Modal.Body>

                <Modal.Footer>
                    <Button>Close</Button>
                    <Button bsStyle="primary">Save changes</Button>
                </Modal.Footer>
            </Modal.Dialog>

        );
    },

    _onChange: function() {
        this.setState(getCompState());
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