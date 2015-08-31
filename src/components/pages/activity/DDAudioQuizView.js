var React = require('react');

var DDAudioQuizView = React.createClass({
    submit: function(event) {
      alert('here');
    },
    wordBankItemDragStart: function(event) {


      alert("questionId " + event.questionId + " : orderIndex " + event.orderIndex);
    },
    shuffle: function(array) {
        var currentIndex = array.length, temporaryValue, randomIndex ;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    },
    getInitialState: function() {
        // answer types : text, image
        // answer correct states: "" = no attempt to answer (nothing dragged), true = correct, false = incorrect
        var data = {
            feedback: "You got %@ two of %@ correct",
            submitLabel: "Submit",
            npcLabel: "NPC",
            userLabel: "User",
            quiz: {
                title: "Drag and drop the words from the word bank into the appropriate slots.",
                questions:[
                    {
                        text: "What are your favorite colors",
                        id: "1",
                        answers: [
                            {
                                "text": "blue",
                                type: "text",
                                image: "",
                                audio: "",
                                "isAnswer": true,
                                correct: "",
                                orderIndex: 1
                            },
                            {
                                "text": "green",
                                type: "text",
                                image: "",
                                audio: "",
                                "isAnswer": true,
                                correct: "",
                                orderIndex: 2
                            },
                            {
                                "text": " are my favorite colors",
                                type: "text",
                                image: "",
                                audio: "",
                                "isAnswer": false,
                                correct: ""
                            }
                        ]

                    },
                    {
                        text: "What are your favorite animals",
                        id: "2",
                        answers: [
                            {
                                "text": "The",
                                type: "text",
                                image: "",
                                audio: "",
                                "isAnswer": false,
                                correct: ""
                            },
                            {
                                "text": "dog",
                                type: "text",
                                image: "",
                                audio: "",
                                "isAnswer": true,
                                correct: "",
                                orderIndex: 1
                            },
                            {
                                "text": "and",
                                type: "text",
                                image: "",
                                audio: "",
                                "isAnswer": false,
                                correct: ""
                            },
                            {
                                "text": "cat",
                                type: "text",
                                image: "",
                                audio: "",
                                "isAnswer": true,
                                correct: "",
                                orderIndex: 2
                            },
                            {
                                "text": "and",
                                type: "text",
                                image: "",
                                audio: "",
                                "isAnswer": false,
                                correct: ""
                            },
                            {
                                "text": "stratiomyid fly",
                                type: "text",
                                image: "",
                                audio: "",
                                "isAnswer": true,
                                correct: "",
                                orderIndex: 3
                            },
                            {
                                "text": " are my animals",
                                type: "text",
                                image: "",
                                audio: "",
                                "isAnswer": false,
                                correct: ""
                            }
                        ]

                    }
                ]
            },
            answers: []
        };

        // grab all answers from quiz for word bank
        var questions = data.quiz.questions;
        var len = questions.length;
        while (len--) {
            var q = questions[len];
            var answers = q.answers;
            var aLen = answers.length;
            while (aLen--) {
                var a = answers[aLen];
                if (a.isAnswer === true) {
                    data.answers.push({
                        answer: a,
                        questionId: q.id
                    });
                }
            }
        }

        this.shuffle(data.answers); // randomize answers bank

        return data;
    },
    componentDidMount: function() {
        var maxWidth = 0;
        var maxHeight = 0;
        $('.dd-draggable-area').each(function(index) {
            var w = $(this).width();
            var h = $(this).height();
            if (w > maxWidth) {
                maxWidth = w;
            }
            if (h > maxHeight) {
                maxHeight = h;
            }
        });

        // set the drop answer areas to the same width as the draggable answers
        $('.dd-drop-answer-area').width(maxWidth).height(maxHeight);
        $('.dd-draggable-area').width(maxWidth).height(maxHeight);
    },
    render: function() {
        var st = this.state;
        var self = this;
        // word bank
        var answers = st.answers.map(function(item, index) {
            var component = <div className="dd-word-bank-text">{item.answer.text}</div>
            if (item.answer.type === "image") {
                component = <img className="img-thumbnail dd-answer-image" />
            }
            return (
                <li className="dd-answer-list-item" key={index}>
                    <div
                        className="dd-draggable-area"
                        data-question-id={item.questionId}
                        data-order-index={item.answer.orderIndex}
                        onClick={self.wordBankItemDragStart.bind(this, {questionId: item.questionId, orderIndex:item.answer.orderIndex})}
                        >{component}</div>
                </li>
            )
        });

        // drop area
        var questions = st.quiz.questions.map(function(question, index) {

            var answers = question.answers.map(function(answer, aIndex) {
                var result = "";
                var answerCls = "dd-drop-answer-area";
                var flag = "";
                if (answer.type === "image") {
                    answerCls += " dd-drop-answer-image";
                }

                if (answer.correct === true) {
                    answerCls += " dd-drop-answer-area-correct";
                    flag = <span className="glyphicon glyphicon-ok-circle dd-flag dd-correct-flag" aria-hidden="true"></span>
                }

                if (answer.correct === false) {
                    answerCls += " dd-drop-answer-area-incorrect";
                    flag = <span className="glyphicon glyphicon-remove-circle dd-flag dd-incorrect-flag" aria-hidden="true"></span>
                }

                if (answer.isAnswer === true) {
                    result = <div className={answerCls}>
                                &nbsp;
                                {flag}
                            </div>
                } else {
                    result = <div className="dd-answer-area-text">{answer.text}</div>
                }

                return (
                    <div key={aIndex}>
                        {result}
                    </div>
                )
            });

            return (
                <div key={index}>
                    <p><span className="dd-player-label">{st.npcLabel}:&nbsp;</span>{question.text}</p>
                    <div className="dd-answer-area">
                        <div className="dd-answer-area-text">
                            <span className="dd-player-label">{st.userLabel}:&nbsp;</span>
                        </div>
                        {answers}
                    </div>
                </div>
            )
        });

        return (
            <div className="container dd-container">
                <div className="row dd-quiz-title">
                    <h3>{this.state.quiz.title}</h3>
                </div>
                <div className="row dd-quiz-feedback">
                    <h4>{this.state.feedback}</h4>
                </div>
                <div className="row">
                    <div className="dd-quiz-container">
                        <div className="col-md-11">
                            {questions}
                        </div>
                        <div className="col-md-1">
                            <ul className="dd-answer-list">
                                {answers}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="row dd-quiz-feedback">
                    <button className="btn btn-default" onClick={this.submit}>{this.state.submitLabel}</button>
                </div>
            </div>
        );
    }
});

module.exports = DDAudioQuizView;