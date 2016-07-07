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
var AppStateActions = require('../actions/AppStateActions');
var PopupView = require('../components/widgets/PopupView');
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

    handleResize: function (e) {
        setTimeout(function() {
            AppStateActions.sizeChange();
        });
    },

    getInitialState: function() {
        var bookState = getBookState();
        bookState.browserPopObj = null;
        bookState.explorerVer = -1;
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
        window.addEventListener('resize', this.handleResize);
        this.prepIEPopup();
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this.handleResize);
        LoaderStore.removeChangeListener(this._onChange);
        ConfigStore.removeChangeListener(this._onConfigChange);
        CoachFeedbackStore.removeChangeListener(this._onCoachFeedbackChange);
        LocalizationStore.removeChangeListener(this._onLocalizationChange);
    },

    prepIEPopup: function(){

        var self = this;
        var ver = this.getInternetExplorerVersion();
        if (ver >= 0 && ver <= 11){

            var ie8Text = (
                <div>
                   Your browser version is unsupported for this course. Please upgrade your browser.
                </div>
            );

            var ie9to11Text = (
                <div>
                    To access all the features of this course, you must have Java enabled on your computer. Please install and/or upgrade Java and allow it to run when prompted.
                </div>
            );


            var popupObj = {
                id:"IEWarning",
                onClickOutside: null,
                popupStyle: {height:'50%', width:'60%', top:'20%', left:'20%', background:'#fff'},

                content: function(){

                    return(
                        <div className="popup-view-content">
                            <div className="popup-view-bodyText">
                                {ver <= 8 ? ie8Text: ie9to11Text}
                            </div>
                            <div className="popup-view-buttonCont" style={{marginTop:'20px'}}>
                                <button type="button" className="btn btn-default"
                                        onClick={self.onCloseIEPopup}>Close</button>
                            </div>
                        </div>
                    )
                }
            };
            self.setState({browserPopObj:popupObj});
        }else self.loadProject();

    },

    getInternetExplorerVersion: function(){

        // Returns the version of Internet Explorer or a -1
        // (indicating the use of another browser).
        {
            var rv = -1; // Return value assumes failure.
            if (navigator.appName == 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent;
                var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat(RegExp.$1);
            }
            this.setState({explorerVer: Math.floor(rv)});
            return Math.floor(rv);
        }
    },

    onCloseIEPopup: function(){
        this.setState({browserPopObj:null});
        if (this.state.explorerVer <= 8){
            return false;
        }else{
            this.loadProject();
        }
    },

    loadProject: function(){
        NotificationActions.show({
            title: 'Please wait',
            body: 'Loading...'
        });
        LocalizationActions.load();
    },


    /**
     * @return {object}
     */
    render: function() {
        var asrFallback = hasGetUserMedia() ? "" : (<ASRWidget />);

        return (
            <div>
                {this.state.browserPopObj ?
                <PopupView
                    id = {this.state.browserPopObj.id}
                    popupStyle = {this.state.browserPopObj.popupStyle}
                    onClickOutside = {this.state.browserPopObj.onClickOutside}
                >{this.state.browserPopObj.content()}
                </PopupView>:null}

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
        }, 100);

        console.log("asdf");
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