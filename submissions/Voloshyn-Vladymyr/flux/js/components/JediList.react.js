/**
* User: Voloshyn Vladymyr
* Date: 2015.11.25
* Time: 11:11
*/

var React = require('react');
var JediMaster = require('./JediMaster.react');

var JediList = React.createClass({
    render: function() {

        var storedJedies = this.props.storedJedies;
        var localJedi    = this.props.localJedi;
        var jediList = storedJedies.map(function(value, key){
            return <JediMaster key={key} isred={(storedJedies[key] !== null) ? storedJedies[key].id == localJedi : true} jediMaster={storedJedies[key]} />;
        });

        return (
            <ul className="css-slots">
                {jediList}
            </ul>
        );
    }
});

module.exports = JediList;
