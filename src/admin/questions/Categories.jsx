import React from 'react';
import {
    Table,
    FormGroup,
    Button,
    FormControl
} from 'react-bootstrap';

require('./Categories.scss');

export default React.createClass({
    displayName: 'Categories',
    propTypes: {
        onDelete: React.PropTypes.func.isRequired,
        onAdd: React.PropTypes.func.isRequired,
        categories: React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired,
        onInit: React.PropTypes.func.isRequired
    },
    getInitialState: function() {
        return {
            category: ''
        };
    },
    componentDidMount: function() {
        this.props.onInit();
    },
    isValid: function() {
        return this.state.category !== '';
    },
    onAdd: function() {
        this.props.onAdd(this.state.category);
        this.setState(this.getInitialState());
    },
    onChange: function(value) {
        this.setState({category: value});
    },
    onDelete: function(id) {
        if (confirm('Are you sure?')) {
            this.props.onDelete(id);
        }
    },
    render: function() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Category name</th>
                        <th>Created by</th>
                    </tr>
                </thead>
                <tbody>
                        {this.props.categories.map(category => (
                            <tr key={category.id}>
                                <td>{category.name}</td>
                                <td>{category.creator}</td>
                                <td>
                                    <Button bsStyle="danger" onClick={() => this.onDelete(category.id)}>
                                        ✕
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        <tr key="add-new">
                            <td>
                                <FormGroup validationState={this.isValid() ? 'success' : 'error'}>
                                    <FormControl
                                        name="category"
                                        autoFocus
                                        required
                                        placeholder="Category name"
                                        value={this.state.category}
                                        onKeyPress={(ev) => ev.key === 'Enter' ? this.onAdd() : null}
                                        onChange={(ev) => this.onChange(ev.target.value)} />
                                </FormGroup>
                            </td>
                            <td>
                                <Button
                                    bsStyle="primary"
                                    onClick={this.onAdd}
                                    disabled={!this.isValid()}>
                                    Add
                                </Button>
                            </td>
                        </tr>
                </tbody>
            </Table>
        );
    }
});
