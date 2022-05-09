import React, { useState, useEffect, useRef } from 'react';
import CanvasDraw from "react-canvas-draw";
import { connect } from 'react-redux';
import axios from 'axios'
import Button from '@mui/material/Button';
import alertify from 'alertifyjs'
import { useParams, useNavigate } from 'react-router-dom';
import { addBestScore } from './redux-components/actions/index';


import './Guesser.css';
import 'alertifyjs/build/css/alertify.css';
import 'alertifyjs/build/css/themes/bootstrap.css';

const Guesser = ({
    socket,
    roomId,
    opponents,
    userName,
    playerAScore,
    playerBScore,
    playerAScored,
    playerBScored,
    changeRole,
    bestScore,
    addCurrentBestScore }) => {
    const [currentImage, setCurrentImage] = useState('');
    const [wordToGuess, setWordToGuess] = useState('');
    const [guessedWord, setGuessedWord] = useState('');
    const [currentOpponent, setCurrentOpponent] = useState({ name: '', id: '', score: '' });
    const [currentPlayer, setCurrentPlayer] = useState({ name: '', id: '', score: '' });
    const [currentPlayerScore, setCurrentPlayerScore] = useState('');
    const [currentOpponentScore, setCurrentOpponentScore] = useState('');
    const [difficulity, setDifficulity] = useState('');
    const [currentWidth, setCurrentWidth] = useState('');
    const { playerA } = useParams();
    const { playerB } = useParams();
    const navigate = useNavigate();
    const ref = useRef(null);

    //set the current player and the current opponent
    const setPlayerAndOpponent = (opponents) => {
        if (opponents.inviteBy.name === userName) {
            setCurrentPlayer(opponents.inviteBy);
            setCurrentOpponent(opponents.inviteTo);
        } else if (opponents.inviteTo.name === userName) {
            setCurrentPlayer(opponents.inviteTo)
            setCurrentOpponent(opponents.inviteBy);
        };
    }

    //check the selected word's difficulity
    const checkDifficulity = (word) => {
        if (word.length < 5) {
            setDifficulity('easy');
        } else if (word.length === 5) {
            setDifficulity('medium');
        } else if (word.length > 5) {
            setDifficulity('hard');
        };
    };

    //get the current player's score and the opponent's score
    const getScores = () => {
        if (playerA === currentPlayer.id) {
            setCurrentPlayerScore(playerAScore);
            setCurrentOpponentScore(playerBScore);
        } else if (playerB === currentPlayer.id) {
            setCurrentPlayerScore(playerBScore);
            setCurrentOpponentScore(playerAScore);
        };
    };

    //when a guessed correclty. change roles + add score + emit change roles to opponent
    const playerHaveScored = async () => {
        let scoreToAdd;
        if (difficulity === 'easy') {
            scoreToAdd = 1;
        } else if (difficulity === 'medium') {
            scoreToAdd = 3;
        } else if (difficulity === 'hard') {
            scoreToAdd = 5;
        };
        const objToEmit = {
            roomId: roomId,
            scoreToAdd: scoreToAdd
        };

        if (currentPlayerScore + scoreToAdd > bestScore) {
            const newBestScore = currentPlayerScore + scoreToAdd
            await addCurrentBestScore(newBestScore);
            const objToSend = {
                newBestScore: newBestScore,
                userName: userName
            };
            await axios.post('/scores/setBestScore', objToSend);
            socket.emit('NewBestScore', objToSend);
        };
        if (playerA === currentPlayer.id) {
            playerAScored(scoreToAdd);
            changeRole();
            socket.emit('changeRoles', objToEmit);
        } else if (playerB === currentPlayer.id) {
            playerBScored(scoreToAdd);
            changeRole();
            socket.emit('changeRoles', objToEmit);
        };

    };

    //on guess word input change
    const onManualChange = (value) => {
        setGuessedWord(value);
    };

    //when the user sends his guess
    const sendGuess = (word) => {
        if (word === wordToGuess) {
            alertify.alert('Correct Guess!', 'Click OK to change roles and start drawing', () => {
                playerHaveScored();
            });
        } else {
            alertify.notify('Your guess is wrong!', 'error', 3);
        };
    };

    //when the user leave the game to the lobby. emit a message to his opponent
    const endGame = () => {
        navigate('/lobby');
        socket.emit('userLeftGame', roomId);
    };

    //when a message has been recieved about an opponent that have left the room.
    const opponentLeftRoom = () => {
        alertify.alert('Opponent left Room', `${currentOpponent.name} has left the room. press ok the return to the lobby`, () => {
            endGame();
        });
    };

    //init the socket listeners
    const initSocketListeners = () => {
        //listen to draw changes by opponent
        socket.on('newDrawWasMade', (data) => {
            setCurrentImage(data);
        });

        //listen to word sent from drawer
        socket.on('getWordFromDrawer', (word) => {
            setWordToGuess(word)
        });

        //listen to opponent that have left the room
        socket.on('opponentLeftRoom', () => {
            console.log('opponentLeftRoom')
            opponentLeftRoom();
        });

        //listen to a player who scored new best score
        socket.on('BestScoreChanged', (data) => {
            addCurrentBestScore(data);
        });
    };

    //on first mount. init socket listeners + set player and opponent 
    useEffect(() => {
        initSocketListeners();
        setPlayerAndOpponent(opponents);
    }, []);

    //check difficulity when wordToGuess been sent by the drawer
    useEffect(() => {
        if (wordToGuess.length > 0) {
            checkDifficulity(wordToGuess);
        }
    }, [wordToGuess]);

    //set the scores after getting current player info + when a player scores
    useEffect(() => {
        if (currentPlayer.name.length > 0) {
            getScores();
        }
    }, [currentPlayer, playerAScore, playerBScore]);

    //set current width of container div (for canvas to be 100% of the div on any phone)
    useEffect(() => {
        setCurrentWidth(ref.current.offsetWidth);
    }, [ref.current]);

    return (
        <div id="contrainer">
            <div className='canvas-container' ref={ref}>
                {currentWidth && <CanvasDraw
                    style={{ margin: 'auto' }}
                    canvasHeight={400}
                    canvasWidth={currentWidth}
                    gridColor={'black'}
                    saveData={currentImage}
                    immediateLoading={true}
                    disabled={true}
                    brushRadius={0}
                    brushColor={'white'}
                    catenaryColor={'white'}
                />}
                <input
                    id="wordInput"
                    value={guessedWord}
                    placeholder={"What is your opponent drawing?"}
                    onChange={({ target: { value } }) => onManualChange(value)}
                    autocomplete={'off'}
                    autoFocus
                />
                <Button
                    variant="contained"
                    id="sendButton"
                    onClick={() => sendGuess(guessedWord.toLowerCase())}
                >
                    Send your Guess
                </Button>
            </div>
            <div id="details">
                <h3>Your score is: {currentPlayerScore}</h3>
                <h3>{currentOpponent.name}'s score is: {currentOpponentScore}</h3>
                <h3>difficulity: {difficulity}</h3>
                {wordToGuess && <h3>word contains {wordToGuess.length} letters </h3>}
                <Button
                    variant="contained"
                    color="error"
                    style={{ marginBottom: '40px', width: '100%' }}
                    onClick={() => endGame()}
                >
                    back to lobby (end game)
                </Button>
            </div>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        opponents: state.addOpponent.opponent,
        userName: state.userLogin.userName,
        bestScore: state.addBestScore.bestScore
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        addCurrentBestScore: (currentBestScore) => dispatch(addBestScore(currentBestScore))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Guesser);
