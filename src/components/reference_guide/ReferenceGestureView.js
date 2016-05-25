/**
 * Created by Alec on 5/23/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');


function getSettingsState(props) {
    var data = {
        gestureSources: null
    };

    if(props && props.gestureSources){
        data.gestureSources = props.gestureSources;
    }

    return data;
}

var ReferenceGestureView = React.createClass({
    getInitialState: function() {
        var settingsState = getSettingsState(this.props);
        return settingsState;
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
        console.log("Gesture View");
        console.dir(self.state.gestureSources);

        return (
            <div id="referenceGestureView">
                <FilterableGestureTable gestures={self.state.gestureSources} />
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = ReferenceGestureView;


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

var GestureRow = React.createClass({
    render: function() {
        var name = this.props.name;
        var desc = this.props.description;
        return (
            <tr>
                <td>{name}</td>
                <td>{desc}</td>
            </tr>
        );
    }
});

var GestureTable = React.createClass({
    render: function() {
        var rows = [];
        var self = this;
        this.props.gestures.forEach(function(item) {
            if(item.name.indexOf(self.props.filterText) === -1){
                return;
            }
            rows.push(<GestureRow name={item.name} description={item.description} path={item.path}/>);
        }.bind(self) );
        return (
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        );
    }
});

/*
var ProductTable = React.createClass({
    render: function() {
        this.props.products.forEach(function(product) {
            if (product.name.indexOf(this.props.filterText) === -1 ) {
                return;
            }

            rows.push(<ProductRow product={product} key={product.name} />);
            lastCategory = product.category;
        }.bind(this) );
        return (
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Price</th>
                </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        );
    }
});
*/

var FilterableGestureTable = React.createClass({
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
        console.log(this.state.filterText);
        return (
        <div>
            <SearchBar filterText={this.state.filterText}
                       onUserInput={this.handleUserInput}
                />
            <GestureTable filterText={this.state.filterText}
                          gestures={this.props.gestures}
                />
        </div>
        );
    }
});