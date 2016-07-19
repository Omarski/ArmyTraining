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

    var sources = "";
    if (props && props.sources && props.sources.length) {
        //sources = props.sources.concat(", ")
        sources = props.sources;
    }

    return {
        sources: sources,
        pageTitle: pageTitle,
        unitTitle: unitTitle,
        chapterTitle: chapterTitle,
        bookmarked: bookmarked
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
        this.setState(getPageState());

    },

    bookmarkSelected: function(bm) {
        PageActions.jump(bm);
    },

    render: function() {
        var popover =  (<Popover id="bookmarksPopover" title='Bookmarks'>
            <ListGroup key="bookmarkbreadcrumbsbutton">
                <Button
                    id="breadcrumbsButton"
                    type="button"
                    className="btn btn-default btn-block btn-action"
                    onClick={this.bookmark}
                >
                    Bookmark This Page
                </Button>
            </ListGroup>
            <ListGroup>
                <BookmarksView isNav={false}/>
            </ListGroup>
        </Popover>);
        
        var bookmarkBtn = (
            <OverlayTrigger trigger='click' rootClose placement='left' overlay={popover}>
                <Button
                    title={LocalizationStore.labelFor("breadcrumbs", "tooltipBookmark")}
                    alt={LocalizationStore.labelFor("breadcrumbs", "tooltipBookmark")}
                    id="breadcrumbsButton"
                    type="button"
                    aria-label={LocalizationStore.labelFor("breadcrumbs", "tooltipBookmark")}
                    className={("btn btn-default btn-link main-nav-audio-control ") + ((this.state.bookmarked) ? "selected" : "")}
                >
                    <span className="glyphicon glyphicon-bookmark" aria-hidden="true"></span>
                </Button>
            </OverlayTrigger>
        );

        var attributions = <Tooltip id="sourcesTooltip">{this.state.sources}</Tooltip>;
        var info = "";
        if (this.state.sources !== "") {
            info = <OverlayTrigger placement="right" overlay={attributions}>
                        <span className="infoAttributions glyphicon glyphicon-info-sign"></span>
                    </OverlayTrigger>;
        }

        return  <div className="page-header-custom">
            <div className="page-header-custom-title">
                {this.state.pageTitle}
                <small>
                    {info}
                </small>
                <ul className="page-header-controls">
                    <li><AudioControl /></li>
                    <li>{bookmarkBtn}</li>
                </ul>


            </div>
        </div>;
    }
});

module.exports = PageHeader;