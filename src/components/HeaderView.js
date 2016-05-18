var React = require('react');
var BreadcrumbsView = require('../components/BreadcrumbsView');
var SettingsView = require('../components/widgets/SettingsView');
var BookStore = require('../stores/BookStore');
var SettingsStore = require('../stores/SettingsStore');
var SettingsActions = require('../actions/SettingsActions');
var ConfigStore = require('../stores/ConfigStore');
var ReactBootstrap = require('react-bootstrap');
var DliView = require("../components/widgets/DliView");
var ReferenceView = require("../components/reference_guide/ReferenceView");
var Modal = ReactBootstrap.Modal;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Popover = ReactBootstrap.Popover;

function getBookState() {
    var books = BookStore.getAll();
    var book = null;
    var title = "";
    for (var key in books) {
        book = books[key];
        break;
    }

    if (book) {
        title = book.data.config.title;
    }
    return {
        title: title,
        muted: SettingsStore.muted(),
        showModal: false,
        previousVolume: null
    };
}

var HeaderView = React.createClass({
    toggleMute: function() {
        var settings = store.get('settings') || {};
        var previousVolume = this.state.previousVolume;
        var vol = 1.0;
        if(settings.voiceVolume != null){ // false if 0
            vol = settings.voiceVolume;
        }
        // ok? why are you not updating???
        this.state.muted = !this.state.muted;
        if(!this.state.muted) { // if un-muting
            if(previousVolume !== null){ // if there was a previous Volume
                vol = previousVolume;
            }
            $('audio,video').prop("volume", vol);
        } else { // if muting
            previousVolume = vol;
            $('audio,video').prop("volume", 0.0);
        }

        this.setState({
            previousVolume: previousVolume
        });
        SettingsActions.updateMuted(this.state.muted);
    },
    getInitialState: function() {
        var bookState = getBookState();
        return bookState;
    },

    componentWillMount: function() {
        BookStore.addChangeListener(this._onChange);
        ConfigStore.addChangeListener((this._onChange));
    },

    componentDidMount: function() {
        BookStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        BookStore.removeChangeListener(this._onChange);
        ConfigStore.removeChangeListener((this._onChange));
    },


    openReference: function(){
        console.log("attempting to open reference section...(NYI)");
    },

    getCurrentDliPath: function(){

    },

    updateDliPath:function(){

    },

    render: function() {
        var muteIcon = <span className="glyphicon glyphicon-volume-up btn-icon" aria-hidden="true"></span>;
        var referenceIcon = <span className="glyphicon glyphicon-education btn-icon" aria-hidden="true"></span>;
        var self = this;
        if (this.state.muted) {
            muteIcon = <span className="glyphicon glyphicon-volume-off btn-icon" aria-hidden="true"></span>;
        }
        var dliView = "";
        var referenceView = "";
        if(ConfigStore.hasDLI()){
            dliView = (<DliView />);
        }
        if(ConfigStore.hasReference()){
            referenceView = (<button onClick={this.openReference} type="button" className="btn btn-default btn-lg btn-link main-nav-bar-button" aria-label="sound">
                {referenceIcon}
            </button>);
        }

        return (
            <nav className="navbar navbar-default navbar-fixed-top">
                <div className="container main-nav-container">
                    <img src="images/VCAT_H5_logo.png" />
                    <div className="navbar-header main-nav-bar-header">

                        <a className="navbar-brand" href="#">{this.state.title}</a>
                    </div>
                    <div id="navbar" className="navbar main-nav-bar">
                        <div className="nav navbar-nav main-nav-bar-nav">
                            {dliView}
                            {referenceView}
                            <button onClick={this.toggleMute} type="button" className="btn btn-default btn-lg btn-link main-nav-bar-button" aria-label="sound">
                                {muteIcon}
                            </button>
                            <SettingsView />
                        </div>
                    </div>
                    <BreadcrumbsView />
                </div>

            </nav>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getBookState());
        }
    }
});

module.exports = HeaderView;