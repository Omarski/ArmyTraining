var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var ActiveDialogHistoryStore = require('../../../../stores/active_dialog/ActiveDialogHistoryStore');

function getCompState(show) {
    return {
        show: show,
        history: ActiveDialogHistoryStore.data() || []
    };
}

var ActiveDialogHistory = React.createClass({

    showModal: function() {
        this.setState(getCompState(true));
    },

    hideModal: function() {
        this.setState(getCompState(false));
    },

    getInitialState: function() {
        return getCompState(false);
    },

    componentWillMount: function() {
        ActiveDialogHistoryStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        ActiveDialogHistoryStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        ActiveDialogHistoryStore.removeChangeListener(this._onChange);
    },

    render: function() {

        var historyList = <ListGroupItem />;

        if (this.state.history && this.state.history.length > 0) {
            historyList = this.state.history.map(function(item, index) {
                return  <ListGroupItem key={index}>
                            {item.realization.uttText}
                        </ListGroupItem>
            });
        }

        return (
            <div>
                <Button className="btn btn-default" onClick={this.showModal}>
                    Dialog
                </Button>
                <Modal
                    id="historyModal"
                    show={this.state.show}
                    onHide={this.hideModal}
                    >
                    <Modal.Header>
                        <Modal.Title>Dialog</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <ListGroup>
                            {historyList}
                        </ListGroup>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.hideModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    },

    _onChange: function() {
        this.setState(getCompState(this.state.show));
    }
});

module.exports = ActiveDialogHistory;