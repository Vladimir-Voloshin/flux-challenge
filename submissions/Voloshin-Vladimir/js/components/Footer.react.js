/**
* User: Voloshin Vladimir
* Date: 19.11.23
* Time: 11:11
*/

var React = require('react');
var JediActions = require('../actions/JediActions');

var Footer = React.createClass({
    componentDidMount: function() {
        JediStore.addChangeListener(this._onChange);
    },

    render: function() {
        var disablePgUp = this.props.disablePgUp;
        var disablePgDn = this.props.disablePgDn;

        var pgUpBtnClass = 'css-button-up';
        var pgDnBtnClass = 'css-button-down';
        if(this.props.isred){
            entryClassName += ' red';
        }

        return (
            <div className="css-scroll-buttons">
                <button className={pgUpBtnClass} onClick={this._onScrollUp}></button>
                <button className={pgDnBtnClass} onClick={this._onScrollDown} ></button>
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
