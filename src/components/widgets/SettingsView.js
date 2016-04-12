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
var SettingsActions = require('../../actions/SettingsActions');

function getSettingsState() {
    var settings = store.get('settings') || {};

    return {
        autoPlaySound: settings.autoPlaySound,
        backgroundVolume: settings.backgroundVolume || 1.0,
        muted: settings.muted,
        voiceVolume: settings.voiceVolume || 1.0,
        max : 1.0
    };
}

var SettingsView = React.createClass({
    getInitialState: function() {
        var settingsState = getSettingsState(this.props);
        return settingsState;
    },

    voiceVolumeChange: function(event) {
        var value = event.value || event;
        SettingsActions.updateVoiceVolume(value);
        $('audio,video').prop("volume", SettingsStore.voiceVolume());
    },

    backgroundVolumeChange: function(event) {
        var value = event.value || event;
        SettingsActions.updateBackgroundVolume(value);
    },

    autoPlaySoundChange: function(event) {
        SettingsActions.updateAutoPlaySound();
    },

    clearBookmark: function() {
        BookmarkActions.destroy();
    },

    resetProgress: function() {
        PageActions.reset();
    },

    resetSettings: function() {
        SettingsActions.destroy();
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
                                        <Input type='checkbox' label='Auto Play Sound' checked={this.state.autoPlaySound} onChange={this.autoPlaySoundChange} />
                                    </form>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <h5>Voice Volume</h5>
                                    <Slider
                                        min={0.0}
                                        max={this.state.max}
                                        step={0.1}
                                        value={this.state.voiceVolume}
                                        toolTip={false}
                                        onSlide={this.voiceVolumeChange} />
                                </ListGroupItem>
                                <ListGroupItem>
                                    <h5>Background Sound Volume</h5>
                                    <Slider
                                        min={0.0}
                                        max={this.state.max}
                                        step={0.1}
                                        value={this.state.backgroundVolume}
                                        toolTip={false}
                                        onSlide={this.backgroundVolumeChange} />
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
                                <ListGroupItem>
                                    <Button bsStyle='info' onClick={this.resetSettings}>Reset Settings</Button>
                                </ListGroupItem>
                            </ListGroup>
                        </Popover>;

        return  <OverlayTrigger trigger='click' placement='left' overlay={popover}>
                    <Button className="btn btn-default btn-link btn-lg main-nav-bar-button">
                        <span className="glyphicon glyphicon-cog btn-icon" aria-hidden="true"></span>
                    </Button>
                </OverlayTrigger>
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = SettingsView;