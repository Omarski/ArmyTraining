var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;
var ActiveDialogHintStore = require('../../../../stores/active_dialog/ActiveDialogHintStore');
var ActiveDialogEvaluationActions = require('../../../../actions/active_dialog/ActiveDialogEvaluationActions');
var ActiveDialogEvaluationStore = require('../../../../stores/active_dialog/ActiveDialogEvaluationStore');

var _shownOnce = false;
function getCompState(show) {

    return {
        show: show,
        evaluation: ActiveDialogEvaluationStore.data() || ""
    };
}

var ActiveDialogEvaluation = React.createClass({

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
                        Evaluation
                    </p>
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