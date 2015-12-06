/**
* User: Voloshin Vladimir
* Date: 2015.11.19
* Time: 11:11
*/

var React = require('react');

var JediMaster = React.createClass({
    render: function() {
        var entryClassName = 'css-slot';
        if(this.props.isred){
            entryClassName += ' red';
        }

        return (
            <li className={entryClassName}>
                <h3>{(this.props.jediMaster != null)?this.props.jediMaster.name:''}</h3>
                <h6>{(this.props.jediMaster != null)?'Homeworld: '+this.props.jediMaster.homeworld.name:''}</h6>
            </li>
        );
    }
});

module.exports = JediMaster;
