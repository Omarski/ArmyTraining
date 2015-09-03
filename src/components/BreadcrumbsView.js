var React = require('react');
var PageStore = require('../stores/PageStore');
var PageActions = require('../actions/PageActions');
var BookmarkActions = require('../actions/BookmarkActions');

function getPageState() {
    var page = null;
    var unitTitle = "";
    var chapterTitle = "";
    var pageTitle = "";


    if (PageStore.loadingComplete()) {
        page = PageStore.page();
        unitTitle = PageStore.unit().data.title;
        chapterTitle = PageStore.chapter().title;
        pageTitle = PageStore.page().title;

    }

    return {
        pageTitle: pageTitle,
        unitTitle: unitTitle,
        chapterTitle: chapterTitle
    };
}

var BreadcrumbsView = React.createClass({
    bookmark: function() {
        var bm = {
            unit: PageStore.unit().data.xid,
            chapter: PageStore.chapter().xid,
            page: PageStore.page().xid
        };

        BookmarkActions.create(bm);

    },
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

        return (
            <div>
                <ol className="breadcrumb main-breadcrumbs">
                    <li><a href="#">{this.state.unitTitle}</a></li>
                    <li><a href="#" >{this.state.chapterTitle}</a></li>
                    <li><a href="#" className="active">{this.state.pageTitle}</a></li>
                </ol>

                    <button
                        id="breadcrumbsButton"
                        type="button"
                        className="btn btn-default btn-link main-nav-bookmark"
                        onClick={this.bookmark}
                        >
                        <span className="glyphicon glyphicon-bookmark" aria-hidden="true"></span>
                    </button>

            </div>

        );
    },
    _onChange: function() {
        this.setState(getPageState());
    }
});

module.exports = BreadcrumbsView;