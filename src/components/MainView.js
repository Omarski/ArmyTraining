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
var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd-html5-backend');
var LocalizationStore = require('../stores/LocalizationStore');
var LocalizationActions = require('../actions/LocalizationActions');
var CoachFeedbackStore = require('../stores/CoachFeedbackStore');
var DliActions = require('../actions/DliActions');
var DliStore = require('../stores/DliStore');
var ASRActions = require('../actions/ASRActions');
var ASRStore = require('../stores/ASRStore');
var ReferenceActions = require('../actions/ReferenceActions');
var ReferenceStore = require('../stores/ReferenceStore');
var ASRWidget = require('../components/widgets/ASR');

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

window.onload = function init(){
    // webkit shim
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL;
};

function hasGetUserMedia(){
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);
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

    loadASR: function(){
        ASRActions.load();
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
        ASRStore.addChangeListener(this._onASRChange);
    },

    componentDidMount: function() {
        NotificationActions.show({
            title: 'Please wait',
            body: 'Loading...'
        });
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
        var asrFallback = hasGetUserMedia() ? "" : (<ASRWidget />);

        return (
            <div>
                <HeaderView title={this.title} />
                <ContentView />
                <FooterView  />
                <NotificationView />
                {asrFallback}
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
            NotificationActions.updateImage(LocalizationStore.labelFor("app", "imageSplash"));
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

    /**
     * Event handler for 'change' events coming from the DLIStore
     */
    _onDliChange: function (){
        var self = this;
        setTimeout(function() {
            self.loadASR();
        }, 100)
    },

    /**
     * Event handler for 'change' events coming from the DLIStore
     */
    _onASRChange: function (){
        var self = this;
        setTimeout(function() {
            self.loadReference();
        }, 100)
    },

    /**
     * Event handler for 'change' events coming from the ReferenceStore
     */
    _onReferenceChange: function(){
        var self = this;
        setTimeout(function() {
            self.loadData();
        }, 100)
    }


});

module.exports = DragDropContext(HTML5Backend)(MainView);