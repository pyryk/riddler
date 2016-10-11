import React from 'react';
import {
    Navbar,
    Nav,
    NavItem,
    Collapse
} from 'react-bootstrap';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import LoginForm from '../login/LoginForm';
import { Maybe } from '../utils/PropTypes';

require('./Navigation.scss');

export default React.createClass({
    displayName: 'NavbarInstance',
    propTypes: {
        user: Maybe.isRequired
    },
    isLoggedIn: function() {
        return this.props.user.isSome();
    },
    isAdmin: function() {
        return this.props.user.map(u => u.role === 'admin').orSome(false);
    },
    render: function() {
        return (
            <Navbar inverse>
            <Navbar.Header>
                <Navbar.Brand>
                    <Link to="/">Riddler</Link>
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
                <Nav>
                    <LinkContainer to="/game"><NavItem>Game</NavItem></LinkContainer>
                    {this.isLoggedIn() ? <LinkContainer to="/admin/questions"><NavItem>Add questions</NavItem></LinkContainer> : null}
                    {this.isAdmin() ? <LinkContainer to="/admin/users"><NavItem>Manage users</NavItem></LinkContainer> : null }
                </Nav>
                <Collapse>
                    <LoginForm user={this.props.user} />
                </Collapse>
            </Navbar.Collapse>
            </Navbar>
        );
    }
});
