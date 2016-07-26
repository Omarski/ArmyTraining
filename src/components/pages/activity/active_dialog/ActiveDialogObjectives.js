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
                    check = <span className="glyphicon glyphicon-ok-sign pass" aria-hidden="true"></span>
                } else {
                    //check = <span className="glyphicon glyphicon-remove-sign fail" aria-hidden="true"></span> // TODO: Greg, we need to not show this if the user has not got this far
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
                <Button className="btn btn btn-default btn-link active-dialog-toolbar-btn">
                    <span className="glyphicon glyphicon-record" aria-hidden="true"></span>
                </Button>
            </OverlayTrigger>

        );
    },

    _onDialogChange: function() {
        this.setState(getCompState());
        var currentAction = ActiveDialogStore.getCurrentAction();
        if (currentAction) {
            if (currentAction.type == ActiveDialogConstants.ACTIVE_DIALOG_ACTION_COMPLETE) {
                if (this.refs.objectivesPopover) {
                    this.refs.objectivesPopover.hide();
                }
            }
        }
    }
});

module.exports = ActiveDialogObjectives;