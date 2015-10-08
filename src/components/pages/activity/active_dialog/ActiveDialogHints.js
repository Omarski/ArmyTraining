var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Popover = ReactBootstrap.Popover;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');
var ActiveDialogHintStore = require('../../../../stores/active_dialog/ActiveDialogHintStore');
var ActiveDialogActions = require('../../../../actions/active_dialog/ActiveDialogActions');
var ActiveDialogHintActions = require('../../../../actions/active_dialog/ActiveDialogHintActions');

function getCompState(coas) {
    if (!coas) {
        coas = ActiveDialogHintStore.data();
    }
    return {
        coas: coas
    };
}

var ActiveDialogHints = React.createClass({
    getInitialState: function() {
        return getCompState();
    },

    hintAction:function(hint) {
        ActiveDialogActions.setActiveCOA(hint);
    },

    componentWillMount: function() {
        ActiveDialogHintStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentDidMount: function() {
        ActiveDialogHintStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentWillUnmount: function() {
        ActiveDialogHintStore.removeChangeListener(this._onChange);
        ActiveDialogStore.removeChangeListener(this._onDialogChange);
    },

    render: function() {

        var _self = this;

        var hintsList = <ListGroupItem />;

        if (this.state.coas) {
            hintsList = this.state.coas.map(function(item, index) {
                var name = item.coas[0].realizations[0].anima;
                return  <ListGroupItem key={index}>
                    <a className="" href="#" data-animation-name={name} onClick={_self.hintAction.bind(_self, item)}>
                        {item.act}
                    </a>
                </ListGroupItem>
            });
        }


        var hintsPopover =  <Popover id="hintsPopover" title='Hints'>
            <ListGroup>
                {hintsList}
            </ListGroup>
        </Popover>;

        return (
            <OverlayTrigger trigger='click' placement='left' overlay={hintsPopover}>
                <Button className="btn btn-default">
                    Hints
                </Button>
            </OverlayTrigger>

        );
    },

    _onChange: function() {
        this.setState(getCompState());
    },

    _onDialogChange: function() {
        setTimeout(function() {
            ActiveDialogHintActions.create(ActiveDialogStore.activeDialog().coas);
        }, .25);
    }
});

module.exports = ActiveDialogHints;