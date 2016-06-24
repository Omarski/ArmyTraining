var React = require('react');
var BreadcrumbsView = require('../components/BreadcrumbsView');
var SettingsView = require('../components/widgets/SettingsView');
var BookStore = require('../stores/BookStore');
var SettingsStore = require('../stores/SettingsStore');
var LocalizationStore = require('../stores/LocalizationStore');
var SettingsActions = require('../actions/SettingsActions');
var ConfigStore = require('../stores/ConfigStore');
var ReactBootstrap = require('react-bootstrap');
var DliView = require("../components/widgets/DliView");
var BookmarksView = require('../components/BookmarksView');
var ReferenceView = require("../components/reference_guide/ReferenceView");
var Navbar = require("react-bootstrap/lib/Navbar");
var NavbarCollapse = require("react-bootstrap/lib/NavbarCollapse");
var Nav = require("react-bootstrap/lib/Nav");
var NavItem = require("react-bootstrap/lib/NavItem");
var NavDropdown = require("react-bootstrap/lib/NavDropdown");
var MenuItem = require("react-bootstrap/lib/MenuItem");
var PanelGroup = require("react-bootstrap/lib/PanelGroup");
var Panel = require("react-bootstrap/lib/Panel");
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var ReferenceActions = require("../actions/ReferenceActions");
var AppStateStore = require("../stores/AppStateStore");


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
        previousVolume: null,
        hideInClass: ({display: "none"})
    };
}

function getPageState(isNav) {
    var page = null;
    var unitTitle = "";
    var chapterTitle = "";
    var pageTitle = "";
    var bookmarked = false;


    if (PageStore.loadingComplete()) {
        page = PageStore.page();
        unitTitle = PageStore.unit().data.title;
        chapterTitle = PageStore.chapter().title;
        pageTitle = PageStore.page().title;

        var bm = {
            unit: PageStore.unit().data.xid,
            chapter: PageStore.chapter().xid,
            page: PageStore.page().xid
        };

        setTimeout(function() {
            BookmarkActions.setCurrent(bm);
        });

    }

    if (BookmarkStore.current() &&
        BookmarkStore.current().page &&
        page &&
        (BookmarkStore.current().page === page.xid)) {
        bookmarked = true;
    }

    return {
        isNav: isNav,
        pageTitle: pageTitle,
        unitTitle: unitTitle,
        chapterTitle: chapterTitle,
        bookmarked: bookmarked
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
        BookStore.removeChangeListener(this._onChange);
        BookStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        BookStore.removeChangeListener(this._onChange);
        ConfigStore.removeChangeListener((this._onChange));
    },
    
    bookmarkFunction: function(){

            var bm = {
                unit: PageStore.unit().data.xid,
                chapter: PageStore.chapter().xid,
                page: PageStore.page().xid,
                title: PageStore.page().title
            };

            NotificationActions.show({
                title:'Bookmark',
                body: PageStore.page().title + ' bookmarked!',
                allowDismiss: true,
                percent: "",
                image: null
            });
            BookmarkActions.create(bm);
            this.setState(getPageState());

    },
    showReferenceView: function(){
        setTimeout(function () {
            ReferenceActions.show(true);
        });
    },
    render: function() {
        var muteIcon = <span className="glyphicon glyphicon-volume-up btn-icon" aria-hidden="true"></span>;
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
            referenceView = (<ReferenceView ref="foo" />);
        }

        var changeNavBarCollapse = function () {
                if(self.state.hideInClass !== ({visibility: "visible"})) {
                    self.setState({hideInClass: ({visibility: "visible"})});
                }
        }

        return (
            <div>
                <Navbar className="navbar-fixed-top navbarHeightDesktop">
                    <Navbar.Header>
                        <img src="images/VCAT_H5_logo.png" className="pull-left vcat-logo"/>
                        <Navbar.Brand>
                                <a className="navbar-brand" href="#">{this.state.title}</a>
                        </Navbar.Brand>
                        <Navbar.Toggle onClick={changeNavBarCollapse} />
                    </Navbar.Header>
                    <NavbarCollapse style={self.state.hideInClass} id="collapseNav">
                        <Nav pullRight className="reduce-padding-around-a-element-for-nav-buttons ul-containing-navbar-buttons">
                            <NavItem eventKey={1} href="#" onClick={self.showReferenceView} ><div>{referenceView}<p>ReferenceView</p></div></NavItem>
                            <NavItem eventKey={2} href="#" className="dli-styling">{dliView}<p>DLI Text</p></NavItem>
                            <NavItem eventKey={3} href="#" onClick={this.toggleMute}>
                                <button title={this.state.muted ? LocalizationStore.labelFor("header", "tooltipUnMute") : LocalizationStore.labelFor("header", "tooltipMute")}
                                        alt={this.state.muted ? LocalizationStore.labelFor("header", "tooltipUnMute") : LocalizationStore.labelFor("header", "tooltipMute")}
                                        type="button"
                                        className="btn btn-default btn-lg btn-link main-nav-bar-button"
                                        aria-label={this.state.muted ? LocalizationStore.labelFor("header", "tooltipUnMute") : LocalizationStore.labelFor("header", "tooltipMute")}>
                                    {muteIcon}
                                </button>
                                <p>Toggle Mute</p>
                            </NavItem>
                            <SettingsView isNav={AppStateStore.isMobile()}/>
                            <BookmarksView isNav={AppStateStore.isMobile()} className="hide-bookmarksview-for-desktop" getPageStateFromParent={getPageState} />
                        </Nav>
                    </NavbarCollapse>
                </Navbar>
                <BreadcrumbsView />
            </div>
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