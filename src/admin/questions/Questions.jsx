import React from 'react';
import { connect } from 'react-redux';
import { createAction } from '../../utils/ActionCreator';
import Actions from '../../constants/actions';
import { Maybe as MaybeType } from '../../utils/PropTypes';
import Categories from './Categories';
import {
    Table,
    Form,
    FormControl,
    FormGroup,
    Button,
    Panel
} from 'react-bootstrap';
import _ from 'lodash';

import './Questions.scss';

const renderQuestion = (question, onDelete) => (
    <tr key={question.id}>
        <td>
            {question.question}
        </td>
        <td>
            {question.answer}
        </td>
        <td>
            {question.category}
        </td>
        <td>
            {question.creator}
        </td>
        <td>
            <Button bsStyle="danger" title="Delete this question" onClick={onDelete}>✕</Button>
        </td>
    </tr>
);

const renderAddForm = (key, values, categories, onChange, onAdd, validator) => (
    <tr key={key}>
        <td>
            <FormGroup validationState={validator('question') ? 'success' : 'error'}>
                <FormControl
                    name="question"
                    ref="firstField"
                    autoFocus
                    required
                    placeholder="Question"
                    value={values.question}
                    onKeyPress={(ev) => ev.key === 'Enter' ? onAdd() : null}
                    onChange={(ev) => onChange('question', ev.target.value)} />
            </FormGroup>
        </td>
        <td>
            <FormGroup validationState={validator('answer') ? 'success' : 'error'}>
                <FormControl
                    name="answer"
                    required
                    placeholder="Answer"
                    value={values.answer}
                    onKeyPress={(ev) => ev.key === 'Enter' ? onAdd() : null}
                    onChange={(ev) => onChange('answer', ev.target.value)} />
            </FormGroup>
        </td>
        <td>
            <FormGroup validationState={validator('category') ? 'success' : 'error'}>
                <FormControl
                    componentClass="select"
                    onChange={(ev) => onChange('category', ev.target.value)}>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </FormControl>
            </FormGroup>
        </td>
        <td>
            <Button
                bsStyle="primary"
                onClick={onAdd}
                disabled={!validator('question') || !validator('answer')}>
                Add
            </Button>
        </td>
    </tr>
);

const Questions = React.createClass({
    propTypes: {
        user: MaybeType.isRequired,
        questions: React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired,
        categories: React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired,
        onAdd: React.PropTypes.func.isRequired,
        requestCategories: React.PropTypes.func.isRequired,
        onAddCategory: React.PropTypes.func.isRequired,
        onDeleteCategory: React.PropTypes.func.isRequired,
        onInit: React.PropTypes.func.isRequired,
        onDelete: React.PropTypes.func.isRequired
    },
    getInitialState: function() {
        return {
            key: 0,
            question: '',
            answer: '',
            category: null
        };
    },
    getDefaultProps: function() {
        return {
            questions: []
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (this.state.category === null && nextProps.categories.length > 0) {
            console.log('componentWillReceiveProps', nextProps.categories, this.state.category);
            this.setState({category: _.get(_.first(nextProps.categories), 'id')});
        }
    },
    componentDidMount: function() {
        this.props.onInit();
    },
    onChange: function(field, value) {
        this.setState({[field]: value});
    },
    onSubmit: function() {
        if (this.validateAll()) {
            this.props.onAdd(this.state.question, this.state.answer, this.state.category);
            this.setState(Object.assign({}, this.getInitialState(), {
                key: this.state.key + 1,
                category: this.state.category // do not reset category
            }));
        }
    },
    onDelete: function(id) {
        if (confirm('Are you sure?')) {
            this.props.onDelete(id);
        }
    },
    validate: function(field) {
        return Boolean(this.state[field]);
    },
    validateAll: function() {
        return ['question', 'answer'].every(field => this.validate(field));
    },
    render: function() {
        console.log('game props', this.props);
        if (this.props.user.isSome()) {
            const questions = _.sortBy(this.props.questions, 'category')
                .map(question => renderQuestion(question, () => this.onDelete(question.id)));
            return (
                <div>
                    <Panel header={<h3>Categories</h3>}>
                        <Categories
                            onInit={this.props.requestCategories}
                            categories={this.props.categories}
                            onDelete={this.props.onDeleteCategory}
                            onAdd={this.props.onAddCategory} />
                    </Panel>
                    <Panel header={<h3>Questions</h3>} className="admin__question-list">
                        <Form>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Question</th>
                                        <th>Answer</th>
                                        <th>Category</th>
                                        <th>Created by</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {questions}
                                    {renderAddForm(this.state.key, this.state, this.props.categories, this.onChange, this.onSubmit, this.validate)}
                                </tbody>
                            </Table>
                        </Form>
                    </Panel>
                </div>
            );
        } else {
            return <div>No access - login required</div>;
        }
    }
});

const stateToProps = state => state.main.toJS();
const dispatchToProps = dispatch => ({
    onInit: () => dispatch(createAction(Actions.REQUEST_QUESTION_LIST)),
    onDelete: (id) => dispatch(createAction(Actions.DELETE_QUESTION, {id: id})),
    onAdd: (question, answer, category) => dispatch(createAction(Actions.ADD_QUESTION, {
        question,
        answer,
        category
    })),
    requestCategories: () => dispatch(createAction(Actions.REQUEST_CATEGORIES)),
    onAddCategory: (category) => dispatch(createAction(Actions.ADD_CATEGORY, {
        category
    })),
    onDeleteCategory: (id) => dispatch(createAction(Actions.DELETE_CATEGORY, {
        id
    }))
});

export default connect(stateToProps, dispatchToProps)(Questions);
