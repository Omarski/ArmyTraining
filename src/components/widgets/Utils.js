var Utils = (function() {

    /**
     * @param (Info) info - Info object to search value
     * @param (string) name - Info name to search
     * @returns (string|null) Value of the first matching property name or null if not found
     */
    function findInfo(info, name) {
        if (info.property) {
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
        findInfo: findInfo
    }

})();

module.exports = Utils;