/**
* User: Voloshin Vladimir
* Date: 19.11.15
* Time: 11:11
*/

/**
* This component operates as a "Controller-View".  It listens for changes in
* the TodoStore and passes the new data to its children.
*/

//var PlanetStore = require('../stores/PlanetStore');
var React = require('react');
var $ = require('jquery');
var JediActions = require('../actions/JediActions');
var Footer = require('./Footer.react');
var JediList = require('./JediList.react');
var Constants = require('../constants/AppConstants');
var JediStore = require('../stores/JediStore');

function getJediesState() {
    return {
        storedJedies: JediStore.getAll(),
        localJedi: JediStore.getLocalJedi()
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

    /**
    * @return {object}
    */
    render: function() {
        return (
            <section className="css-scrollable-list">
                <JediList
                    storedJedies={this.state.storedJedies} localJedi={this.state.localJedi} />
                <Footer />
            </section>
        );
    },

    _onChange: function() {
        this.setState(getJediesState());
    }
});

module.exports = Main;