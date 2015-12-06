/**
* User: Voloshin Vladimir
* Date: 2015.11.23
* Time: 11:11
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
