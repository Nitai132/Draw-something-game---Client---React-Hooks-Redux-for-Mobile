export const userLogin = (userName) => {
    return {
        type: 'USER_LOGGEDIN',
        payload: userName
    };
};

export const addSocket = (socket) => {
    return {
        type: 'SOCKET_ADDED',
        payload: socket
    };
};

export const addOpponent = (userData) => {
    return {
        type: 'OPPONENT_ADDED',
        payload: userData
    };
};

export const addBestScore = (bestScore) => {
    return {
        type: 'SET_BEST_SCORE',
        payload: bestScore
    };
};