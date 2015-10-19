var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');
var ActiveDialogActions = require('../../../../actions/active_dialog/ActiveDialogActions');
var ActiveDialogIntroActions = require('../../../../actions/active_dialog/ActiveDialogIntroActions');
var ActiveDialogIntroStore = require('../../../../stores/active_dialog/ActiveDialogIntroStore');

var _shownOnce = false;
function getCompState(show) {

    return {
        show: show,
        intro: ActiveDialogIntroStore.data() || ""
    };
}

var ActiveDialogIntro = React.createClass({

    hideModal: function() {
        this.setState(getCompState(false));
    },

    getInitialState: function() {
        return getCompState(false);
    },

    componentWillMount: function() {
        ActiveDialogIntroStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentDidMount: function() {
        ActiveDialogIntroStore.addChangeListener(this._onChange);
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentWillUnmount: function() {
        ActiveDialogIntroStore.removeChangeListener(this._onChange);
        ActiveDialogStore.removeChangeListener(this._onDialogChange);
    },

    render: function() {
        return (
            <Modal
                id="introModal"
                show={this.state.show}
                onHide={this.hideModal}
                >
                <Modal.Header>
                    <Modal.Title>Choose</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>
                        {this.state.intro}
                    </p>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={this.hideModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    },

    _onChange: function() {
        var show = (this.state.intro && this.state.intro.length !== "");
        if (!_shownOnce && show) {
            _shownOnce = true;
            this.setState(getCompState(show));
        }

    },

    _onDialogChange: function() {
        if (ActiveDialogStore.briefings() !== "") {
            setTimeout(function() {
                ActiveDialogIntroActions.create(ActiveDialogStore.briefings());
            }, .25);
        }
    }
});

module.exports = ActiveDialogIntro;