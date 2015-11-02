var React = require('react');
var BookStore = require('../stores/BookStore');
var LoaderStore = require('../stores/LoaderStore');
var LoaderActions = require('../actions/LoaderActions');
var HeaderView = require('../components/HeaderView');
var ContentView = require('../components/ContentView');
var FooterView = require('../components/FooterView');
var NotificationView = require('../components/widgets/NotificationView');
var NotificationActions = require('../actions/NotificationActions');

function getBookState() {
    var books = BookStore.getAll();
    var book = books[0] || null;
    var title = "";
    if (book) {
        title = book.config.title;
    }

    return {
        title: title
    };
}

var MainView = React.createClass({


    getInitialState: function() {
        var bookState = getBookState();
        return bookState;
    },

    componentWillMount: function() {
        LoaderStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        LoaderStore.addChangeListener(this._onChange);
        NotificationActions.show({title:'Please wait', body:'Loading...'});
        LoaderActions.load();
    },

    componentWillUnmount: function() {
        LoaderStore.removeChangeListener(this._onChange);
    },

    /**
     * @return {object}
     */
    render: function() {
        return (
            <div>
                <HeaderView title={this.title} />
                <ContentView />
                <FooterView  />
                <NotificationView />
            </div>
        );
    },

    /**
     * Event handler for 'change' events coming from the LoaderStore
     */
    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getBookState());
        }
    }

});

module.exports = MainView;