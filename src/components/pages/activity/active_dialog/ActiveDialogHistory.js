var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Popover = ReactBootstrap.Popover;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var ActiveDialogHistoryStore = require('../../../../stores/active_dialog/ActiveDialogHistoryStore');
var ActiveDialogActions = require('../../../../actions/ActiveDialogActions');

var _dataLoaded = false;

function getDialogState() {
    return {};
}

var ActiveDialogHistory = React.createClass({
    getInitialState: function() {
        return getDialogState();
    },

    componentWillMount: function() {
        ActiveDialogHistoryStore.addChangeListener(this._onDialogChange);
    },

    componentDidMount: function() {
        ActiveDialogHistoryStore.addChangeListener(this._onDialogChange);
    },

    componentWillUnmount: function() {
        ActiveDialogHistoryStore.removeChangeListener(this._onDialogChange);
    },

    render: function() {
        var items = [];

        var content = items;

        if (items.length === 0) {
            content =   <p>
                Your dialog will appear here as you interact with the scenario.
            </p>
        }
        var hintsPopover =  <Popover id="settingsPopover" title='Dialog'>
            <ListGroup>
                {content}
            </ListGroup>
        </Popover>;

        return (
            <OverlayTrigger trigger='click' placement='left' overlay={hintsPopover}>
                <Button className="btn btn-default">
                    Dialog
                </Button>
            </OverlayTrigger>

        );
    },

    _onDialogChange: function() {
        this.setState(getDialogState());
    }
});

module.exports = ActiveDialogHistory;