var React = require('react');
var BreadcrumbsView = require('../components/BreadcrumbsView');
var SettingsView = require('../components/widgets/SettingsView');
var BookStore = require('../stores/BookStore');
var SettingsStore = require('../stores/SettingsStore');
var SettingsActions = require('../actions/SettingsActions');
var ConfigStore = require('../stores/ConfigStore');
var ReactBootstrap = require('react-bootstrap');
var DliView = require("../components/widgets/DliView");
var Modal = ReactBootstrap.Modal;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;

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
    },

    componentDidMount: function() {
        BookStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        BookStore.removeChangeListener(this._onChange);
    },

    openDLI: function(){
        var dliGuides = ConfigStore.getDLIGuides();

        return (dliGuides);
    },

    close: function(){
        this.setState({ showModal: false });
    },

    openDliWindow: function(){
        this.setState({ showModal: true }); /* show modal */
    },

    openReference: function(){
        console.log("attempting to open reference section...(NYI)");
    },

    render: function() {
        var muteIcon = <span className="glyphicon glyphicon-volume-up btn-icon" aria-hidden="true"></span>;
        var dliIcon = <span className="glyphicon glyphicon-book btn-icon" aria-hidden="true"></span>;
        var referenceIcon = <span className="glyphicon glyphicon-education btn-icon" aria-hidden="true"></span>;
        if (this.state.muted) {
            muteIcon = <span className="glyphicon glyphicon-volume-off btn-icon" aria-hidden="true"></span>;
        }

        var popover =   (<OverlayTrigger trigger='click' placement='left' overlay={ConfigStore.constructDLI()}>
            <Button className="btn btn-default btn-lg btn-link main-nav-bar-button">
                <span className="glyphicon glyphicon-education btn-icon" aria-hidden="true"></span>
            </Button>
        </OverlayTrigger>);

        return (
            <nav className="navbar navbar-default navbar-fixed-top">
                <div className="container main-nav-container">
                    <img src="images/VCAT_H5_logo.png" />
                    <div className="navbar-header main-nav-bar-header">

                        <a className="navbar-brand" href="#">{this.state.title}</a>
                    </div>
                    <div id="navbar" className="navbar main-nav-bar">
                        <div className="nav navbar-nav main-nav-bar-nav">
                            <button onClick={this.openDliWindow} type="button" className="btn btn-default btn-lg btn-link main-nav-bar-button" aria-label="sound">
                                {dliIcon}
                            </button>
                            <OverlayTrigger trigger='click' placement='left' overlay={ConfigStore.constructDLI()}>
                                <Button className="btn btn-default btn-lg btn-link main-nav-bar-button">
                                    {referenceIcon}
                                </Button>
                            </OverlayTrigger>
                            <button onClick={this.toggleMute} type="button" className="btn btn-default btn-lg btn-link main-nav-bar-button" aria-label="sound">
                                {muteIcon}
                            </button>
                            <SettingsView />
                        </div>
                    </div>
                    <BreadcrumbsView />
                </div>


                <Modal dialogClassName="dlimodal" bsSize="large" show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>DLI Guides</Modal.Title>
                    </Modal.Header>
                    <Modal.Body id="modalbody">
                        <iframe className="dliframe" src="dli/Urdu_SCO_ur_bc_LSK/ur_bc_LSK/default.html"></iframe>
                    </Modal.Body>
                </Modal>

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