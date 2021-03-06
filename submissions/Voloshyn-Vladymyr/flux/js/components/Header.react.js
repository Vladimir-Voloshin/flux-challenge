/**
 * User: Voloshyn Vladymyr
 * Date: 2015.11.23
 * Time: 11:11
 */

var React = require('react');
var Websocket = require('react-websocket');
var JediActions = require('../actions/JediActions');

var Header = React.createClass({

    getInitialState: function() {
        return {data: []};
    },
    handleData: function(data) {
        this.setState({
            data: data
        });
        JediActions.moveToPlanet(data);
    },

    render: function() {
        return (
            <h1 className="css-planet-monitor">
                <Websocket url='ws://localhost:4000/messages' onMessage={this.handleData} />
                Obi-Wan currently on {this.state.data.name}
            </h1>
        )
    }
});

module.exports = Header;
