/**
* User: Voloshin Vladimir
* Date: 19.11.23
* Time: 11:11
*/

/**
* This component operates as a "Controller-View".  It listens for changes in
* the TodoStore and passes the new data to its children.
*/

var React = require('react');
var JediActions = require('../actions/JediActions');

var Footer = React.createClass({
    render: function() {
        var pgUpBtnClass = 'css-button-up' + ((this.props.disabledBtns.scrollUp)?' css-button-disabled':'');
        var pgDnBtnClass = 'css-button-down' + ((this.props.disabledBtns.scrollDown)?' css-button-disabled':'');

        return (
            <div className="css-scroll-buttons">
                <button className={pgUpBtnClass} onClick={this._onScrollUp}></button>
                <button className={pgDnBtnClass} onClick={this._onScrollDown}></button>
            </div>
        )
    },

    _onScrollUp: function() {
        JediActions.scrollUp();
    },

    _onScrollDown: function() {
        JediActions.scrollDown();
    }
});

module.exports = Footer;
