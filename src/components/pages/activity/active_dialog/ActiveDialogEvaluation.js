var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');
var ActiveDialogActions = require('../../../../actions/active_dialog/ActiveDialogActions');
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
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentDidMount: function() {
        ActiveDialogEvaluationStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentWillUnmount: function() {
        ActiveDialogEvaluationStore.removeChangeListener(this._onChange);
        ActiveDialogStore.removeChangeListener(this._onDialogChange);
    },

    render: function() {



        var content= "";
        var steps = "";
        var end = "";

        if (this.state.evaluation && (typeof this.state.evaluation === "string") && this.state.evaluation !== "") {
            var evaluation = this.state.evaluation;

            if (evaluation.indexOf("\n")) {
                var parts = evaluation.split("\n");
                content = parts.shift();
                end = parts.pop();

                steps = parts.map(function(item, index) {
                    return (
                        <p key={index}>
                            {item}
                        </p>
                    );
                });
            }
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
                        {content}
                        {steps}
                        <br/>
                        {end}
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
        if (ActiveDialogStore.briefings() !== "") {
            setTimeout(function() {
                ActiveDialogEvaluationActions.create(ActiveDialogStore.briefings());
            }, .25);
        }
    }
});

module.exports = ActiveDialogEvaluation;