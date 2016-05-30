var React = require('react');
var BookStore = require('../stores/BookStore');
var CoachFeedbackActions = require('../actions/CoachFeedbackActions');
var LoaderStore = require('../stores/LoaderStore');
var LoaderActions = require('../actions/LoaderActions');
var HeaderView = require('../components/HeaderView');
var ContentView = require('../components/ContentView');
var FooterView = require('../components/FooterView');
var NotificationView = require('../components/widgets/NotificationView');
var NotificationActions = require('../actions/NotificationActions');
var ConfigActions = require('../actions/ConfigActions');
var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd-html5-backend');

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
        //LoaderStore.addChangeListener(this._onChange);
        NotificationActions.show({title:'Please wait', body:'Loading...'});
        ConfigActions.load();
        CoachFeedbackActions.load();
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

module.exports = DragDropContext(HTML5Backend)(MainView);