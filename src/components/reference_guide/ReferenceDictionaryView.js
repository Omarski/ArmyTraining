/**
 * Created by Alec on 5/23/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var FilterableTable = require('../widgets/FilterableTable');


function getInitialState(props, self) {
    var data = {
        source: null,
        list: [],
        language: "none"
    };

    if(props && props.source){
        data.source = props.source;
        if(props.language){
            data.language = props.language;
        }
        $.getJSON(data.source, function(file) {
            if(file.Dictionary && file.Dictionary.Uttering){
                file.Dictionary.Uttering.map(function(item){
                    if(item.Utterance && item.Utterance.AleloText){
                        var nativeText = "";
                        var translatedText = "";
                        item.Utterance.AleloText.map(function(textItem){
                            if(textItem.hasOwnProperty("type")){
                                if(textItem.type === "native" || textItem.type === "ezread"){
                                    nativeText = textItem.text;
                                }else if(textItem.type === "translation"){
                                    translatedText = textItem.text;
                                }
                            }
                        });
                        data.list.push({translated: translatedText, native: nativeText});
                    }
                });
                // trigger re-render
                self.forceUpdate();
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

    render: function() {
        var self = this;
        var state = self.state;
        var source = self.state.list;
        return (
            <div id="referenceDictionaryView">
                <FilterableTable dictionary={source}
                                 hasVideo={false}
                                 hasSearch={true}
                                 language={state.language}
                                 hasHeaders={true} />
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = ReferenceDictionaryView;