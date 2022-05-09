const addOpponent = (state = defaultState, action) => {
    switch (action.type) {
        case 'OPPONENT_ADDED':
            const { payload } = action;
            return {
                opponent: payload
            };
        default:
            return state;
    };
};

const defaultState = {
    opponents: ''
};

export default addOpponent;