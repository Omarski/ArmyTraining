var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Popover = ReactBootstrap.Popover;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');
var ActiveDialogHistoryStore = require('../../../../stores/active_dialog/ActiveDialogHistoryStore');
var ActiveDialogHistoryActions = require('../../../../actions/active_dialog/ActiveDialogHistoryActions');

function getCompState() {
    return {
        history: ActiveDialogHistoryStore.data() || []
    };
}

var ActiveDialogHistory = React.createClass({
    getInitialState: function() {
        return getCompState();
    },

    componentWillMount: function() {
        ActiveDialogHistoryStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentDidMount: function() {
        ActiveDialogHistoryStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentWillUnmount: function() {
        ActiveDialogHistoryStore.removeChangeListener(this._onChange);
        ActiveDialogStore.removeChangeListener(this._onDialogChange);
    },

    render: function() {

        var _self = this;

        var historyList = <ListGroupItem />;

        if (this.state.history) {
            historyList = this.state.history.map(function(item, index) {
                return  <ListGroupItem key={index}>
                    {item.speaker} : {item.label}
                        </ListGroupItem>
            });
        }

        var historyPopover =  <Popover id="historyPopover" title='History'>
            <ListGroup>
                {historyList}
            </ListGroup>
        </Popover>;

        return (
            <OverlayTrigger trigger='click' placement='bottom' overlay={historyPopover} ref="dialogHistoryPopover">
                <Button className="btn btn-default">
                    Dialog
                </Button>
            </OverlayTrigger>

        );
    },

    _onChange: function() {
        this.setState(getCompState());
    },

    _onDialogChange: function() {
        setTimeout(function() {
            ActiveDialogHistoryActions.create({
                inputs: ActiveDialogStore.activeDialog().inputs,
                outputs: ActiveDialogStore.activeDialog().outputs
            });
        }, .25);
    }
});

module.exports = ActiveDialogHistory;