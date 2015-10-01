var React = require('react');

function processColoredText(text, colorArray){
    var result = "";
    var coloring = false;
    for (var i = 0; i < text.length; i++)
    {
        // Process escaped char
        if (text.charAt(i) == "\\")
        {
            // Colors
            switch (text.charAt(i + 1)) {
                // numbers
                case "0":
                    if (coloring) {
                        result += '</font>';
                        coloring = false;
                    }
                    break;
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    var numberIndex = new Number(text.charAt(i + 1));
                    if (numberIndex < colorArray.length) {
                        if (coloring) {
                            result += '</font>';
                        }
                        result += '<font color="#' + colorArray[numberIndex].toString(16) + '">';
                        coloring = true;
                        break;
                    }
                    break;
                case "\\":
                    result += '\\';
                    break;
                // any other escaped character
                default:
                    result += text.charAt(i + 1);
                    break;
            }
            i++;
            continue;
        }
        result += text.charAt(i);
    }
    if (coloring) {
        result += "</font>";
    }
    return {__html: result};
}

var ColorText = React.createClass({
    getInitialState: function() {
        var colorArray = ['00cc00', 'cc0000', '0000cc'];
        return processColoredText(this.props.props, colorArray);
    },

    componentWillMount: function() {

    },

    componentDidMount: function() {

    },

    componentWillUnmount: function() {

    },
    render: function() {
        return  <div dangerouslySetInnerHTML={this.state}></div>
    }
});

module.exports = ColorText;