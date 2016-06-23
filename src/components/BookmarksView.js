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
            percent: ""
        });
        BookmarkActions.create(bm);
        this.setState(getPageState());

    },

    bookmarkSelected: function(bm) {
        PageActions.jump(bm);
    },

    getInitialState: function() {
        var pageState = getPageState(this.props.isNav);
        return pageState;
    },
    menuItemClickedThatShouldntCloseDropdown: function(){
        this._forceOpen = true;
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
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        PageStore.removeChangeListener(this._onChange);
        PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },
    render: function() {

        var self = this;
        var bookmarks = BookmarkStore.bookmarks();
        var items = "";
        var items = null;
        if (bookmarks) {
            if (self.props.isNav)
                var fakeIndex = 0;
                var subItems = bookmarks.map(function(item, index) {
                    fakeIndex = fakeIndex + 1;
                                return (<MenuItem key={"bookmarkitems" + index} eventKey={6 + index}  href="#" className="bookmark-nav-item" onClick={() => self.menuItemClickedThatShouldntCloseDropdown()}>
                                            <button className="btn btn-link" onClick={self.bookmarkSelected.bind(self, item)}>{item.title}</button>
                                        </MenuItem>);
                });
                subItems.push(<MenuItem key={"bookmarkitems" + fakeIndex} eventKey={6 + fakeIndex}  href="#" className="bookmark-nav-item" onClick={() => self.menuItemClickedThatShouldntCloseDropdown()}> <button onClick={this.bookmark} className="btn btn-link">Bookmark Current Page</button></MenuItem>);
                items = (<NavDropdown open={self.state.menuOpen} onToggle={val => self.dropdownToggle(val)} eventKey="5" title={(
                <div>
                    <Button
                        title={"Bookmarks"}
                        alt={"Bookmarks"}
                        id="breadcrumbsButton"
                        type="button"
                        className={("btn btn-default btn-link main-nav-bookmark ") + ((this.state.bookmarked) ? "selected" : "")}
                    >
                        <span className="glyphicon glyphicon-bookmark" aria-hidden="true"></span>
                    </Button>
                    <p>Bookmarks</p>
                </div>
                )}>
                    {subItems}
                </NavDropdown>);
            } else {
                console.log("bookmarks", bookmarks);
                var subItems = bookmarks.map(function(item, index) {
                    return (<ListGroupItem key={"bookmarkitems" + index}>
                        <button className="btn btn-link" onClick={self.bookmarkSelected.bind(self, item)}>{item.title}</button>
                    </ListGroupItem>);
                });
                items = (<ListGroup>
                    {subItems}
                </ListGroup>);
            }

        return items;


    },
    _onChange: function() {
        this.setState(getPageState(this.props.isNav));
    }
});

module.exports = BookmarksView;