export function createAction(type, data = {}) {
    return Object.assign(data, {type: type});
}
