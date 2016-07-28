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

var ReferenceActions = require('../actions/ReferenceActions');
var ReferenceStore = require('../stores/ReferenceStore');
var AppStateActions = require('../actions/AppStateActions');
var PopupView = require('../components/widgets/PopupView');
var SettingsStore = require('../stores/SettingsStore');
var DevToolsView = require('../components/DevToolsView');
var DevToolsActions = require('../actions/DevToolsActions');



var ASRWidget = require('../components/widgets/ASR');

var bDataLoaded = false;
var _asrLoaded = false;

function getBookState() {
    var books = BookStore.getAll();
    var book = books[0] || null;
    var title = "";
    if (book) {
        title = book.config.title;
    }

    return {
        title: title,
        volume: SettingsStore.voiceVolume()
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



    loadData: function() {
        LoaderActions.load();
    },

    handleResize: function (e) {
        setTimeout(function() {
            AppStateActions.sizeChange();
        });
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
        window.addEventListener('resize', this.handleResize);

        NotificationActions.show({
            title: 'Please wait',
            body: 'Checking system...',
            full: true
        });
        this.systemCheck();
        document.addEventListener("keydown", this.keypress);
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this.handleResize);
        LoaderStore.removeChangeListener(this._onChange);
        ConfigStore.removeChangeListener(this._onConfigChange);
        CoachFeedbackStore.removeChangeListener(this._onCoachFeedbackChange);
        LocalizationStore.removeChangeListener(this._onLocalizationChange);
    },

    systemCheck: function(){

        var self = this;
        var ver = this.getInternetExplorerVersion();
        var infoText = "";
        if (ver >= 0 && ver <= 11){
            var ie8Text = "Your browser version is unsupported for this course. Please upgrade your browser.";
            var ie9to11Text = "To access all the features of this course, you must have Java enabled on your computer. Please install and/or upgrade Java and allow it to run when prompted.";
            infoText = (ver <= 8) ? ie8Text: ie9to11Text;

            NotificationActions.show({
                title: 'Notice',
                body: infoText,
                full: false,
                percent: "",
                onClose: self.onSystemOk

            });
        } else {
            self.loadProject();
        }
    },

    getInternetExplorerVersion: function(){

        // Returns the version of Internet Explorer or a -1
        // (indicating the use of another browser).
        {
            var rv = -1; // Return value assumes failure.

            var iere = new RegExp("Trident");
            var ieua = navigator.userAgent;

            var rvMatch = ieua.match(/(rv:)\d+/g);
            var rvv = "";
            if (rvMatch) {
                rvv = rvMatch[0];
            }

            if (navigator.appName == 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent;
                var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat(RegExp.$1);
            }

            if(iere.test(ieua)){
                rv = rvv.substring(rvv.indexOf(":")+1);
            }
            return Math.floor(rv);
        }
    },

    onSystemOk: function(){
        if (this.getInternetExplorerVersion() <= 8){
            return false;
        }else{
            this.loadProject();
        }
    },

    loadProject: function(){
        NotificationActions.show({
            title: 'Please wait',
            body: 'Loading...',
            onClose: null
        });
        LocalizationActions.load();
    },


    keypress: function(e){
        var event = window.event ? window.event : e;
        if(event.keyCode === 192){ // if right arrow pressed
            DevToolsActions.show();
            event.preventDefault();
        }
    },

    /**
     * @return {object}
     */
    render: function() {
        var asrFallback = "";
        if (LoaderStore.loadingComplete() && !_asrLoaded) {
            _asrLoaded = true;
            asrFallback = hasGetUserMedia() ? "" : (<ASRWidget />);
        }


        return (
            <div>
                <audio id="mainViewAudio" volume={this.state.volume}>
                    <source id="mainViewMp3Source" src="" type="audio/mp3"></source>
                    Your browser does not support the audio format.
                </audio>
                <HeaderView title={this.title} />
                <ContentView />
                <FooterView  />
                <NotificationView />
                <DevToolsView />
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
        }, 100);
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
            self.loadReference();
        }, 100)

    },

    /**
     * Event handler for 'change' events coming from the ReferenceStore
     */
    _onReferenceChange: function(){
        var self = this;
        if (bDataLoaded === false) {
            setTimeout(function() {
                self.loadData();
            }, 100);
            bDataLoaded = true;
        }
    }


});

module.exports = DragDropContext(HTML5Backend)(MainView);