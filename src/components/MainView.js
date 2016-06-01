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
var LocalizationStore = require('../stores/LocalizationStore');
var LocalizationActions = require('../actions/LocalizationActions');
var CoachFeedbackStore = require('../stores/CoachFeedbackStore');
var ConfigStore = require('../stores/ConfigStore');

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

    loadConfiguration: function() {
        ConfigActions.load();
    },

    loadCoachFeedback: function() {
        CoachFeedbackActions.load();
    },

    loadData: function() {
        LoaderActions.load();
    },


    getInitialState: function() {
        var bookState = getBookState();
        return bookState;
    },

    componentWillMount: function() {
        LocalizationStore.addChangeListener(this._onLocalizationChange);
        ConfigStore.addChangeListener(this._onConfigChange);
        CoachFeedbackStore.addChangeListener(this._onCoachFeedbackChange);
        LoaderStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        NotificationActions.show({title:'Please wait', body:'Loading...'});
        LocalizationActions.load();
    },

    componentWillUnmount: function() {
        LoaderStore.removeChangeListener(this._onChange);
        ConfigStore.removeChangeListener(this._onConfigChange);
        CoachFeedbackStore.removeChangeListener(this._onCoachFeedbackChange);
        LocalizationStore.removeChangeListener(this._onLocalizationChange);
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
    },

    /**
     * Event handler for 'change' events coming from the LocalizationStore
     */
    _onLocalizationChange: function() {
        console.log("_onLocalizationChange")
        var self = this;
        setTimeout(function() {
            self.loadConfiguration();
        }, 100)
    },

    /**
     * Event handler for 'change' events coming from the ConfigStore
     */
    _onConfigChange: function() {
        console.log("_onConfigChange")
        var self = this;
        setTimeout(function() {
            self.loadCoachFeedback();
        }, 100)
    },

    /**
     * Event handler for 'change' events coming from the CoachFeedbackStore
     */
    _onCoachFeedbackChange: function() {
        console.log("_onCoachFeedbackChange")
        var self = this;
        setTimeout(function() {
            self.loadData();
        }, 100)
    }

});

module.exports = MainView;