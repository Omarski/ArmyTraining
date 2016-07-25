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
    var objectives = [];
    if (ActiveDialogStore.getObjectives() && (ActiveDialogStore.getObjectives().length > 0)) {
        var arr = ActiveDialogStore.getObjectives();
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            var obj = arr[i];
            if (obj.label && obj.label !== "") {
                objectives.push(obj);
            }
        }
    }
    return {
        objectives: objectives
    };
}

var ActiveDialogObjectives = React.createClass({
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

        var objectivesList = <ListGroupItem />;

        if (this.state.objectives && this.state.objectives.length > 0) {
            objectivesList = this.state.objectives.map(function(item, index) {
                var check = "";
                if (item.pass) {
                    check = <span className="glyphicon glyphicon-ok-sign" aria-hidden="true"></span>
                }

                return  <ListGroupItem key={index}>
                        <table>
                            <tbody>
                                <tr>
                                    <td width="25">{check}</td>
                                    <td>{item.label}</td>
                                </tr>
                            </tbody>
                        </table>

                        </ListGroupItem>
            });
        }

        var objectivesPopover =  <Popover id="objectivesPopover" title='Objectives'>
            <ListGroup>
                {objectivesList}
            </ListGroup>
        </Popover>;

        return (
            <OverlayTrigger trigger='click' placement='bottom' overlay={objectivesPopover} ref="objectivesPopover">
                <Button className="btn btn-default">
                    Objectives
                </Button>
            </OverlayTrigger>

        );
    },

    _onDialogChange: function() {
        this.setState(getCompState());
        var currentAction = ActiveDialogStore.getCurrentAction();
        if (currentAction) {
            if (currentAction.type == ActiveDialogConstants.ACTIVE_DIALOG_ACTION_COMPLETE) {
                // TODO hide overlay
            }
        }
    }
});

module.exports = ActiveDialogObjectives;