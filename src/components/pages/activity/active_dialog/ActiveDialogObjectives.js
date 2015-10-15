var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Popover = ReactBootstrap.Popover;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');
var ActiveDialogObjectiveStore = require('../../../../stores/active_dialog/ActiveDialogObjectiveStore');
var ActiveDialogObjectiveActions = require('../../../../actions/active_dialog/ActiveDialogObjectiveActions');

function getCompState() {

    return {
        objectives: ActiveDialogObjectiveStore.data() || []
    };
}

var ActiveDialogObjectives = React.createClass({
    getInitialState: function() {
        return getCompState();
    },

    componentWillMount: function() {
        ActiveDialogObjectiveStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentDidMount: function() {
        ActiveDialogObjectiveStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentWillUnmount: function() {
        ActiveDialogObjectiveStore.removeChangeListener(this._onChange);
        ActiveDialogStore.removeChangeListener(this._onDialogChange);
    },

    render: function() {

        var _self = this;

        var objectivesList = <ListGroupItem />;

        if (this.state.objectives && this.state.objectives.length > 0) {
            objectivesList = this.state.objectives.map(function(item, index) {
                var name = item.objectives[0].realizations[0].anima;
                return  <ListGroupItem key={index}>
                    <a className="" href="#" data-animation-name={name} onClick={_self.hintAction.bind(_self, item)}>
                        {item.act}
                    </a>
                </ListGroupItem>
            });
        }

        var objectivesPopover =  <Popover id="objectivesPopover" title='Objectives'>
            <ListGroup>
                {objectivesList}
            </ListGroup>
        </Popover>;

        return (
            <OverlayTrigger trigger='click' placement='bottom' overlay={objectivesPopover}>
                <Button className="btn btn-default">
                    Objectives
                </Button>
            </OverlayTrigger>

        );
    },

    _onChange: function() {
        this.setState(getCompState());
    },

    _onDialogChange: function() {
        setTimeout(function() {
            ActiveDialogObjectiveActions.create(ActiveDialogStore.activeDialog().objectives);
        }, .25);
    }
});

module.exports = ActiveDialogObjectives;