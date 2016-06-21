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
        console.log("bookmark", bookmark);
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
        this.setState(getPageState(this.props.isNav));

    },

    bookmarkSelected: function(bm) {
        PageActions.jump(bm);
    },

    getInitialState: function() {
        var pageState = getPageState(this.props.isNav);
        return pageState;
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
        console.log("bookmarks", bookmarks);
        var items = null;
        if (bookmarks) {
            bookmarks.push({"title":"Bookmark Current Page"});
            if (this.state.isNav) {
                var subItems = bookmarks.map(function(item, index) {
                    if(index !== bookmarks.length){
                                return (<MenuItem key={"bookmarkitems" + index} eventKey={6 + index}  href="#" className="bookmark-nav-item">
                                            <button className="btn btn-link" onClick={self.bookmarkSelected.bind(self, item)}>{item.title}</button>
                                        </MenuItem>);
                    } else if(index === (bookmarks.length - 1)) {
                                return(<MenuItem key={"bookmarkitems" + index} eventKey={6 + index}  href="#" className="bookmark-nav-item" > <button onClick={self.bookmark} className="btn btn-link">Bookmark Current Page</button></MenuItem>);
                            }
                });
                items = (<NavDropdown eventKey="5" title={(
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
                var subItems = bookmarks.map(function(item, index) {
                    return (<ListGroupItem key={"bookmarkitems" + index}>
                        <button className="btn btn-link" onClick={self.bookmarkSelected.bind(self, item)}>{item.title}</button>
                    </ListGroupItem>);
                });
                items = (<ListGroup>
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