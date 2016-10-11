import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import Api from '../utils/api';
import Actions from '../constants/actions';

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* fetchUsers() {
    try {
        const users = yield call(() => Api.json('/api/users'));
        yield put({type: Actions.USER_LIST_LOADED, users: users});
    } catch (e) {
        yield put({type: Actions.USER_LIST_LOAD_FAILED, message: e.message});
    }
}

function* userListSaga() {
    yield* takeLatest(Actions.REQUEST_USER_LIST, fetchUsers);
}

export default userListSaga;
