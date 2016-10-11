import Actions from '../constants/actions';
import Immutable from 'immutable';
import Logger from '../utils/Logger';

const initialState = Immutable.Map({users: Immutable.List()});

export function reducer(state = initialState, action) {
    switch (action.type) {
        case Actions.USER_LIST_LOADED:
            return state.set('users', Immutable.List(action.users));
        case Actions.USER_LIST_LOAD_FAILED:
            Logger.shamefullyShowError(`Loading users failed: ${action.message}`);
            return state;
        case Actions.ADD_USER_FAILED:
            Logger.shamefullyShowError(`Adding the user failed: ${JSON.stringify(action.message)}`);
            return state;
        case Actions.DELETE_USER_FAILED:
            Logger.shamefullyShowError(`Deleting the user failed: ${JSON.stringify(action.message)}`);
            return state;
        default:
            return state;
    }
}
