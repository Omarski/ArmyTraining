var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');
var ActiveDialogActions = require('../../../../actions/active_dialog/ActiveDialogActions');

var _shownOnce = true;
function getCompState(show) {
    return {
        show: show,
        intro: ActiveDialogStore.briefings() || ""
    };
}

var ActiveDialogIntro = React.createClass({

    hideModal: function() {
        _shownOnce = false;
        this.setState(getCompState(false));
        ActiveDialogActions.startDialog();
        ActiveDialogActions.continueDialog();
    },

    getInitialState: function() {
        _shownOnce = true;
        return getCompState(false);
    },

    componentWillMount: function() {
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentWillUnmount: function() {
        ActiveDialogStore.removeChangeListener(this._onDialogChange);
    },

    render: function() {
        var content= "";
        var steps = "";
        var end = "";

        if (this.state.intro && (typeof this.state.intro === "string") && this.state.intro !== "") {
            var intro = this.state.intro;

            if (intro.indexOf("\n")) {
                var parts = intro.split("\n");
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
                id="introModal"
                show={this.state.show}
                onHide={this.hideModal}
                >
                <Modal.Header>
                    <Modal.Title>Intro</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {content}
                    {steps}
                    <br/>
                    {end}
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={this.hideModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    },

    _onDialogChange: function() {
        if (ActiveDialogStore.briefings() !== "") {
            this.setState(getCompState(_shownOnce));
        }
    }
});

module.exports = ActiveDialogIntro;