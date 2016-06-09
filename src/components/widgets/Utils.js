var Utils = (function() {

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

    // public interface
    return {
        evalPostfix: evalPostfix,
        findInfo: findInfo
    }

})();

module.exports = Utils;