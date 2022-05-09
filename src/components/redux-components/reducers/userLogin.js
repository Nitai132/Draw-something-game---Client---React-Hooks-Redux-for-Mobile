const userLogin = (state = defaultState, action) => {
    switch (action.type) {
        case 'USER_LOGGEDIN':
            const { payload } = action;
            return {
                userName: payload
            };
        default:
            return state;
    };
};


const defaultState = {
    userName: ''
};

export default userLogin;