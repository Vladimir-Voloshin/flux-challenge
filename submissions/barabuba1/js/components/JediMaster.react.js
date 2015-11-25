/**
* User: Voloshin Vladimir
* Date: 19.11.25
* Time: 11:11
*/

/**
* This component operates as a "Controller-View".  It listens for changes in
* the TodoStore and passes the new data to its children.
*/

//var PlanetStore = require('../stores/PlanetStore');
var React = require('react');

var JediMaster = React.createClass({

    /**
    * @return {object}
    */
    render: function() {
        var entryClassName = 'css-slot';
        if(this.props.isred){
            entryClassName += ' red';
        }

        return (
            <li className={entryClassName}>
                <h3>{this.props.jediMaster.name}</h3>
                <h6>Homeworld: {this.props.jediMaster.homeworld.name}</h6>
            </li>
        );
    },
});

module.exports = JediMaster;
