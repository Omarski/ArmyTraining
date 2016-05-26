/**
 * Created by Alec on 4/11/2016.
 */
var React = require('react');
var PageActions = require('../../../actions/PageActions');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');


function getPageState(props) {
    var data = {
        answers: [],
        title: "",
        pageFeedback: "",
        pageFeedback1: "Your score was {0}%. You may want to review the section and try this quiz again.", // TODO <--- should be moved to store and localization text
        pageFeedback2: "Your score was {0}%. You're on the right track! I can see that you are working hard to \
        remember all of the cultural information you have learned. However, your quiz score does not permit you to move \
        on to the next section. Please take a few minutes to review this section. When you feel that you're ready, try the quiz again.", // TODO <--- should be moved to store and localization text
        pageFeedback3: "Your score was {0}%. Congratulations! You have successfully completed this section. You may now \
        move on to the next section in your course of instruction.", // TODO <--- should be moved to store and localization text
        pageType: "",
        page: "",
        quizPassed: false,
        sources: [],
        scorePercent: 0
    }

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
    }

    // get all quiz pages for this section
    var quizPages = PageStore.getChapterQuizPages();
    var quizPagesIter = 0;
    var quizPagesPassed = 0;

    // for each quiz page check if it was complete
    while(quizPagesIter < quizPages.length) {

        // get quiz page
        var quizPage = quizPages[quizPagesIter];

        // increment
        quizPagesIter++;

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


    // calculate score
    var feedback = "";
    if (quizPages.length > 0) {
        data.scorePercent = Math.round((quizPagesPassed / quizPages.length) * 100);

        // get feedback text
        if (data.scorePercent === 100) {
            feedback = data.pageFeedback3;
            data.quizPassed = true;
        } else {
            feedback = data.pageFeedback1;
        }
    } else {
        feedback = data.pageFeedback1;
    }


    // update text
    data.pageFeedback = replaceScoreText(data.scorePercent, feedback);

    return data;
}

function replaceScoreText(score, text) {
    return text.replace("{0}", score.toString());
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

    componentWillUpdate: function(){

    },

    componentDidUpdate: function(){

    },

    componentWillUnmount: function() {

    },

    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;
        var pageType = state.pageType;

        // render rows
        var questionsRows = this.state.answers.map(function(item, index) {
            return (
                <QuizAnswerRow answer={item.answer} passed={item.passed} key={index} question={item.question}/>
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

                            <table className="table table-bordered quiz-feedback-table">
                                <QuizTableHeader/>
                                {questionsRows}
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

var QuizTableHeader = React.createClass({
   render: function() {
       return (
           <tr className="">
               <th>Correct</th>
               <th>Question</th>
               <th>Answer</th>
           </tr>
       );
   }
});


var QuizAnswerRow = React.createClass({
    render: function() {

        var answer = this.props.answer;
        var passed = this.props.passed;
        var question = this.props.question;
        var className = "glyphicon glyphicon-remove-circle quiz-feedback-icon quiz-feedback-icon-incorrect"

        // changed if passed
        if (passed) {
            className = "glyphicon glyphicon-ok-circle quiz-feedback-icon quiz-feedback-icon-correct"
        }

        return (
            <tr className="">
                <td>
                    <div className={className}/>
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
