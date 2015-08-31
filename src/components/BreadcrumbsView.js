var React = require('react');
var PageStore = require('../stores/PageStore');
var OverlayTrigger = require('react-bootstrap/').OverlayTrigger;
var Popover = require('react-bootstrap/').Popover;




function getPageState() {
    var page = null;
    var unitTitle = "";
    var chapterTitle = "";
    var pageTitle = "";

    var bookmarks = [];




    if (PageStore.loadingComplete()) {
        page = PageStore.page();
        unitTitle = PageStore.unit().data.title;
        chapterTitle = PageStore.chapter().title;
        pageTitle = PageStore.page().title;
        var pages = PageStore.chapter().pages;
        var pagesLen = pages.length;
        while(pagesLen--) {
            bookmarks.push(pages[pagesLen].title);
        }
    }

    return {
        pageTitle: pageTitle,
        unitTitle: unitTitle,
        chapterTitle: chapterTitle,
        bookmarks: bookmarks
    };
}

var BreadcrumbsView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState();
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var bookmarks = this.state.bookmarks.map(function(item, index) {
           return (<li className="list-group-item" key={index}>{item}</li>);
        });
        var popover = <Popover id="bookmarksList" title='Bookmarks'>
                <button type="button" className="btn btn-success main-nav-bookmark-add">Add this page</button>
                <ul  className="list-group">
                    {bookmarks}
                </ul>
            </Popover>;
        return (
            <div>
                <ol className="breadcrumb main-breadcrumbs">
                    <li><a href="#">{this.state.unitTitle}</a></li>
                    <li><a href="#" >{this.state.chapterTitle}</a></li>
                    <li><a href="#" className="active">{this.state.pageTitle}</a></li>
                </ol>
                <OverlayTrigger trigger='click' placement='left' overlay={popover}>
                    <button
                        id="breadcrumbsButton"
                        type="button"
                        className="btn btn-default btn-link main-nav-bookmark"
                        >
                        <span className="glyphicon glyphicon-bookmark" aria-hidden="true"></span>
                    </button>
                </OverlayTrigger>
            </div>

        );
    },
    _onChange: function() {
        this.setState(getPageState());
    }
});

module.exports = BreadcrumbsView;