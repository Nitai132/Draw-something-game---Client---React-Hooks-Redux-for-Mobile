
const addBestScore = (state = defaultState, action) => {
    switch (action.type) {
        case 'SET_BEST_SCORE':
            const { payload } = action;
            return {
                bestScore: payload
            };
        default:
            return state;
    };
};

const defaultState = {
    bestScore: ''
};

export default addBestScore;
