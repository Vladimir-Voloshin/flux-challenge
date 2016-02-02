/**
* User: Voloshyn Vladymyr
* Date: 2015.11.23
* Time: 11:11
*/

var React = require('react');
var Header = require('./Header.react');
var Main = require('./Main.react');

var JediManager = React.createClass({
    /**
    * @return {object}
    */
    render: function() {
        return (
            <div className="app-container">
                <div className="css-root">
                    <Header />
                    <Main />
                </div>
            </div>
        );
    },
});

module.exports = JediManager;