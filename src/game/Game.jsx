import React from 'react';
import { connect } from 'react-redux';
import { createAction } from '../utils/ActionCreator';
import Actions from '../constants/actions';

import './Game.scss';

const renderQuestion = (question) => (
    <li key={question.id}>
        {question.question}
    </li>
);

const Game = React.createClass({
    propTypes: {
        questions: React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired,
        onInit: React.PropTypes.func.isRequired
    },
    getDefaultProps: function() {
        return {
            questions: []
        };
    },
    componentDidMount: function() {
        this.props.onInit();
    },
    render: function() {
        console.log('game props', this.props);
        return (
            <div>
                <h1>Questions:</h1>
                <ul>
                {this.props.questions.map(renderQuestion)}
                {this.props.questions.length === 0 ? <li>No questions added.</li> : null}
                </ul>
            </div>
        );
    }
});

const stateToProps = state => state.main.toJS();
const dispatchToProps = dispatch => ({onInit: () => dispatch(createAction(Actions.REQUEST_QUESTION_LIST))});

export default connect(stateToProps, dispatchToProps)(Game);
