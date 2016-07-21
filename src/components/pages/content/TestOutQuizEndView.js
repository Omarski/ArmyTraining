var React = require('react');
var PageActions = require('../../../actions/PageActions');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');
var PrePostTestActions = require('../../../actions/PrePostTestActions');
var PrePostTestStore = require('../../../stores/PrePostTestStore');
var LocalizationStore = require('../../../stores/LocalizationStore');


function getPageState(props) {
    var data = {
        answers: [],
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

    return data;
}


function TestOutComplete(state) {
    // if passed and accepted then mark units completed
    if (state.bPassed && state.bAccepted && state.unitsPassed && (state.unitsPassed.length > 0)) {

        setTimeout(function() { // TODO <-- dont like this
            // mark the chapters in the units as complete
            PrePostTestActions.markTestOutUnitsComplete(state.unitsPassed);
        });
    }
}


var TestOutQuizEndView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);

        setTimeout(function() {
            PageActions.markChapterComplete();
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

    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;
        var passed = state.bPassed;

        // compile feedback
        var passedRow = "";
        if (passed) {
            passedRow = (
                <div className="row">
                    <div className="col-lg-4">
                        <label className="">
                            <input name="radioGroup" type="radio" className="multiple-choice-checkbox" defaultChecked onChange={this.acceptSelected}></input>
                            {LocalizationStore.labelFor("pretest", "lblCreditAccept")}
                        </label>
                    </div>
                    <div className="col-lg-4">
                        <label className="">
                            <input name="radioGroup" type="radio" className="multiple-choice-checkbox" onChange={this.declinedSelected}></input>
                            {LocalizationStore.labelFor("pretest", "lblCreditDecline")}
                        </label>
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

        return (
            <div>
                <PageHeader sources={state.sources} title={title} key={this.state.page.xid}/>
                <div className="container">
                    <div className="row">
                        <div className="col-sm-12 col-md-12">
                            <div className="quiz-feedback">
                                {state.pageFeedback}
                            </div>
                        </div>
                    </div>
                    {passedRow}
                    <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <table className="table table-bordered table-striped">
                                <TestOutTableHeader/>
                                {testOutRows}
                            </table>
                        </div>

                    </div>
                </div>
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
                <th className="text-center">{LocalizationStore.labelFor("pretest", "headerTitle")}</th>
                <th className="text-center">{LocalizationStore.labelFor("pretest", "headerTestOut")}</th>
            </tr>
        );
    }
});


var TestOutRow = React.createClass({
    render: function() {
        var passed = this.props.passed;
        var title = this.props.title;
        var className = "glyphicon glyphicon-remove-circle quiz-feedback-icon quiz-feedback-icon-incorrect";

        // changed if passed
        if (passed) {
            className = "glyphicon glyphicon-ok-circle quiz-feedback-icon quiz-feedback-icon-correct";
        }

        return (
            <tr>
                <td>
                    {title}
                </td>
                <td>
                    <span className={className}/>
                </td>
            </tr>
        );
    }
});

module.exports = TestOutQuizEndView;
