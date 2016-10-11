import Actions from '../constants/actions';
import Immutable from 'immutable';

const initialState = Immutable.Map({users: Immutable.List()});

export function reducer(state = initialState, action) {
    switch (action.type) {
        case Actions.USER_LIST_LOADED:
            return state.set('users', Immutable.List(action.users));
        case Actions.USER_LIST_LOAD_FAILED:

            /*eslint-disable no-alert*/
            alert('Userlist load failed!');
            return state;
        default:
            return state;
    }
}
