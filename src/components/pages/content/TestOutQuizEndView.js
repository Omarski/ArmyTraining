var React = require('react');
var AudioPlayer = require('../../widgets/AudioPlayer');
var InfoTagConstants = require('../../../constants/InfoTagConstants');
var PageActions = require('../../../actions/PageActions');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');
var PrePostTestActions = require('../../../actions/PrePostTestActions');
var PrePostTestStore = require('../../../stores/PrePostTestStore');
var LocalizationStore = require('../../../stores/LocalizationStore');
var Utils = require('../../widgets/Utils');


function getPageState(props) {
    var data = {
        answers: [],
        audioObj: null,
        bAccepted: true,
        bPassed: false,
        title: "",
        pageFeedback: "",
        pageType: "",
        page: "",
        sources: [],
        unitsPassed: []
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
    }

    var testOutUnits = {};
    var testOutUnitsOrder = [];  // dont like this

    // get all quiz pages for this section
    var quizPages = PageStore.getChapterQuizPages();

    for (var i = 0; i < quizPages.length; i++) {
        // get page
        var page = quizPages[i];
        var pageId = quizPages[i].xid;

        // get original unit id and title of the page
        var unitId = PrePostTestStore.getUnitIdByPageId(pageId);
        var unitTitle = PrePostTestStore.getUnitTitleByPageId(pageId);

        // check if already added
        if (!testOutUnits[unitId]) {
            testOutUnits[unitId] = {passed: true, title: unitTitle, id: unitId};
            testOutUnitsOrder.push(unitId);
        }

        // if even just 1 is not passed, mark unit as not eligible to test out
        // TODO change so cutoff value can be authored
        if (!page.state || !page.state.answer || page.state.answer.passed !== true) {
            testOutUnits[unitId].passed = false;
        }
    }

    // compile results and feedback
    data.pageFeedback = LocalizationStore.labelFor("pretest", "lblFailed");

    var orderLength = testOutUnitsOrder.length;
    while(orderLength--) {
        var id = testOutUnitsOrder[orderLength];
        if (testOutUnits[id]) {
            data.answers.unshift(testOutUnits[id]);

            // if at least one was passed then change feedback
            if (testOutUnits[id].passed === true) {
                data.bPassed = true;
                data.pageFeedback = LocalizationStore.labelFor("pretest", "lblPassed");
                data.unitsPassed.push(id);
            }
        }
    }

    // find audio feedback
    if (props.page.media) {
        var mediaLength = props.page.media.length;
        while(mediaLength--) {
            var media = props.page.media[mediaLength];

            if (data.bPassed === true) {
                if (Utils.findInfo(media.info, InfoTagConstants.INFO_PROP_PRETESTAUDIOPASS) !== null) {
                    data.audioObj = {id:"audio", autoPlay:true, sources:[{format:"mp3", url:'data/media/' + media.file}]};
                    break;
                }
            } else {
                if (Utils.findInfo(media.info, InfoTagConstants.INFO_PROP_PRETESTAUDIOFAIL) !== null) {
                    data.audioObj = {id:"audio", autoPlay:true, sources:[{format:"mp3", url:'data/media/' + media.file}]};
                    break;
                }
            }
        }
    }

    return data;
}


function TestOutComplete(state) {
    // if passed and accepted then mark units completed
    if (state.bPassed && state.bAccepted && state.unitsPassed && (state.unitsPassed.length > 0)) {

        setTimeout(function() { // TODO <-- dont like this
            // mark the chapters in the units as complete and passed
            PrePostTestActions.markTestOutUnitsComplete(state.unitsPassed);
        });
    }
}


var TestOutQuizEndView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);

        setTimeout(function() {
            PageActions.markChapterComplete();
            PageActions.markChapterPassed();
        });

        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        $('[data-toggle="tooltip"]').tooltip();
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
        TestOutComplete(this.state);
    },

    acceptSelected: function() {
        this.state.bAccepted = true;
    },

    declinedSelected: function() {
        this.state.bAccepted = false;
    },

    playAudio: function(audioObj){
        var self = this;

        this.setState({audioObj:audioObj}, function(){
            if (!audioObj.loop) {
                $("#"+audioObj.id).on("ended", function(){
                    self.setState({audioObj:null});
                });
            }
        });
    },

    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;
        var passed = state.bPassed;

        // compile feedback
        var passedRow = "";
        if (passed) {
            passedRow = (
                <div className="container">
                    <div className="row">
                        <div className="col-sm-6 col-md-6 col-lg-6 test-out-credit-col">
                            <label className="radio">
                                <input name="radioGroup" type="radio" className="multiple-choice-checkbox multiple-choice-radio" defaultChecked onChange={this.acceptSelected}></input>
                                {LocalizationStore.labelFor("pretest", "lblCreditAccept")}
                            </label>
                        </div>
                        <div className="col-sm-6 col-md-6 col-lg-6 test-out-credit-col">
                            <label className="radio">
                                <input name="radioGroup" type="radio" className="multiple-choice-checkbox multiple-choice-radio" onChange={this.declinedSelected}></input>
                                {LocalizationStore.labelFor("pretest", "lblCreditDecline")}
                            </label>
                        </div>
                    </div>
                </div>
            );
        }

        // render rows
        var testOutRows = this.state.answers.map(function(item, index) {
            return (
                <TestOutRow key={index} title={item.title} passed={item.passed}/>
            )
        });

        var str = state.pageFeedback;
        function createFeedback() {
            return {__html: str};
        }

        return (
            <div>
                <PageHeader sources={state.sources} title={title} key={this.state.page.xid}/>
                <div className="test-out-results-container">
                    <h4 dangerouslySetInnerHTML={createFeedback()}></h4>
                    {passedRow}
                    <table className="table table-bordered">
                        <tbody>
                        <TestOutTableHeader/>
                        {testOutRows}
                        </tbody>
                    </table>
                </div>
                {self.state.audioObj ?
                    <AudioPlayer
                        id = {self.state.audioObj.id}
                        sources    = {self.state.audioObj.sources}
                        autoPlay   = {self.state.audioObj.autoPlay}
                        /> : null
                }
            </div>
        );
    },

    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getPageState(this.props));
        }

    }
});

var TestOutTableHeader = React.createClass({
    render: function() {
        return (
            <tr>
                <th className="text-center test-out-results-th">{LocalizationStore.labelFor("pretest", "headerTitle")}</th>
                <th className="text-center test-out-results-th">{LocalizationStore.labelFor("pretest", "headerTestOut")}</th>
            </tr>
        );
    }
});


var TestOutRow = React.createClass({
    render: function() {
        var passed = this.props.passed;
        var title = this.props.title;
        var className = "glyphicon quiz-feedback-icon quiz-feedback-icon-incorrect";
        var icon = (<img src="images/icons/failedquiz.png"/>);

        // changed if passed
        if (passed) {
            className = "glyphicon quiz-feedback-icon quiz-feedback-icon-correct";
            icon = (<img src="images/icons/completeexplorer.png"/>);
        }




        return (
            <tr>
                <td>
                    {title}
                </td>
                <td>
                    <span className={className}>
                        {icon}
                    </span>
                </td>
            </tr>
        );
    }
});

module.exports = TestOutQuizEndView;
