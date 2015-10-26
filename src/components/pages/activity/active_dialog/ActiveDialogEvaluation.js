var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;
var ActiveDialogHintStore = require('../../../../stores/active_dialog/ActiveDialogHintStore');
var ActiveDialogObjectiveStore = require('../../../../stores/active_dialog/ActiveDialogObjectiveStore');
var ActiveDialogEvaluationActions = require('../../../../actions/active_dialog/ActiveDialogEvaluationActions');
var ActiveDialogEvaluationStore = require('../../../../stores/active_dialog/ActiveDialogEvaluationStore');

var _shownOnce = false;
var _current = null;
var _currentIndex = 0;
var _startCourse = false;
function getCompState(show) {

    return {
        show: show,
        startCourse: _startCourse,
        current: _current,
        evaluation: ActiveDialogEvaluationStore.data() || ""
    };
}

var ActiveDialogEvaluation = React.createClass({
    next: function() {
        var objectives = ActiveDialogObjectiveStore.data().objectives;
        if (_current) {
            if (_currentIndex < objectives.length - 1) {
                _currentIndex++;
            } else {
                _startCourse = true;
            }
        }
        _current = objectives[_currentIndex];
        this.setState(getCompState(this.state.show));
    },

    previous: function() {
        var objectives = ActiveDialogObjectiveStore.data().objectives;
        if (_current) {
            if (_currentIndex != 0) {
                _currentIndex--;
            }
        }
        _current = objectives[_currentIndex];
        this.setState(getCompState(this.state.show));
    },

    start: function() {
        alert('start');
    },

    hideModal: function() {
        this.setState(getCompState(false));
    },

    getInitialState: function() {
        return getCompState(false);
    },

    componentWillMount: function() {
        ActiveDialogEvaluationStore.addChangeListener(this._onChange);
        ActiveDialogHintStore.addChangeListener(this._onDialogChange);
    },

    componentDidMount: function() {
        ActiveDialogEvaluationStore.addChangeListener(this._onChange);
        ActiveDialogHintStore.addChangeListener(this._onDialogChange);
    },

    componentWillUnmount: function() {
        ActiveDialogEvaluationStore.removeChangeListener(this._onChange);
        ActiveDialogHintStore.removeChangeListener(this._onDialogChange);
    },

    render: function() {
        var content = "Click the forward and back buttons to review the objectives from this episode.";
        var title = "Objectives";

        if (this.state.current) {
            title = this.state.current.label;
            if (this.state.current.pass) {
                content = this.state.current.passDescription;
            } else {
                content = this.state.current.failDescription;
            }
        }

        if (this.state.startCourse) {
            content = ( <div>
                        <p>
                            <h4>I want to start my course</h4>
                        </p>
                        <button type="button" className="btn btn-default" aria-label="Next" onClick={this.start}>
                            Continue
                        </button>
                        </div>);
        }
        return (
            <Modal
                id="evaluationModal"
                show={this.state.show}
                onHide={this.hideModal}
                >
                <Modal.Header>
                    <Modal.Title>Evaluation</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>
                        Great job! You are well on your way to mastering conversations in Chinese.  Zhang was really imporessed by your language skills. Don't worry if you made a few mistakes. Learning a new language is not easy.  The only way you can get better is to keep trying!
                    </p>
                    <ul>
                        <li>You scored: </li>
                        <li>Total play time was: </li>
                        <li>Total number of hints viewed: </li>
                        <li>Total number of hints used: </li>
                    </ul>
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <h3 className="panel-title">{title}</h3>
                        </div>
                        <div className="panel-body">
                            <table className="table">
                                <tr>
                                    <td width="25" valign="middle">
                                        <button type="button" className="btn btn-default" aria-label="Previous" onClick={this.previous}>
                                            <span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                                        </button>
                                    </td>
                                    <td>
                                        <p>
                                        {content}
                                        </p>
                                    </td>
                                    <td width="25" valign="middle">
                                        <button type="button" className="btn btn-default" aria-label="Next" onClick={this.next}>
                                            <span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
                                        </button>
                                    </td>
                                </tr>
                            </table>

                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={this.hideModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    },

    _onChange: function() {
        var show = (this.state.evaluation && this.state.evaluation.length !== "");
        if (!_shownOnce && show) {
            _shownOnce = true;
            this.setState(getCompState(show));
        }

    },

    _onDialogChange: function() {
        if (ActiveDialogHintStore.initialized() && ActiveDialogHintStore.data().length === 0) {
            setTimeout(function() {
                ActiveDialogEvaluationActions.create({});
            }, .25);
        }
    }
});

module.exports = ActiveDialogEvaluation;