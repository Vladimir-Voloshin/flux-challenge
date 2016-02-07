/**
* User: Voloshyn Vladymyr
* Date: 2015.11.19
* Time: 11:11
*/

var React = require('react');
var request = require('superagent');
var JediActions = require('../actions/JediActions');
var Footer = require('./Footer.react');
var JediList = require('./JediList.react');
var AppConstants = require('../constants/AppConstants');
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
        request.get(AppConstants.BASE_URL + AppConstants.INITIAL_ID)
            .set(AppConstants.HEADERS)
            .end(
                function(error, data) {
                    JediActions.populateJediList({data: data.body});
                }
            );
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
