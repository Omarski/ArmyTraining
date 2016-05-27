/**
 * Created by Alec on 5/23/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var FilterableTable = require('../widgets/FilterableTable');


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
                <FilterableTable dictionary={source} hasVideo={false} hasHeaders={true} />
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = ReferenceDictionaryView;