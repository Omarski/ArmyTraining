/**
 * Created by Alec on 7/8/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var LocalizationStore = require('../../stores/LocalizationStore');


function getSettingsState(props) {
    var data = {
        list: []
    };

    if(props && props.list ){
        data.list = props.list;
    }

    return data;
}

var ReferencePdfView = React.createClass({
    getInitialState: function() {
        var settingsState = getSettingsState(this.props);
        return settingsState;
    },

    handleClick: function(e){
    },

    render: function() {
        var self = this;
        var state = self.state;
        var rows = state.list.map(function(item, i){
            return(<tr key={"referencePdfView-tableRow-"+item.name+"-"+i} className={"hand-me"} >
                <td width={"100%"}>
                    <a href={item.path} target={"_blank"}>{item.name}</a>
                </td>
            </tr>)
        });

        return (
            <div id="referencePdfView">
                <table className="table table-striped table-bordered">
                    <thead className="pdf-header">
                        <tr><td width={"100%"}>
                            {LocalizationStore.labelFor("reference", "refDliInstructions")}
                        </td></tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = ReferencePdfView;