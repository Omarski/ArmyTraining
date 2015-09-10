var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var SettingsStore = require('../../stores/SettingsStore');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Popover = ReactBootstrap.Popover;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var Input = ReactBootstrap.Input;
var Slider = require('../../components/widgets/Slider');

var BookmarkActions = require('../../actions/BookmarkActions');
var PageActions = require('../../actions/PageActions');

function getSettingsState() {
    return {
        value: 5,
        max : 10
    };
}

var SettingsView = React.createClass({
    getInitialState: function() {
        var settingsState = getSettingsState(this.props);
        return settingsState;
    },

    increment: function(event) {
        var value = this.state.value;
        if(value >= this.state.max) {
            value = this.state.max - 1;
        }
        this.setState({
            value: value + 1
        });
    },

    didChange: function(event) {
        var value = event.value || event;
        this.setState({
            value: value
        });
    },

    clearBookmark: function() {
        BookmarkActions.destroy();
    },

    resetProgress: function() {
        PageActions.reset();
    },

    componentWillMount: function() {
        SettingsStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        SettingsStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        SettingsStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var popover =   <Popover id="settingsPopover" title='Settings'>
                            <ListGroup>
                                <ListGroupItem>
                                    <form>
                                        <Input type='checkbox' label='Auto Play Sound' checked readOnly />
                                    </form>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <h5>Voice Volume</h5>
                                    <Slider
                                        min={0}
                                        max={this.state.max}
                                        step={1}
                                        value={this.state.value}
                                        toolTip={false}
                                        onSlide={this.didChange} />
                                </ListGroupItem>
                                <ListGroupItem>
                                    <h5>Background Sound Volume</h5>
                                    <Slider
                                        min={0}
                                        max={this.state.max}
                                        step={1}
                                        value={this.state.value}
                                        toolTip={false}
                                        onSlide={this.didChange} />
                                </ListGroupItem>
                                <ListGroupItem>
                                    <p><i>BUTTONS BELOW ARE FOR DEVELOPERS NOT FOR FINAL PRODUCT</i></p>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <Button bsStyle='warning' onClick={this.clearBookmark}>Clear Bookmark</Button>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <Button bsStyle='danger' onClick={this.resetProgress}>Reset Progress</Button>
                                </ListGroupItem>
                            </ListGroup>
                        </Popover>;

        return  <OverlayTrigger trigger='click' placement='left' overlay={popover}>
                    <Button className="btn btn-default btn-link btn-lg">
                        <span className="glyphicon glyphicon-cog btn-icon" aria-hidden="true"></span>
                    </Button>
                </OverlayTrigger>
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = SettingsView;