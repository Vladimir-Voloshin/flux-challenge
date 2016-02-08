/**
* User: Voloshyn Vladymyr
* Date: 2015.11.23
* Time: 11:11
*/

var React = require('react');
var JediActions = require('../actions/JediActions');
var AppConstants = require('../constants/AppConstants');
var classNames = require('classnames');

var Footer = React.createClass({
    render: function() {
        var pgUpBtnClass = classNames('css-button-up', {' css-button-disabled': this.props.disabledBtns.scrollUp});
        var pgDnBtnClass = classNames('css-button-down', {' css-button-disabled': this.props.disabledBtns.scrollDown});

        return (
            <div className="css-scroll-buttons">
                <button className={pgUpBtnClass}
                        onClick={this._scrollJediList.bind(this, AppConstants.SCROLL_UP, this.props.disabledBtns.scrollUp)}></button>
                <button className={pgDnBtnClass}
                        onClick={this._scrollJediList.bind(this, AppConstants.SCROLL_DOWN, this.props.disabledBtns.scrollDown)}></button>
            </div>
        )
    },

    _scrollJediList: function(direction, btnDisabled) {
        if(!btnDisabled){
            JediActions.scrollJediList(direction);
        }
    }
});

module.exports = Footer;
