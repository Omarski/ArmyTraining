var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var DevToolsStore = require('../stores/DevToolsStore');
var Button = ReactBootstrap.Button;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var BookmarkActions = require('../actions/BookmarkActions');
var PageActions = require('../actions/PageActions');
var DevToolsActions = require('../actions/DevToolsActions');
var UnitActions = require('../actions/UnitActions');
var SettingsActions = require('../actions/SettingsActions');
var LocalizationStore = require('../stores/LocalizationStore');

function getDevToolsState() {
    return {
    };
}

var DevToolsView = React.createClass({
    getInitialState: function() {
        var settingsState = getDevToolsState(this.props);
        return settingsState;
    },

    clearBookmark: function() {
        BookmarkActions.destroy();
    },

    resetProgress: function() {
        PageActions.reset();
        UnitActions.reset();
    },

    resetSettings: function() {
        SettingsActions.destroy();
    },

    toggleLessonIDs: function() {
        SettingsActions.toggleLessonIDs();
    },

    componentDidMount: function() {
        DevToolsStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        DevToolsStore.removeChangeListener(this._onChange);
    },
    render: function() {
        return  (
            <div id="devToolsView" className="modal fade" data-backdrop="static">
                <div className={"modal-dialog"}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal" aria-label={LocalizationStore.labelFor("tools", "mdlClose")}><span aria-hidden="true">&times;</span></button>
                            <h4 className="modal-title">Dev Tools</h4>
                        </div>
                        <div className="modal-body">
                            <ListGroup>
                                <ListGroupItem>
                                    <Button bsStyle='warning' onClick={this.clearBookmark}>Clear Bookmark</Button>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <Button bsStyle='danger' onClick={this.resetProgress}>Reset Progress</Button>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <Button bsStyle='info' onClick={this.resetSettings}>Reset DevTools</Button>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <Button bsStyle='warning' onClick={this.toggleLessonIDs}>Toggle Lesson IDs</Button>
                                </ListGroupItem>
                            </ListGroup>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-default" data-dismiss="modal">{LocalizationStore.labelFor("tools", "mdlClose")}</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    _onChange: function() {
        this.setState(getDevToolsState());
    }
});

module.exports = DevToolsView;