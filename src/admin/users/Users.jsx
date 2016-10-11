import React from 'react';
import { connect } from 'react-redux';
import { createAction } from '../../utils/ActionCreator';
import Actions from '../../constants/actions';
import { Maybe as MaybeType } from '../../utils/PropTypes';
import {
    Table,
    Form,
    FormControl,
    FormGroup,
    Button
} from 'react-bootstrap';

import './Users.scss';

const renderUser = (user, onDelete, isCurrentUser) => (
    <tr key={user.username}>
        <td>
            {user.username}
        </td>
        <td>
            {user.role}
        </td>
        <td>
            {isCurrentUser ?
                null :
                <Button bsStyle="danger" title="Delete this user" onClick={onDelete}>✕</Button>}
        </td>
    </tr>
);

const renderAddForm = (key, values, onChange, onAdd, validator) => (
    <tr key={key}>
        <td>
            <FormGroup validationState={validator('username') ? 'success' : 'error'}>
                <FormControl
                    name="username"
                    ref="firstField"
                    autoFocus
                    required
                    placeholder="Username"
                    value={values.username}
                    onKeyPress={(ev) => ev.key === 'Enter' ? onAdd() : null}
                    onChange={(ev) => onChange('username', ev.target.value)} />
            </FormGroup>
        </td>
        <td>
            <FormGroup validationState={validator('password') ? 'success' : 'error'}>
                <FormControl
                    name="password"
                    type="password"
                    required
                    placeholder="Password"
                    value={values.password}
                    onKeyPress={(ev) => ev.key === 'Enter' ? onAdd() : null}
                    onChange={(ev) => onChange('password', ev.target.value)} />
            </FormGroup>
        </td>
        <td>
            <Button
                bsStyle="primary"
                onClick={onAdd}
                disabled={!validator('username') || !validator('password')}>
                Add
            </Button>
        </td>
    </tr>
);

const Users = React.createClass({
    propTypes: {
        user: MaybeType.isRequired,
        users: React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired,
        onAdd: React.PropTypes.func.isRequired,
        onInit: React.PropTypes.func.isRequired,
        onDelete: React.PropTypes.func.isRequired
    },
    getInitialState: function() {
        return {
            username: '',
            password: ''
        };
    },
    getDefaultProps: function() {
        return {
            users: []
        };
    },
    componentDidMount: function() {
        this.props.onInit();
    },
    onChange: function(field, value) {
        this.setState({[field]: value});
    },
    onSubmit: function() {
        if (this.validateAll()) {
            this.props.onAdd(this.state.username, this.state.password);
            this.setState(Object.assign({}, this.getInitialState(), {key: this.state.key + 1}));
        }
    },
    onDelete: function(id) {
        this.props.onDelete(id);
    },
    validate: function(field) {
        return Boolean(this.state[field]);
    },
    validateAll: function() {
        // TODO confirm password
        return ['username', 'password'].every(field => this.validate(field));
    },
    render: function() {
        const isCurrentUser = (username) =>
            this.props.user.map(user => user.username === username).orSome(false);

        if (this.props.user.isSome()) {
            return (
                <div className="admin__user-list">
                    <h1>Users</h1>
                    <Form>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.users.map(user => renderUser(user, () => this.onDelete(user.username), isCurrentUser(user.username)))}
                                {renderAddForm(this.state.key, this.state, this.onChange, this.onSubmit, this.validate)}
                            </tbody>
                        </Table>
                    </Form>
                </div>
            );
        } else {
            return <div>No access - login required</div>;
        }
    }
});

const stateToProps = state => Object.assign(state.users.toJS(), {user: state.main.get('user')});
const dispatchToProps = dispatch => ({
    onInit: () => console.log('request user list') || dispatch(createAction(Actions.REQUEST_USER_LIST)),
    onDelete: (username) => dispatch(createAction(Actions.DELETE_USER, {username: username})),
    onAdd: (username, password) => dispatch(createAction(Actions.ADD_USER, {
        username,
        password
    }))
});

export default connect(stateToProps, dispatchToProps)(Users);
