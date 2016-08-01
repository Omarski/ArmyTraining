var Utils = (function() {
    function parseBullets(str) {
        //First check in if statement checks for number followed by period in case of Numbered list (e.g. "1. Click the triangle...")
        //Second check in if statement checks for F + Number + . because of corner case: "...by pressing F11" in the Welcome page of the prologue
<<<<<<< HEAD
        // if(str.match(new RegExp('[0-9][.]')) && !str.match(new RegExp('F+[[0-9]+\.')) ){
=======
        if(str.match(new RegExp('[0-9][.]')) && !str.match(new RegExp('F+[[0-9]+\.')) ){

>>>>>>> upstream/master
            //&& !str.match(new RegExp('\'')
            //     str = '<div><p>' + str;
                // str = str.replace(new RegExp('[0-9]+\.', 'g'), '</p></div><div class="info-bullets-div"><p class="info-number">$&</p><p class="info-bullets-indent">');
                // str = str + "</p></div>";
        // } else {
            //this is for styling bullet points
            str = '<div><p>' + str;
            str = str.replace(new RegExp('- ', 'g'), '</p></div><div class="info-bullets-div"><span class="info-view-bullet-item"></span><p class="info-bullets-indent">');
            str = str + '</p></div>';
            return str;
        // }
    }

    /**
     * @param (string) condition - Postfix condition string to evaluate
     * @param (map) stateMap - Map that holds the state of the variables to check against
     * @returns {boolean}
     */
    function evalPostfix(condition, stateMap) {
        // ensure the data is valid
        if (condition === null || stateMap === null) {
            return false;
        }

        function evalVar( v ) {
            return v == "true" ? true :
                v == "false" ? false :
                    ( typeof stateMap[v] === 'undefined' ) ? v : stateMap[v];
        }

        var stack = [];

        condition.split(" ").forEach( function(_token) {
            var token = evalVar(_token)

            switch( token ) {
                case '&':
                {
                    // need to pre-pop to prevent early return when a is false
                    var a = stack.pop();
                    var b = stack.pop();
                    stack.push( a && b );
                    break;
                }
                case '|':
                {
                    a = stack.pop();
                    b = stack.pop();
                    stack.push( a || b );
                    break;
                }
                case '==': stack.push( stack.pop() == stack.pop() ); break;
                case '<': stack.push( stack.pop() > stack.pop() ); break;
                case '>': stack.push( stack.pop() < stack.pop() ); break;
                case '<=': stack.push( stack.pop() >= stack.pop() ); break;
                case '>=': stack.push( stack.pop() <= stack.pop() ); break;
                default: stack.push( token ); break;
            }
        });

        return stack[0] === true;
    }

    /**
     * @param (Info) info - Info object to search value
     * @param (string) name - Info name to search
     * @returns (string|null) Value of the first matching property name or null if not found
     */
    function findInfo(info, name) {
        if (info != null && info.property) {
            var properties = info.property;
            var propLen = properties.length;

            while (propLen--) {
                if (properties[propLen].name === name) {
                    return properties[propLen].value;
                }
            }
        }

        return null;
    }

    /**
     * Converts minutes into a string in the format of hh:mm
     * @param (string|number) minutes
     * @returns {string}
     */
    function minutesToDisplayText(minutes) {
        // convert minutes to number
        var number = Number(minutes);

        // check if valid
        if (isNaN(number)) {
            return "Cannot convert: " + minutes.toString() + "to a number";
        }

        if (number > 60) {
            var hours = Math.floor(number / 60);
            return hours + " hrs " + (number % 60 ) + " min";
        } else {
            return (number % 60 ) + " min";
        }
    }


    // public interface
    return {
        evalPostfix: evalPostfix,
        findInfo: findInfo,
        minutesToDisplayText: minutesToDisplayText,
        parseBullets: parseBullets
    }

})();

module.exports = Utils;