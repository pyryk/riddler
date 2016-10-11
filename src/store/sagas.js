import { takeLatest, takeEvery } from 'redux-saga';
import { call, put, fork } from 'redux-saga/effects';
import Api from '../utils/api';
import Actions from '../constants/actions';
import _ from 'lodash';

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* fetchUsers() {
    try {
        const users = yield call(() => Api.json('/api/users'));
        yield put({type: Actions.USER_LIST_LOADED, users: users});
    } catch (e) {
        yield put({type: Actions.USER_LIST_LOAD_FAILED, message: e});
    }
}

function* userListSaga() {
    yield* takeLatest(Actions.REQUEST_USER_LIST, fetchUsers);
}

function* addUser(action) {
    try {
        const body = _.pick(action, ['username', 'password']);
        yield call(() => Api.post('/api/users', body));
        yield put({type: Actions.REQUEST_USER_LIST});
    } catch (e) {
        yield put({type: Actions.ADD_USER_FAILED, message: e});
    }
}

function* userAddSaga() {
    yield* takeEvery(Actions.ADD_USER, addUser);
}

function* delUser(action) {
    console.log('delUser', action);
    try {
        yield call(() => Api.del(`/api/users/${action.username}`));
        yield put({type: Actions.REQUEST_USER_LIST});
    } catch (e) {
        yield put({type: Actions.DELETE_USER_FAILED, message: e});
    }
}

function* delUserSaga() {
    yield* takeEvery(Actions.DELETE_USER, delUser);
}

export default function* root() {
    yield [
        fork(userListSaga),
        fork(userAddSaga),
        fork(delUserSaga)
    ];
}
