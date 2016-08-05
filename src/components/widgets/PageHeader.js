var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Tooltip = ReactBootstrap.Tooltip;
var PageStore = require('../../stores/PageStore');
var PageActions = require('../../actions/PageActions');
var BookmarkActions = require('../../actions/BookmarkActions');
var BookmarkStore = require('../../stores/BookmarkStore');
var Button = ReactBootstrap.Button;
var NotificationActions = require('../../actions/NotificationActions');
var BookmarksView = require('../../components/BookmarksView');
var Popover = ReactBootstrap.Popover;
var ListGroup = ReactBootstrap.ListGroup;
var LocalizationStore = require('../../stores/LocalizationStore');
var AudioControl = require('../../components/widgets/AudioControl');
var SettingsStore = require('../../stores/SettingsStore');

function getPageState(props) {
    var page = null;
    var unitTitle = "";
    var chapterTitle = "";
    var pageTitle = "";
    var bookmarked = false;
    var hidden = false;

    if (PageStore.loadingComplete()) {
        page = PageStore.page();
        unitTitle = PageStore.unit().data.title;
        chapterTitle = PageStore.chapter().title;
        pageTitle = PageStore.page().title;

        if (SettingsStore.showLessonIDs()) {
            pageTitle += " - " + PageStore.chapter().xid + " : " + page.xid;
        }

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

    if (props && props.llHide){
        hidden = props.llHide;
    }

    var sources = "";

    if (props && props.sources && props.sources.length) {
        if (typeof props.sources === Array.isArray) {
            sources = props.sources.concat(", ");
        } else {
            sources = props.sources;
        }
    }




    return {
        sources: sources,
        pageTitle: pageTitle,
        unitTitle: unitTitle,
        chapterTitle: chapterTitle,
        bookmarked: bookmarked,
        hidden: hidden
    };
}

var PageHeader = React.createClass({
    getInitialState: function() {
        return getPageState(this.props);
    },

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
        this.setState(getPageState(this.props));

    },

    bookmarkSelected: function(bm) {
        PageActions.jump(bm);
    },

    render: function() {
        var self = this;
        var popover =  (<Popover id="bookmarksPopover" title='Bookmarks'>
            <ListGroup key="bookmarkbreadcrumbsbutton">
                <Button
                    title={LocalizationStore.labelFor("bookmarks", "tooltipBookmark")}
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
                    id="bookmarkButton"
                    title={LocalizationStore.labelFor("bookmarks", "tooltipBookmark")}
                    alt={LocalizationStore.labelFor("bookmarks", "tooltipBookmark")}
                    type="button"
                    aria-label={LocalizationStore.labelFor("bookmarks", "tooltipBookmark")}
                    className={("btn btn-default btn-link main-nav-audio-control btn-bmk ") + ((this.state.bookmarked) ? "selected" : "")}
                >
                    <img src="images/icons/bookmarkn.png" className="bookmark-icon"/>
                </Button>
            </OverlayTrigger>
        );

        var attributions = (<Tooltip id="sourcesTooltip" unselectable="off" data-selectable="true">{this.state.sources}</Tooltip>);

        var info = "";
        if (this.state.sources !== "") {
            info = (<OverlayTrigger delayHide={40000} placement="right" overlay={attributions}>
                        <img src="images/icons/imageinfo.png" className="bookmark-icon info-sources-icon"/>
                    </OverlayTrigger>);
        }

        var pageTitle = this.state.pageTitle;

        if(this.state.hidden){
            pageTitle = "";
        }

        return  (
            <div className="page-header-custom">
                <div className="page-header-custom-title">
                    <div className="page-title-height">{pageTitle}
                        <small>
                            {info}
                        </small>
                    </div>
                    <ul className="page-header-controls">
                        <li><AudioControl /></li>
                        <li>{bookmarkBtn}</li>
                    </ul>
                </div>
            </div>
        );
    }
});

module.exports = PageHeader;