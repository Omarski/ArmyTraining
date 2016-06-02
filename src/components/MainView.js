var React = require('react');
var BookStore = require('../stores/BookStore');
var CoachFeedbackActions = require('../actions/CoachFeedbackActions');
var LoaderStore = require('../stores/LoaderStore');
var LoaderActions = require('../actions/LoaderActions');
var HeaderView = require('../components/HeaderView');
var ContentView = require('../components/ContentView');
var ConfigStore = require('../stores/ConfigStore');
var FooterView = require('../components/FooterView');
var NotificationView = require('../components/widgets/NotificationView');
var NotificationActions = require('../actions/NotificationActions');
var ConfigActions = require('../actions/ConfigActions');
<<<<<<< HEAD
var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd-html5-backend');
=======
var LocalizationStore = require('../stores/LocalizationStore');
var LocalizationActions = require('../actions/LocalizationActions');
var CoachFeedbackStore = require('../stores/CoachFeedbackStore');
var DliActions = require('../actions/DliActions');
var DliStore = require('../stores/DliStore');
var ReferenceActions = require('../actions/ReferenceActions');
var ReferenceStore = require('../stores/ReferenceStore');
>>>>>>> upstream/master

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

    loadDli: function(){
        DliActions.load();
    },

    loadReference: function (){
        ReferenceActions.load();
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
        DliStore.addChangeListener(this._onDliChange);
        ReferenceStore.addChangeListener(this._onReferenceChange);

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
        var self = this;
        setTimeout(function() {
            self.loadConfiguration();
        }, 100)
    },

    /**
     * Event handler for 'change' events coming from the ConfigStore
     */
    _onConfigChange: function() {
        var self = this;
        setTimeout(function() {
            self.loadCoachFeedback();
        }, 100)
    },

    /**
     * Event handler for 'change' events coming from the CoachFeedbackStore
     */
    _onCoachFeedbackChange: function() {
        var self = this;
        setTimeout(function() {
            self.loadDli();
        }, 100)
    },

    _onDliChange: function (){
        var self = this;
        setTimeout(function() {
            self.loadReference();
        }, 100)
    },

    _onReferenceChange: function(){
        var self = this;
        setTimeout(function() {
            self.loadData();
        }, 100)
    }


});

module.exports = DragDropContext(HTML5Backend)(MainView);