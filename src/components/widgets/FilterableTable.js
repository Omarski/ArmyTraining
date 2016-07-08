/**
 * Created by Alec on 5/26/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var SettingsStore = require('../../stores/SettingsStore');

var SORTED_ARROW_CLS = "glyphicon glyphicon-triangle-bottom";
var REVERSE_SORTED_ARROW_CLS = "glyphicon glyphicon-triangle-top";

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
            <form className="form-horizontal reference-view-search-form">
                <div className="form-group">
                    <div>
                        <input
                            id="dictionarySearchInput"
                            className="form-control"
                            type="search"
                            value={self.state.filterText}
                            placeholder="Search..."
                            onChange={self.handleChange}
                            />
                    </div>
                </div>
            </form>
        )
    }
});

// returns a <tr> with 2 <td> elements
var DictionaryRow = React.createClass({
    render: function() {
        var name = this.props.translated;
        var desc = this.props.native;
        var hc = "";
        var path = "";
        var nw = "50%";
        var dw = "50%";

        if(this.props.handleClick){
            hc = this.props.handleClick;
        }
        if(this.props.path){
            path = this.props.path;
        }
        if(this.props.nameWidth){
            nw = this.props.width;
        }
        if(this.props.descWidth){
            dw = this.props.height;
        }
        return (
            <tr onClick={hc}>
                <td data-source={path} width={nw}>{name}</td>
                <td data-source={path} width={dw}>{desc}</td>
            </tr>
        );
    }
});


// table that takes the search string from it's parent to filter what is shown
// can choose to show headers or not
// headers are clickable to sort the columns alphabetically
var DictionaryTable = React.createClass({
    getInitialState: function(){
        // save list order in the state
        var data = {
            sortPreference: "translation",
            sortOrder: "forward",
            sortReverse: false,
            language: "none"
        };

        if(this.props && this.props.language){
            data.language = this.props.language;
        }

        return (data);
    },
    handleClick: function(e){
       // (e.target) returns <th>native</th> or <th>translated</th>
        var state = this.state;
        var target = e.target.innerText;
        var reverse = this.state.sortReverse;
        // which column was clicked
        if(target === state.language){
            // if we were already sorting by this, reverse it
            if(this.state.sortPreference === "native"){
                reverse = !reverse;
            }
            this.setState({
                sortPreference: "native",
                sortReverse: reverse
            });
        }else if(target === "English"){
            // if we were already sorting by this, reverse it
            if(this.state.sortPreference === "translation"){
                reverse = !reverse;
            }
            this.setState({
                sortPreference: "translation",
                sortReverse: reverse
            });
        }
    },
    render: function() {
        var rows = [];
        var self = this;
        var state = self.state;
        var headers = "";
        var hc = "";
        var language = state.language;
        if(this.props.handleClick){
            hc = this.props.handleClick;
        }
        this.props.dictionary.forEach(function(item, index) {
            //compare values after toLowerCase() so it is not case sensitive
            if(item.hasOwnProperty('native')){
                if(item.native.toLowerCase().indexOf(self.props.filterText.toLowerCase()) === -1 && item.translated.toLowerCase().indexOf(self.props.filterText.toLowerCase()) === -1){
                    return;
                }
                rows.push(<DictionaryRow key={"dictionaryRowKey" + state.sortPreference + (state.sortOrder ? "0" : "1") + index}
                                         translated={item.translated}
                                         native={item.native}/>);
            }else if(item.hasOwnProperty('description')){
                var path = "";
                if(item.description.toLowerCase().indexOf(self.props.filterText.toLowerCase()) === -1 && item.name.toLowerCase().indexOf(self.props.filterText.toLowerCase()) === -1){
                    return;
                }
                path = item.path;
                rows.push(<DictionaryRow key={"dictionaryRowKey" + state.sortPreference + (state.sortOrder ? "0" : "1") + index}
                                         translated={item.name}
                                         native={item.description}
                                         handleClick={hc}
                                         nameWidth={"10%"}
                                         descWidth={"90%"}
                                         path={path}
                    />);
            }

        }.bind(self) );

        // sort rows by the method determined by where the user has clicked
        // sortPreference is which column being sorted,
        // sortReverse will toggle with consecutive clicks on a column header
        if(rows && rows[0]){
            rows = rows.sort(function(a, b){
                var one = "";
                var two = "";

                // collect the strings to be tested
                if(state.sortPreference === "translation") {
                    one = a.props.translated.toLowerCase();
                    two = b.props.translated.toLowerCase();
                }else if(state.sortPreference === "native") {
                    one = a.props.native.toLowerCase();
                    two = b.props.native.toLowerCase();
                }

                // return 1 if item a comes before item b,
                // -1 if b comes before a,
                // 0 if they are equal
                var val = 1;
                if(one > two){
                    val = 1;
                }else if(one < two){
                    val = -1;
                }else{
                    val = 0;
                }
                // return the opposite if we are sorting in reverse order
                if(state.sortReverse){
                    val *= -1;
                }
                return (val);
            });
        }
        var translateSortGlyph = state.sortPreference === "translation" ? (state.sortReverse ? REVERSE_SORTED_ARROW_CLS : SORTED_ARROW_CLS) : "";
        var nativeSortGlyph = state.sortPreference === "native" ? (state.sortReverse ? REVERSE_SORTED_ARROW_CLS : SORTED_ARROW_CLS) : "";
        if(this.props.hasHeaders === true){
            headers = (<tr>
                <th className="filterable-table-header" onClick={this.handleClick} width="50%">English<span className={translateSortGlyph}></span></th>
                <th className="filterable-table-header" onClick={this.handleClick} width="50%">{state.language}<span className={nativeSortGlyph}></span></th>
            </tr>);
        }
        return (
            <table className="table table-striped table-bordered table-hover">
                <thead>{headers}</thead>
                <tbody>{rows}</tbody>
            </table>
        );
    }
});

// returns the above table, search bar, and video player(for gestures)
var FilterableTable = React.createClass({
    getInitialState: function() {
        var data = {
            filterText: "",
            hasVideo: false,
            hasHeaders: false,
            initialSource: "",
            hasSearch: false,
            language: "none"
        };

        if(this.props && this.props.dictionary) {
            if(this.props.dictionary[0] && this.props.dictionary[0].hasOwnProperty('path')){
                data.initialSource = this.props.dictionary[0].path;
            }
        }

        if(this.props){
            if(this.props.hasVideo){
                data.hasVideo = this.props.hasVideo;
            }
            if(this.props.hasHeaders){
                data.hasHeaders = this.props.hasHeaders;
            }
            if(this.props.hasSearch){
                data.hasSearch = this.props.hasSearch;
            }
            if(this.props.language){
                data.language = this.props.language;
            }
        }

        return data;
    },

    handleUserInput: function(ft) {
        this.setState({
            filterText: ft
        });
    },

    handleClick: function(e){
        // get source url for gesture clicked
        var video = document.getElementById("gestureVideo");
        video.src = $(e.target).attr("data-source");
        video.load();
        this.setState({
            initialSource: $(e.target).attr("data-source")
        });
    },

    render: function() {
        var player = "";
        var t = "";
        var search = "";

        if(this.state.hasVideo === true){
            player = (<div className="video-wrapper">
                <video id="gestureVideo" width="320" height="240"
                        autoPlay={SettingsStore.autoPlaySound()}
                       volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}
                    >
                    <source src={this.state.initialSource} type="video/mp4"></source>
                </video>
            </div>);
            t = (<DictionaryTable filterText={this.state.filterText}
                                  dictionary={this.props.dictionary}
                                  hasHeaders={this.state.hasHeaders}
                                  language={this.state.language}
                                  handleClick={this.handleClick}
                />);
        }else{
            t = (<DictionaryTable filterText={this.state.filterText}
                                  dictionary={this.props.dictionary}
                                  language={this.state.language}
                                  hasHeaders={this.state.hasHeaders}
                />);
        }
        if(this.state.hasSearch){
            search = (<SearchBar filterText={this.state.filterText}
                                onUserInput={this.handleUserInput}
                />);
        }



        return (
            <div>
                {player}
                {search}
                {t}
            </div>
        );
    }
});

module.exports = FilterableTable;