var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Popover = ReactBootstrap.Popover;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var ActiveDialogConstants = require('../../../../constants/active_dialog/ActiveDialogConstants');
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');

function getCompState() {

    // reset
    var data =[];

    // get speaker
    var speaker = ActiveDialogStore.getCurrentSpeakerName();

    // get text
    var text = ActiveDialogStore.getCurrentDialogHistory();

    // set data
    if (speaker !== null && text !== null) {
        data.push({speaker: speaker, label: text});
    }

    return {
        history: data
    };
}

var ActiveDialogHistory = React.createClass({
    getInitialState: function() {
        return getCompState();
    },

    componentWillMount: function() {
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentWillUnmount: function() {
        ActiveDialogStore.removeChangeListener(this._onDialogChange);
    },

    render: function() {
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

    _onDialogChange: function() {
        var currentAction = ActiveDialogStore.getCurrentAction();
        if (currentAction && currentAction.type == ActiveDialogConstants.ACTIVE_DIALOG_ACTION_OUTPUT) {
            this.setState(getCompState());
        }
    }
});

module.exports = ActiveDialogHistory;