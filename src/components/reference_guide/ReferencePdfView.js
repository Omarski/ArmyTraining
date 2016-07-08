/**
 * Created by Alec on 7/8/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');


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
        console.dir(e.target);
    },

    render: function() {
        var self = this;
        var state = self.state;
        var rows = state.list.map(function(item){
            return(<tr className={"hand-me"} >
                <td width={"100%"}>
                    <a href={item.path} target={"_blank"}>{item.name}</a>
                </td>
            </tr>)
        });

        return (
            <div id="referencePdfView">
                <table className="table table-striped table-bordered">
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