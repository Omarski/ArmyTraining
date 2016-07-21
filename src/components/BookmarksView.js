var React = require('react');
var PageStore = require('../stores/PageStore');
var PageActions = require('../actions/PageActions');
var BookmarkActions = require('../actions/BookmarkActions');
var BookmarkStore = require('../stores/BookmarkStore');
var NotificationActions = require('../actions/NotificationActions');
var ReactBootstrap = require('react-bootstrap');
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var Button = require("react-bootstrap/lib/Button");
var NavDropdown = require("react-bootstrap/lib/NavDropdown");
var MenuItem = require("react-bootstrap/lib/MenuItem");
var LocalizationStore = require('../stores/LocalizationStore');
var UnitStore = require('../stores/UnitStore');
var LoaderStore = require('../stores/LoaderStore');

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

var BookmarksView = React.createClass({
    bookmark: function() {
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
        this.setState(getPageState(this.props.isNav));
    },

    bookmarkSelected: function(bm) {
        PageActions.jump(bm);
    },

    bookmarkRemove: function(bm) {
        BookmarkActions.remove(bm);
    },

    getInitialState: function() {
        var pageState = getPageState(this.props.isNav);
        return pageState;
    },
    menuItemClickedThatShouldntCloseDropdown: function(){
        this._forceOpen = true;
    },
    dropdownToggle: function (newValue) {
        newValue.stopPropagation();
        if (this._forceOpen){
            this.setState({ menuOpen: true });
            this._forceOpen = false;
        } else {
            this.setState({ menuOpen: newValue });
        }
    },

    componentDidMount: function() {
        BookmarkStore.addChangeListener(this._onChange);
        LoaderStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        BookmarkStore.removeChangeListener(this._onChange);
        LoaderStore.removeChangeListener(this._onChange);
    },

    render: function() {

        if (!LoaderStore.loadingComplete()) {
            return (<div></div>);
        }

        var self = this;
        var bookmarks = BookmarkStore.bookmarks();
        var items = null;
        if (bookmarks) {
            if (self.props.isNav) {
                var fakeIndex = 0;
                var subItems = bookmarks.map(function (item, index) {
                    fakeIndex = fakeIndex + 1;
                    return (<MenuItem id={"bookmarkitems" + index} key={"bookmarkitems" + index} eventKey={6 + index} href="#"
                                      className="bookmark-nav-item"
                                      onClick={function(){self.menuItemClickedThatShouldntCloseDropdown()}}>
                        <button className="btn btn-link bookmark-link-btn"
                                onClick={self.bookmarkSelected.bind(self, item)}>{item.title}</button>
                    </MenuItem>);
                });
                subItems.push(<MenuItem id={"bookmarkitems" + fakeIndex} key={"bookmarkitems" + fakeIndex} eventKey={6 + fakeIndex} href="#"
                                        className="bookmark-nav-item"
                                        onClick={function(){self.menuItemClickedThatShouldntCloseDropdown()}}>
                    <button onClick={this.bookmark} className="btn btn-link">{LocalizationStore.labelFor("bookmark", "btnBookmark")}</button>
                </MenuItem>);
                items = (<NavDropdown id={this.props.id} open={self.state.menuOpen} onToggle={function(val){self.dropdownToggle(val)}} eventKey="5"
                                      title={(
                <div id="BookmarkDropdownDiv">
                    <Button
                        title={LocalizationStore.labelFor("bookmark", "lblTitle")}
                        alt={LocalizationStore.labelFor("bookmark", "lblTitle")}
                        type="button"
                        className={"btn btn-default btn-link main-nav-bookmark btn-bmk " + ((this.state.bookmarked) ? "selected" : "")}
                    >
                        <span className="glyphicon glyphicon-bookmark" aria-hidden="true"></span>
                    </Button>
                </div>
                )}>
                    {subItems}
                </NavDropdown>);
            } else {
                var subItems = bookmarks.map(function (item, index) {
                    var unit = UnitStore.getUnitById(item.unit);
                    var unitTitle = (unit) ? unit.data.title : "";
                    var chapter = UnitStore.getChapterById(item.unit, item.chapter);
                    var chapterTitle = (chapter) ? chapter.title : "";

                    return (<ListGroupItem key={"bookmarkitems" + index} className="bookmark-list-item">
                        <button className="btn btn-link bookmark-link-btn" title={chapterTitle + " / " + item.title} onClick={self.bookmarkSelected.bind(self, item)}>{item.title}</button>

                        <button className="btn btn-default bookmark-item-remove" onClick={self.bookmarkRemove.bind(self, item)}>
                            <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                        </button>

                    </ListGroupItem>);
                });
                items = (<ListGroup id="listGroupItems">
                    {subItems}
                </ListGroup>);
            }
        }

        return items;


    },
    _onChange: function() {
        this.setState(getPageState(this.props.isNav));
    }
});

module.exports = BookmarksView;