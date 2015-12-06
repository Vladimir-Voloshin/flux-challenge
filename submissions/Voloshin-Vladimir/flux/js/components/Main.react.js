/**
* User: Voloshin Vladimir
* Date: 19.11.15
* Time: 11:11
*/

var React = require('react');
var $ = require('jquery');
var JediActions = require('../actions/JediActions');
var Footer = require('./Footer.react');
var JediList = require('./JediList.react');
var Constants = require('../constants/AppConstants');
var JediStore = require('../stores/JediStore');

function getJediesState() {
    return {
        disabledBtns: JediStore.getDisabledBtns(),
        localJedi:    JediStore.getLocalJedi(),
        storedJedies: JediStore.getAll()
    };
}

var Main = React.createClass({

    getInitialState: function() {
        $.ajax({
            url: Constants.BASE_URL + Constants.INITIAL_ID,
            dataType: 'json',
            cache: false,
            success: function(data) {
                JediActions.populateJediList({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(Constants.baseUrl + Constants.initialId, status, err.toString());
            }.bind(this)
        });
        return getJediesState();
    },

    componentDidMount: function() {

        JediStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        JediStore.removeChangeListener(this._onChange);
    },

    render: function() {
        return (
            <section className="css-scrollable-list">
                <JediList
                    storedJedies={this.state.storedJedies} localJedi={this.state.localJedi} />
                <Footer disabledBtns={this.state.disabledBtns} />
            </section>
        );
    },

    _onChange: function() {
        this.setState(getJediesState());
    }
});

module.exports = Main;
