import './scss/imagehover.scss';
import './scss/style.scss';
import 'whatwg-fetch';
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import {
    Grid,
    Row,
    Col
} from 'react-bootstrap';
import Navigation from './navigation/Navigation';
import store from './store/store';
import { createAction } from './utils/ActionCreator';
import Actions from './constants/actions';
import { Router, Route, Redirect, IndexRedirect, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import Game from './game/Game';
import Questions from './admin/questions/Questions';
import Users from './admin/users/Users';

// TODO extract to a separate file
const mapStateToProps = state => state.main.toJS();
const mapDispatchToProps = dispatch => ({requestUserInfo: () => dispatch(createAction(Actions.REQUEST_USER_INFO))});

const MainApplication = React.createClass({
    displayName: 'MainApplication',
    propTypes: {
        user: React.PropTypes.object.isRequired,
        requestUserInfo: React.PropTypes.func.isRequired,
        children: React.PropTypes.element.isRequired
    },
    componentDidMount: function() {
        this.props.requestUserInfo();
    },
    render: function() {
        return (
            <Grid>
                <Row>
                    <Col xs={12} md={12}><Navigation user={this.props.user} /></Col>
                </Row>
                <Row>
                    <Col xs={12} md={12}>
                        {this.props.children}
                    </Col>
                </Row>
            </Grid>
        );
    }
});

const ReduxApp = connect(mapStateToProps, mapDispatchToProps)(MainApplication);
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={ReduxApp}>
                <IndexRedirect to="/game" />
                <Route path="game" component={Game} />
                <Redirect path="admin" to="admin/questions" />
                <Route path="admin/questions" component={Questions} />
                <Route path="admin/users" component={Users} />
            </Route>
        </Router>
    </Provider>,
    document.getElementById('app')
 );
