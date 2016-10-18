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
            {question.creator}
        </td>
        <td>
            <Button bsStyle="danger" title="Delete this question" onClick={onDelete}>✕</Button>
        </td>
    </tr>
);

const renderAddForm = (key, values, onChange, onAdd, validator) => (
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
        onAdd: React.PropTypes.func.isRequired,
        onInit: React.PropTypes.func.isRequired,
        onDelete: React.PropTypes.func.isRequired
    },
    getInitialState: function() {
        return {
            key: 0,
            question: '',
            answer: ''
        };
    },
    getDefaultProps: function() {
        return {
            questions: []
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
            this.props.onAdd(this.state.question, this.state.answer);
            this.setState(Object.assign({}, this.getInitialState(), {key: this.state.key + 1}));
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
            return (
                <div className="admin__question-list">
                    <h1>Questions</h1>
                    <Form>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Answer</th>
                                    <th>Created by</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.questions.map(question => renderQuestion(question, () => this.onDelete(question.id)))}
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

const stateToProps = state => state.main.toJS();
const dispatchToProps = dispatch => ({
    onInit: () => dispatch(createAction(Actions.REQUEST_QUESTION_LIST)),
    onDelete: (id) => dispatch(createAction(Actions.DELETE_QUESTION, {id: id})),
    onAdd: (question, answer) => dispatch(createAction(Actions.ADD_QUESTION, {
        question,
        answer
    }))
});

export default connect(stateToProps, dispatchToProps)(Questions);
