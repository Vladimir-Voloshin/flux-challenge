/**
* User: Voloshin Vladimir
* Date: 19.11.25
* Time: 11:11
*/

/**
* This component operates as a "Controller-View".  It listens for changes in
* the TodoStore and passes the new data to its children.
*/

var React = require('react');
var JediMaster = require('./JediMaster.react');

var JediList = React.createClass({

    /**
    * @return {object}
    */
    render: function() {

        var storedJedies = this.props.storedJedies;
        var localJedi    = this.props.localJedi;
        var jediList = [];

        for (var key in storedJedies) {
            jediList.push(<JediMaster key={key} isred={storedJedies[key].id == localJedi} jediMaster={storedJedies[key]} />);
        }

        return (
            <ul className="css-slots">
                {jediList}
            </ul>
        );
    },
});

module.exports = JediList;
