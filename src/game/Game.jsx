import React from 'react';
import { connect } from 'react-redux';
import { createAction } from '../utils/ActionCreator';
import Actions from '../constants/actions';
import { Maybe as MaybeType } from '../utils/PropTypes';
import { Maybe } from 'monet';
import { Button } from 'react-bootstrap';
import _ from 'lodash';

import './Game.scss';

const Game = React.createClass({
    propTypes: {
        questions: React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired,
        answers: React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired,
        currentQuestion: MaybeType,
        onInit: React.PropTypes.func.isRequired,
        onStart: React.PropTypes.func.isRequired,
        onAnswer: React.PropTypes.func.isRequired
    },
    getDefaultProps: function() {
        return {
            questions: []
        };
    },
    getInitialState: function() {
        return {
            answer: ''
        };
    },
    componentDidMount: function() {
        this.props.onInit();
    },
    onAnswerChange: function(e) {
        this.setState({answer: e.target.value});
    },
    onAnswerSubmit: function() {
        this.setState(this.getInitialState());
        this.props.onAnswer(this.state.answer);
    },
    getFeedback: function() {
        const lastAnswer = Maybe.fromNull(_.last(this.props.answers));

        // TODO figure out a way to prevent inconsistencies (when no question found for the answer)
        const lastQuestion = lastAnswer.flatMap(answer =>
            console.log(this.props.questions, answer) || Maybe.fromNull(this.props.questions.find(q => q.id === answer.questionId))
        );

        return lastAnswer
            .flatMap(answer => lastQuestion.map(question => ({question, answer})))
            .map(set => set.question.answer === set.answer.answerGiven ? 'Oikein!' : 'Väärin!!')
            .orSome(null);
    },
    getGame: function() {
        if (this.props.currentQuestion.isSome()) {
            const question = this.props.questions[this.props.currentQuestion.some()];

            return (
                <div>
                    <p>{this.getFeedback()}</p>
                    <p>{question.question}</p>
                    <p>Answer<input
                        value={this.state.answer}
                        onKeyPress={(ev) => ev.key === 'Enter' ? this.onAnswerSubmit() : null}
                        onChange={this.onAnswerChange} /></p>
                </div>
            );
        } else {
            return (
                <div>
                    <Button bsStyle="primary" bsSize="large" onClick={this.props.onStart}>Start</Button>
                </div>
            );
        }
    },
    render: function() {
        console.log('game props', this.props);
        return (
            <div>
                <h1>Riddler</h1>
                {this.props.questions.length > 0 ?
                    this.getGame() :
                    <p>No questions added.</p>}
            </div>
        );
    }
});

const stateToProps = state => state.main.toJS();
const dispatchToProps = dispatch => ({
    onInit: () => dispatch(createAction(Actions.REQUEST_QUESTION_LIST)),
    onAnswer: (answer) => dispatch(createAction(Actions.QUESTION_ANSWERED, {answer})),
    onStart: () => dispatch(createAction(Actions.START_GAME))
});

export default connect(stateToProps, dispatchToProps)(Game);
