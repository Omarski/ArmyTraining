var React = require('react');
var PageStore = require('../stores/PageStore');
var PageActions = require('../actions/PageActions');
var BookmarkActions = require('../actions/BookmarkActions');
var BookmarkStore = require('../stores/BookmarkStore');
var LocalizationStore = require('../stores/LocalizationStore');
var NotificationActions = require('../actions/NotificationActions');
var BookmarksView = require('../components/BookmarksView');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Popover = ReactBootstrap.Popover;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;

function getPageState() {
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
        pageTitle: pageTitle,
        unitTitle: unitTitle,
        chapterTitle: chapterTitle,
        bookmarked: bookmarked
    };
}

var BreadcrumbsView = React.createClass({
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
        this.setState(getPageState());

    },

    bookmarkSelected: function(bm) {
        PageActions.jump(bm);
    },

    getInitialState: function() {
        var pageState = getPageState();
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
        var popover =  (<Popover id="bookmarksPopover" title='Bookmarks'>
            <ListGroup key="bookmarkbreadcrumbsbutton">
                <Button
                    alt={LocalizationStore.labelFor("bookmarks", "tooltipBookmark")}
                    type="button"
                    aria-label={LocalizationStore.labelFor("bookmarks", "tooltipBookmark")}
                    className="btn btn-default btn-block btn-action"
                    onClick={this.bookmark}
                >
                    {LocalizationStore.labelFor("bookmarks", "btnBookmark")}
                </Button>
            </ListGroup>
            <ListGroup>
                <BookmarksView isNav={false}/>
            </ListGroup>
        </Popover>);

        var bookmarkBtn = (
            <OverlayTrigger trigger='click' rootClose placement='left' overlay={popover}>
                <Button
                    title={LocalizationStore.labelFor("bookmarks", "tooltipBookmark")}
                    alt={LocalizationStore.labelFor("bookmarks", "tooltipBookmark")}
                    type="button"
                    aria-label={LocalizationStore.labelFor("bookmarks", "tooltipBookmark")}
                    className={("btn btn-default btn-link main-nav-bookmark ") + ((this.state.bookmarked) ? "selected" : "")}
                >
                    <span className="glyphicon glyphicon-bookmark" aria-hidden="true"></span>
                </Button>
            </OverlayTrigger>
        );

        return (
            <div>
                <div className="hide-bread-crumbs-for-tablet">
                    <ol className="breadcrumb main-breadcrumbs">
                        <li><a href="#">{this.state.unitTitle}</a></li>
                        <li><a href="#" >{this.state.chapterTitle}</a></li>
                        <li><a href="#" className="active">{this.state.pageTitle}</a></li>
                    </ol>
                    {bookmarkBtn}
                </div>

                <div className="hide-bread-crumbs-for-browser">
                    {bookmarkBtn}
                </div>
            </div>
        );
    },
    _onChange: function() {
        this.setState(getPageState());
    }
});

module.exports = BreadcrumbsView;