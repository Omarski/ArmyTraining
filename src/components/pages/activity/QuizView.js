/**
 * Created by Alec on 4/11/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var PageActions = require('../../../actions/PageActions');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');
var LocalizationStore = require('../../../stores/LocalizationStore');


function getPageState(props) {
    var data = {
        answers: [],
        title: "",
        pageFeedback: "",
        pageType: "",
        page: "",
        quizPassed: false,
        sources: [],
    }

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
    }

    // get all quiz pages for this section
    var quizPages = PageStore.getChapterQuizPages();
    var quizPageCount = 0;
    var quizPagesPassed = 0;

    // for each quiz page check if it was complete
    while(quizPageCount < quizPages.length) {

        // get quiz page
        var quizPage = quizPages[quizPageCount];

        // increase count
        quizPageCount++;

        // get quizPage answer object
        if (quizPage.state && quizPage.state.answer) {
            var quizAnswer = quizPage.state.answer;
            var answer;
            var passed;
            var question;

            // get correct answer
            if (quizAnswer.target) {
                answer = quizAnswer.target
            }

            // get question
            if (quizAnswer.question) {
                question = quizAnswer.question;
            }

            // check if passed
            if (quizAnswer.passed === true) {
                quizPagesPassed++;
                passed = true;

            } else {
                passed = false;
            }

            data.answers.push({answer: answer, passed: passed, question: question});
        }

    }


    // calculate score and update feedback text
    if (quizPageCount > 0) {
        var scorePercent = Math.round((quizPagesPassed / quizPageCount) * 100);

        // get feedback text
        if (scorePercent === 100) {
            data.pageFeedback = LocalizationStore.labelFor("quizEnd", "lblPassed", [scorePercent]);
            data.quizPassed = true;
        } else {
            data.pageFeedback = LocalizationStore.labelFor("quizEnd", "lblFailed", [scorePercent]);
        }
    } else {
        data.pageFeedback= LocalizationStore.labelFor("quizEnd", "lblFailed", [0]);
    }

    return data;
}

var QuizView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);

        if (pageState.quizPassed) {
            setTimeout(function() {
                PageActions.markChapterComplete();
            });
        }

        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        $('[data-toggle="tooltip"]').tooltip();
    },

    restartQuiz: function() {
        PageActions.restartQuiz();
    },

    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;
        var passed = state.quizPassed;

        // render rows
        var questionsRows = this.state.answers.map(function(item, index) {
            return (
                <QuizAnswerRow answer={item.answer} passed={item.passed} key={index} question={item.question}/>
            )
        });

        // render button
        var restartButton = "";
        if (passed !== true) {
            restartButton = <Button bsStyle='default' onClick={this.restartQuiz}>{LocalizationStore.labelFor("quizEnd", "btnRestart")}</Button>
        }

        var str = state.pageFeedback;
        function createFeedback() {
            return {__html: str};
        }
        
        return (
            <div>
                <PageHeader sources={state.sources} title={title} key={this.state.page.xid}/>
                <div className="test-out-results-container">
                    <h4 dangerouslySetInnerHTML={createFeedback()}></h4>
                    <table className="table table-bordered">
                        <tbody>
                            <QuizTableHeader/>
                            {questionsRows}
                        </tbody>
                    </table>
                    <div className="test-out-results-btn-container">
                        {restartButton}
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

var QuizTableHeader = React.createClass({
   render: function() {
       return (
           <tr className="">
               <th className="text-center test-out-results-th">{LocalizationStore.labelFor("quizEnd", "headerResult")}</th>
               <th className="text-center test-out-results-th">{LocalizationStore.labelFor("quizEnd", "headerQuestion")}</th>
               <th className="text-center test-out-results-th">{LocalizationStore.labelFor("quizEnd", "headerAnswer")}</th>
           </tr>
       );
   }
});


var QuizAnswerRow = React.createClass({
    render: function() {

        var answer = this.props.answer;
        var passed = this.props.passed;
        var question = this.props.question;
        var className = "glyphicon quiz-feedback-icon quiz-feedback-icon-incorrect"
        var icon = (<img src="images/icons/failedquiz.png"/>);



        // changed if passed
        if (passed) {
            className = "glyphicon quiz-feedback-icon quiz-feedback-icon-correct"
            icon = (<img src="images/icons/completeexplorer.png"/>);
        }

        return (
            <tr className="">
                <td>
                    <div className={className}>
                        {icon}
                    </div>
                </td>
                <td>
                    {question}
                </td>
                <td>
                    {answer}
                </td>
            </tr>
        );
    }
});

module.exports = QuizView;
