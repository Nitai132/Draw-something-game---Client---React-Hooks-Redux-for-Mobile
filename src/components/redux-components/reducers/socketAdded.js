
const addSocket = (state = defaultState, action) => {
    switch (action.type) {
        case 'SOCKET_ADDED':
            const { payload } = action;
            return {
                socket: payload
            };
        default:
            return state;
    };
};

const defaultState = {
    socket: ''
};

export default addSocket;