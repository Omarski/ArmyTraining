/**
 * Created by Alec on 5/23/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var FormGroup = ReactBootstrap.FormGroup;
var FormControl = ReactBootstrap.FormControl;



function getInitialState(props, self) {
    var data = {
        source: null,
        list: []
    };

    if(props && props.source){
        data.source = props.source;
        $.getJSON(data.source, function(file) {
            if(file.Dictionary){
                if(file.Dictionary.Uttering){
                    file.Dictionary.Uttering.map(function(item){
                        if(item.Utterance){
                            if(item.Utterance.AleloText){
                                var nativeText = "";
                                var translatedText = "";
                                item.Utterance.AleloText.map(function(textItem){
                                    if(textItem.hasOwnProperty("type")){
                                        if(textItem.type === "native"){
                                            nativeText = textItem.text;
                                        }else if(textItem.type === "translation"){
                                            translatedText = textItem.text;
                                        }
                                    }
                                });
                                data.list.push({translated: translatedText, native: nativeText});
                            }
                        }
                    });
                    // trigger re-render
                    self.forceUpdate();
                }
            }
        });
    }

    return data;
}

var ReferenceDictionaryView = React.createClass({
    getInitialState: function() {
        var self = this;
        var initialState = getInitialState(this.props, self);
        return initialState;
    },

    componentWillMount: function() {
        //  SettingsStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //  SettingsStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //  SettingsStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var source = self.state.list;

        return (
            <div id="referenceDictionaryView">
                <FilterableDictionaryTable dictionary={source} />
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = ReferenceDictionaryView;


var SearchBar = React.createClass({
    handleChange: function(event){
        var self = this;
        self.setState({
            filterText: event.target.value
        });
        this.props.onUserInput(event.target.value);
    },

    getInitialState: function(){
        var self = this;
        return(
        {filterText: self.props.filterText}
        );
    },

    render: function(){
        var self = this;
        return(
            <form>
                <input type="text"
                       value={self.state.filterText}
                       placeholder="Search..."
                       ref="filterTextInput"
                       onChange={self.handleChange}
                    />
            </form>
        )
    }
});

var DictionaryRow = React.createClass({
    render: function() {
        var name = this.props.translated;
        var desc = this.props.native;
        return (
            <tr>
                <td>{name}</td>
                <td>{desc}</td>
            </tr>
        );
    }
});

var DictionaryTable = React.createClass({
    getInitialState: function(){
        // save list order in the state
        var data = {
            alpha: true,
            column: 0
        };
        return (data);
    },
    handleClick: function(e){
        //read which column is clicked on and save it to the state


    },
    render: function() {
        var rows = [];
        var self = this;
        this.props.dictionary.forEach(function(item) {
            if(item.native.indexOf(self.props.filterText) === -1 && item.translated.indexOf(self.props.filterText) === -1){
                return;
            }
            rows.push(<DictionaryRow translated={item.translated} native={item.native} />);
        }.bind(self) );
        return (
            <table>
                <thead>
                <tr>
                    <th onClick={this.handleClick}>Translation</th>
                    <th onClick={this.handleClick}>Native</th>
                </tr>
                </thead>
                <tbody className="referenceTable">{rows}</tbody>
            </table>
        );
    }
});

var FilterableDictionaryTable = React.createClass({
    getInitialState: function() {
        return {
            filterText: ""
        };
    },

    handleUserInput: function(ft) {
        this.setState({
            filterText: ft
        });
    },

    render: function() {
        return (
            <div>
                <SearchBar filterText={this.state.filterText}
                           onUserInput={this.handleUserInput}
                    />
                <DictionaryTable filterText={this.state.filterText}
                              dictionary={this.props.dictionary}
                    />
            </div>
        );
    }
});