import React from 'react';
import { connect } from 'react-redux';
import { createAction } from '../utils/ActionCreator';
import Actions from '../constants/actions';
import { Maybe as MaybeType } from '../utils/PropTypes';
import { Maybe } from 'monet';
import { Button, Radio, FormGroup, Form, FormControl, Panel } from 'react-bootstrap';
import _ from 'lodash';

import './Game.scss';

const Game = React.createClass({
    propTypes: {
        questions: React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired,
        answers: React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired,
        gameType: React.PropTypes.oneOf(['freetext', 'multiple']).isRequired,
        currentQuestion: MaybeType,
        onInit: React.PropTypes.func.isRequired,
        onStart: React.PropTypes.func.isRequired,
        onStop: React.PropTypes.func.isRequired,
        onAnswer: React.PropTypes.func.isRequired,
        gameTypeChanged: React.PropTypes.func.isRequired
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
    onAnswerSubmit: function(ev) {
        if (ev) {
            ev.preventDefault();
        }
        this.props.onAnswer(this.state.answer);
        this.setState(this.getInitialState());
    },
    getFeedback: function() {
        const lastAnswer = Maybe.fromNull(_.last(this.props.answers));

        const lastQuestion = lastAnswer.flatMap(answer =>
            Maybe.fromNull(this.props.questions.find(q => q.id === answer.questionId) || null)
        );

        return lastAnswer
            .flatMap(answer => lastQuestion.map(question => ({question, answer})))
            .map(set => set.question.answer === set.answer.answerGiven ?
                <p className="correct-answer">Correct!</p> :
                <p className="incorrect-answer">
                    Better luck next time! The correct answer was {set.question.answer}.
                </p>
            ).orSome(null);
    },
    getCurrentQuestion: function() {
        return this.props.currentQuestion
            .flatMap(n => Maybe.fromNull(this.props.questions[n] || null));
    },
    getGame: function() {
        if (this.props.currentQuestion.isSome()) {
            const currentNo = this.props.currentQuestion.some();
            const question = this.getCurrentQuestion();

            return question.map(q => (
                <Panel header={<h3>{q.question}</h3>}>
                    {this.getAnswerForm()}
                    <p>
                        <span className="stop-label">Got enough?</span>
                        <Button bsSize="small" bsStyle="danger" onClick={this.props.onStop}>Stop</Button>
                    </p>
                </Panel>
            )).orSome(<div>Internal error: question number {currentNo} was not found.</div>);
        } else {
            return this.getStartForm();
        }
    },
    getChoices: function() {
        if (this.props.gameType === 'freetext') {
            return null;
        } else {
            return this.getCurrentQuestion().map(q => {
                const choices = _(this.props.questions)
                    .shuffle()
                    .filter(q2 => q2.id !== q.id) // make sure the correct answer is not included twice
                    .filter(q2 => q2.answer !== q.answer) // make sure answers identical to the correct one are not included
                    .uniqBy('answer') // make sure two (different) questions with identical answers are not included
                    .take(3)
                    .concat(q)
                    .shuffle()
                    .compact() // remove empty ones in case there are less than 4 unique answers
                    .valueOf();
                return choices.map(choice =>
                    <Button key={choice.id} bsSize="large" block onClick={() => this.props.onAnswer(choice.answer)}>{choice.answer}</Button>
                );
            }).orSome(<div className="error">Internal error: no question {this.props.currentQuestion} found.</div>);
        }
    },
    getAnswerForm: function() {
        if (this.props.gameType === 'freetext') {
            return (
                <Form inline>
                    <FormGroup>
                        <FormControl
                            value={this.state.answer}
                            onKeyPress={(ev) => ev.key === 'Enter' ? this.onAnswerSubmit(ev) : null}
                            onChange={this.onAnswerChange} />
                    </FormGroup>
                    <Button>Answer</Button>
                </Form>
            );
        } else {
            return (
                <div className="choice-list">
                    {this.getChoices()}
                </div>
            );
        }
    },
    getStartForm: function() {
        return (
            <Panel header={<h3>Game Settings</h3>}>
                <FormGroup>
                    <Radio
                        name="gameType"
                        value="freetext"
                        checked={this.props.gameType === 'freetext'}
                        onChange={() => this.props.gameTypeChanged('freetext')}
                        inline>
                        Free-text
                    </Radio>
                    <Radio
                        name="gameType"
                        value="multiple"
                        checked={this.props.gameType === 'multiple'}
                        onChange={() => this.props.gameTypeChanged('multiple')}
                        inline>
                        Multiple choice
                    </Radio>
                </FormGroup>
                <Button bsStyle="primary" onClick={this.onStart}>
                    {this.getStartButtonLabel()}
                </Button>
            </Panel>
        );
    },
    onStart: function() {
        this.props.onStart();
    },
    getStartButtonLabel: function() {
        return this.showResults() ? 'Start again' : 'Start';
    },
    showResults: function() {
        return this.props.currentQuestion.isNone() && this.props.answers.length > 0;
    },
    getResultGrade: function(total, correct) {
        if (total.length === 0) {
            return '';
        } else {
            const percentage = correct.length / total.length;
            if (percentage >= 0.66) {
                return 'result-a';
            } else if (percentage >= 0.33) {
                return 'result-b';
            } else {
                return 'result-c';
            }
        }
    },
    getResults: function() {
        const answers = this.props.answers;
        const correct = answers.filter(a => a.correct);
        const result = this.getResultGrade(answers, correct);
        return (
            <Panel header={<h3>Results</h3>}>
                You got
                <span className={`right-answer-count ${result}`}>
                    {correct.length}
                </span>
                /
                <span className="total-answer-count">
                    {answers.length}
                </span>
                answers correct!
            </Panel>
        );
    },
    render: function() {
        return (
            <div>
                <h1>Riddler</h1>
                {this.props.answers.length > 0 ? this.getFeedback() : null}
                {this.showResults() ? this.getResults() : null}
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
    onStart: () => dispatch(createAction(Actions.START_GAME)),
    onStop: () => dispatch(createAction(Actions.STOP_GAME)),
    gameTypeChanged: (newType) => dispatch(createAction(Actions.GAME_TYPE_CHANGED, {gameType: newType}))
});

export default connect(stateToProps, dispatchToProps)(Game);
