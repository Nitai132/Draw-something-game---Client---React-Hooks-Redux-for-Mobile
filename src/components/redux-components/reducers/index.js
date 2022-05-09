import { combineReducers } from 'redux';
import userLogin from './userLogin.js'
import addSocket from './socketAdded.js'
import addOpponent from './opponentAdded.js';
import addBestScore from './bestScoreAdded.js'

export default combineReducers({
    userLogin, addSocket, addOpponent, addBestScore
});