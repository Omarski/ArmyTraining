/**
 * Created by Alec on 5/26/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var SettingsStore = require('../../stores/SettingsStore');

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
            sortReverse: false
        };
        return (data);
    },
    handleClick: function(e){
       // (e.target) returns <th>native</th> or <th>translated</th>
        var target = e.target.innerHTML;
        var reverse = this.state.sortReverse;
        // which column was clicked
        if(target === "Native"){
            // if we were already sorting by this, reverse it
            if(this.state.sortPreference === "native"){
                reverse = !reverse;
            }
            this.setState({
                sortPreference: "native",
                sortReverse: reverse
            });
        }else if(target === "Translation"){
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
                if(!state.sortReverse){
                    if(one > two){
                        return (1);
                    }else if(one < two){
                        return (-1);
                    }else{
                        return (0);
                    }
                }else{
                    // the opposite if we are reverse sorting the list
                    if(one < two){
                        return (1);
                    }else if(one > two){
                        return (-1);
                    }else{
                        return (0);
                    }
                }
            });
        }

        if(this.props.hasHeaders === true){
            headers = (<tr>
                <th className="filterable-table-header" onClick={this.handleClick} width="50%">Translation</th>
                <th className="filterable-table-header" onClick={this.handleClick} width="50%">Native</th>
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
            initialSource: ""
        };

        console.dir(this.props.dictionary);
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
                                  handleClick={this.handleClick}
                />);
        }else{
            t = (<DictionaryTable filterText={this.state.filterText}
                                  dictionary={this.props.dictionary}
                                  hasHeaders={this.state.hasHeaders}
                />);
        }



        return (
            <div>
                {player}
                <SearchBar filterText={this.state.filterText}
                           onUserInput={this.handleUserInput}
                    />
                {t}
            </div>
        );
    }
});

module.exports = FilterableTable;