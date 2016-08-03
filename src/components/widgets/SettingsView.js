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
var AppStateStore = require('../../stores/AppStateStore');

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
        isNav: AppStateStore.isMobile()
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

    /*
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
    },*/

    menuItemClick: function(){
        this._forceOpen = true;
    },
    menuItemClickAutoPlay: function(){
        var self = this;
        this._forceOpen = true;
        this.setState({autoPlaySound: !this.state.autoPlaySound});
        this.setState({autoPlaySound: !this.state.autoPlaySound});
    },
    dropdownToggle: function(newValue){
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
        AppStateStore.addChangeListener(this._onAppStateChange);
        SettingsStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        AppStateStore.removeChangeListener(this._onAppStateChange);
        SettingsStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;


        if(self.state.isNav === false){
            var popover =   <Popover id="settingsPopover" title='Settings'>
                <ListGroup>
                    <ListGroupItem>
                        <form>
                            <Checkbox label='Auto Play Sound' checked={this.state.autoPlaySound} onChange={this.autoPlaySoundChange}>{LocalizationStore.labelFor("settings", "lblAutoPlaySound")}</Checkbox>
                        </form>
                    </ListGroupItem>
                    <ListGroupItem>
                        <h5>{LocalizationStore.labelFor("settings", "lblVoiceVolume")}</h5>
                        <Slider
                            min={0.0}
                            max={this.state.max}
                            step={0.1}
                            value={this.state.voiceVolume}
                            toolTip={false}
                            onSlide={this.voiceVolumeChange} />
                    </ListGroupItem>
                    <ListGroupItem>
                        <h5>{LocalizationStore.labelFor("settings", "lblBackgroundVolume")}</h5>
                        <Slider
                            min={0.0}
                            max={this.state.max}
                            step={0.1}
                            value={this.state.backgroundVolume}
                            toolTip={false}
                            onSlide={this.backgroundVolumeChange} />
                    </ListGroupItem>
                </ListGroup>
            </Popover>;


            /**
             * <ListGroupItem>
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
             <ListGroupItem>
             <Button bsStyle='warning' onClick={this.toggleLessonIDs}>Toggle Lesson IDs</Button>
             </ListGroupItem>
             */

            return  (
                <li>
                    <a>
                        <OverlayTrigger trigger='click' rootClose placement='left' overlay={popover}>
                            <Button title={LocalizationStore.labelFor("header", "tooltipSettings")}
                                    alt={LocalizationStore.labelFor("header", "tooltipSettings")}
                                    aria-label={LocalizationStore.labelFor("header", "tooltipSettings")} className="btn btn-default btn-link btn-lg main-nav-bar-button btn-set">
                                <img src="images/icons/settingsn.png"/>
                            </Button>
                        </OverlayTrigger>
                    </a>
                </li>
            );
        } else {
            return (
                    <NavDropdown id = "settingsViewDropdown" open={this.state.menuOpen} onToggle={function(val){self.dropdownToggle(val)}} eventKey="4"  title={(
                        <div>
                            <Button title={LocalizationStore.labelFor("header", "tooltipSettings")}
                            alt={LocalizationStore.labelFor("header", "tooltipSettings")}
                            aria-label={LocalizationStore.labelFor("header", "tooltipSettings")} className="btn btn-default btn-link btn-lg main-nav-bar-button">
                                    <img src="images/icons/settingsn.png"/>
                            </Button>
                            <p>{LocalizationStore.labelFor("settings", "lblTitle")}</p>
                        </div>
                    )}>
                        <MenuItem key={"SettingsItem_4.1"} eventKey="4.1"  href="#" className="bookmark-nav-item" onClick={function(){self.menuItemClickAutoPlay()}}>
                            <form>
                                <Checkbox label='Auto Play Sound' checked={this.state.autoPlaySound} onChange={this.autoPlaySoundChange}>{LocalizationStore.labelFor("settings", "lblAutoPlaySound")}</Checkbox>
                            </form>
                        </MenuItem>
                        <MenuItem eventKey="4.2" className="large-bookmark-nav-item" onClick={function(){self.menuItemClick()}}>
                            <h5>{LocalizationStore.labelFor("settings", "lblVoiceVolume")}</h5>
                            <Slider
                                min={0.0}
                                max={this.state.max}
                                step={0.1}
                                value={this.state.voiceVolume}
                                toolTip={false}
                                onSlide={this.voiceVolumeChange} />
                        </MenuItem>
                        <MenuItem eventKey="4.3" className="large-bookmark-nav-item" onClick={function(){self.menuItemClick()}}>
                            <h5>{LocalizationStore.labelFor("settings", "lblBackgroundVolume")}</h5>
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
    _onAppStateChange: function () {
        var self = this;
        if (AppStateStore.renderChange()) {
            self.setState({isNav: AppStateStore.isMobile()});
        }

    },

    _onChange: function() {
        this.setState(getSettingsState(this.props.isNav));
    }
});

module.exports = SettingsView;