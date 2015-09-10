var React = require('react');
var BreadcrumbsView = require('../components/BreadcrumbsView');
var SettingsView = require('../components/widgets/SettingsView');
var BookStore = require('../stores/BookStore');

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
        title: title
    };
}

var HeaderView = React.createClass({
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
    render: function() {
        return (
            <nav className="navbar navbar-default navbar-fixed-top">
                <div className="container main-nav-container">
                    <div className="navbar-header main-nav-bar-header">
                        <a className="navbar-brand" href="#">{this.state.title}</a>
                    </div>
                    <div id="navbar" className="navbar main-nav-bar">
                        <div className="nav navbar-nav main-nav-bar-nav">
                            <button type="button" className="btn btn-default btn-lg btn-link" aria-label="Left Align">
                                <span className="glyphicon glyphicon-volume-up btn-icon" aria-hidden="true"></span>
                            </button>
                            <SettingsView />
                        </div>
                    </div>
                    <BreadcrumbsView />
                </div>
            </nav>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        this.setState(getBookState());
    }
});

module.exports = HeaderView;