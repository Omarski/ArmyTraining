var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var SettingsStore = require('../../stores/SettingsStore');
var LocalizationStore = require('../../stores/LocalizationStore');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Popover = ReactBootstrap.Popover;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var Checkbox = ReactBootstrap.Checkbox;
var Slider = require('../../components/widgets/Slider');

var BookmarkActions = require('../../actions/BookmarkActions');
var PageActions = require('../../actions/PageActions');
var SettingsActions = require('../../actions/SettingsActions');
var UnitActions = require('../../actions/UnitActions');
var NavDropdown = require("react-bootstrap/lib/NavDropdown");
var MenuItem = require("react-bootstrap/lib/MenuItem");

function getSettingsState(isNav) {
    var settings = store.get('settings') || {};

    var v = 1.0;
    if(settings.voiceVolume || settings.voiceVolume === 0){
        v = settings.voiceVolume;
    }

    var bv = 1.0;
    if(settings.backgroundVolume || settings.backgroundVolume === 0){
        bv = settings.backgroundVolume;
    }

    var aps = true;
    if(settings.autoPlaySound === false){
        aps = false;
    }

    return {
        autoPlaySound: aps,
        backgroundVolume: bv,
        muted: settings.muted,
        voiceVolume: v,
        max : 1.0,
        isNav: isNav
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
        UnitActions.reset();
    },

    resetSettings: function() {
        SettingsActions.destroy();
    },
    menuItemClickedThatShouldntCloseDropdown: function(){
        this._forceOpen = true;
    },
    menuItemClickedThatShouldntCloseDropdownAndChangeAutoPlay: function(){
        var self = this;
        this._forceOpen = true;
        this.setState({autoPlaySound: !this.state.autoPlaySound});
        this.setState({autoPlaySound: !this.state.autoPlaySound});
    },
    dropdownToggle(newValue){
        if (this._forceOpen){
            this.setState({ menuOpen: true });
            this._forceOpen = false;
        } else {
            this.setState({ menuOpen: newValue });
        }
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
        var self = this;
        if(self.props.isNav === false){
            var popover =   <Popover id="settingsPopover" title='Settings'>
                <ListGroup>
                    <ListGroupItem>
                        <form>
                            <Checkbox label='Auto Play Sound' checked={this.state.autoPlaySound} onChange={this.autoPlaySoundChange}>Toggle AutoPlay</Checkbox>
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

            return  (
                        <li>
                            <a>
                                <OverlayTrigger trigger='click' rootClose placement='left' overlay={popover}>
                                    <Button title={LocalizationStore.labelFor("header", "tooltipSettings")}
                                            alt={LocalizationStore.labelFor("header", "tooltipSettings")}
                                            aria-label={LocalizationStore.labelFor("header", "tooltipSettings")} className="btn btn-default btn-link btn-lg main-nav-bar-button">
                                        <span className="glyphicon glyphicon-cog btn-icon" aria-hidden="true"></span>
                                    </Button>
                                </OverlayTrigger>
                            </a>
                        </li>
                    );
        } else {
            return (
                    <NavDropdown open={this.state.menuOpen} onToggle={val => this.dropdownToggle(val)} eventKey="4"  title={(
                        <div>
                            <Button title={LocalizationStore.labelFor("header", "tooltipSettings")}
                            alt={LocalizationStore.labelFor("header", "tooltipSettings")}
                            aria-label={LocalizationStore.labelFor("header", "tooltipSettings")} className="btn btn-default btn-link btn-lg main-nav-bar-button">
                                    <span className="glyphicon glyphicon-cog btn-icon" aria-hidden="true"></span>
                            </Button>
                            <p>Settings</p>
                        </div>
                    )}>
                        <MenuItem key={"SettingsItem_4.1"} eventKey="4.1"  href="#" className="bookmark-nav-item" onClick={() => this.menuItemClickedThatShouldntCloseDropdownAndChangeAutoPlay()}>
                            <form>
                                <Checkbox label='Auto Play Sound' checked={this.state.autoPlaySound} onChange={this.autoPlaySoundChange}>Toggle AutoPlay</Checkbox>
                            </form>
                        </MenuItem>
                        <MenuItem eventKey="4.2" className="large-bookmark-nav-item" onClick={() => this.menuItemClickedThatShouldntCloseDropdown()}>
                            <h5>Voice Volume</h5>
                            <Slider
                                min={0.0}
                                max={this.state.max}
                                step={0.1}
                                value={this.state.voiceVolume}
                                toolTip={false}
                                onSlide={this.voiceVolumeChange} />
                        </MenuItem>
                        <MenuItem eventKey="4.3" className="large-bookmark-nav-item" onClick={() => this.menuItemClickedThatShouldntCloseDropdown()}>
                            <h5>Background Sound Volume</h5>
                            <Slider
                                min={0.0}
                                max={this.state.max}
                                step={0.1}
                                value={this.state.backgroundVolume}
                                toolTip={false}
                                onSlide={this.backgroundVolumeChange} />
                        </MenuItem>
                    </NavDropdown>
            );
        }
    },
    _onChange: function() {
        this.setState(getSettingsState(this.props.isNav));
    }
});

module.exports = SettingsView;