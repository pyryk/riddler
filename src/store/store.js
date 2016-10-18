import { createStore, combineReducers, applyMiddleware } from 'redux';
import Actions from '../constants/actions';
import Api from '../utils/api';
import { createAction } from '../utils/ActionCreator';
import Immutable from 'immutable';
import { Maybe } from 'monet';
import { routerReducer } from 'react-router-redux';
import { reducer as UserReducer } from './Users';
import createSagaMiddleware from 'redux-saga';
import _ from 'lodash';
import mySaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

const initialState = Immutable.Map({
    questions: Immutable.List(),
    answers: Immutable.List(),
    currentQuestion: Maybe.None(),
    user: Maybe.None(),
    users: Immutable.List(),
    gameType: 'freetext',
    gameQuestionCount: Maybe.Some(10)
});

const getAnswer = (question, answerGiven) => Immutable.Map({
    questionId: question.id,
    answerGiven: answerGiven,
    correct: question.answer.toLowerCase() === answerGiven.toLowerCase()
});

const getCurrentQuestion = (state) => state.get('currentQuestion').map(n => state.get('questions').get(n));

const isLastQuestion = (questionNo, questions, maxQuestions) =>
    questionNo >= questions.size - 1 || maxQuestions.map(count => questionNo >= count - 1).orSome(false);

const getNextQuestionNo = (questionNo, questions, maxQuestions) =>
    questionNo.flatMap(n => isLastQuestion(n, questions, maxQuestions) ? Maybe.None() : Maybe.Some(n + 1));

/* eslint-disable no-use-before-define */
function reducer(state = initialState, action) {
    switch (action.type) {
        case Actions.REQUEST_QUESTION_LIST:
            Api.json('/api/questions').then(questions => store.dispatch(createAction(Actions.QUESTION_LIST_LOADED, {questions})));
            return state;
        case Actions.QUESTION_LIST_LOADED:
            return state.set('questions', Immutable.List(action.questions));
        case Actions.QUESTION_ANSWERED:
            console.log('answered', action);
            return state
                .set('answers', state.get('answers').push(getAnswer(getCurrentQuestion(state).some(), action.answer)))
                .set('currentQuestion', getNextQuestionNo(state.get('currentQuestion'), state.get('questions'), state.get('gameQuestionCount')));
        case Actions.START_GAME:
            return state
                .set('answers', Immutable.List())
                .set('currentQuestion', Maybe.Some(0));
        case Actions.STOP_GAME:
            return state
                .set('currentQuestion', Maybe.None());
        case Actions.GAME_TYPE_CHANGED:
            return state
                .set('gameType', action.gameType);
        case Actions.GAME_QUESTION_COUNT_CHANGED:
            return state
                .set('gameQuestionCount', action.count);
        case Actions.REQUEST_USER_INFO:
            Api.json('/api/user').then(user =>
                store.dispatch(createAction(Actions.USER_CHANGED, {user: user.logged ? user : null}))
            );
            return state;
        case Actions.USER_CHANGED:
            if (action.user) {
                return state.set('user', Maybe.Some(action.user));
            } else {
                return state.set('user', Maybe.None());
            }
        case Actions.ADD_QUESTION:
            Api.post('/api/questions', {question: action.question, answer: action.answer})
                .then(() => store.dispatch(createAction(Actions.REQUEST_QUESTION_LIST)));
            return state;
        case Actions.DELETE_QUESTION:
            Api.del(`/api/questions/${action.id}`)
                .then(() => store.dispatch(createAction(Actions.REQUEST_QUESTION_LIST)));
            return state;
        default:
            return state;
    }
}

/* eslint-enable no-use-before-define */

const reducers = combineReducers({
    users: UserReducer,
    main: reducer,
    routing: routerReducer
});

const store = createStore(reducers, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(mySaga);

export default store;

store.subscribe(() =>
  console.log('store change', store.getState())
);
