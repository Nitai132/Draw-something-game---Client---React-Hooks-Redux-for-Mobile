import React, { useState, useEffect, useRef } from 'react';
import CanvasDraw from "react-canvas-draw";
import { connect } from 'react-redux';
import ChooseWordModal from './ChooseWordModal';
import Button from '@mui/material/Button';
import { useParams, useNavigate } from "react-router-dom";
import alertify from 'alertifyjs'
import { addBestScore } from './redux-components/actions/index';

import 'alertifyjs/build/css/alertify.min.css';
import 'alertifyjs/build/css/themes/semantic.min.css';
import './Drawer.css';

const Drawer = ({
    socket,
    roomId,
    opponents,
    userName,
    playerAScore,
    playerBScore,
    changeRole,
    playerAScored,
    playerBScored,
    addCurrentBestScore
}) => {
    const [saveableCanvas, setSaveableCanvas] = useState('');
    const [currentColor, setCurrentColor] = useState('');
    const [wordBeenChosen, setWordBeenChosen] = useState(false);
    const [chosenWord, setChosenWord] = useState('');
    const [currentOpponent, setCurrentOpponent] = useState({ name: '', id: '' });
    const [currentPlayer, setCurrentPlayer] = useState({ name: '', id: '' });
    const [currentPlayerScore, setCurrentPlayerScore] = useState('');
    const [currentOpponentScore, setCurrentOpponentScore] = useState('');
    const [currentWidth, setCurrentWidth] = useState('');
    const { playerA } = useParams();
    const { playerB } = useParams();
    const navigate = useNavigate();
    const ref = useRef(null);

    //when the user is drawing something
    const userDrawedSomething = () => {
        const objToEmit = {
            currentImage: saveableCanvas.getSaveData(),
            roomId: roomId
        };
        socket.emit('userIsDrawing', objToEmit);
    };

    //send the selected word to the guesser
    const sendWordToGuesser = (chosenWord) => {
        setChosenWord(chosenWord);
        const objToEmit = {
            word: chosenWord,
            roomId: roomId
        };
        socket.emit('sendWordToGuesser', objToEmit);
    };

    //get current player's score and the opponent's score
    const getScores = () => {
        if (playerA === currentPlayer.id) {
            setCurrentPlayerScore(playerAScore);
            setCurrentOpponentScore(playerBScore);
        } else if (playerB === currentPlayer.id) {
            setCurrentPlayerScore(playerBScore);
            setCurrentOpponentScore(playerAScore);
        };
    };

    //when the Guesser have scored
    const opponentScored = (scoreToAdd) => {
        if (playerA === socket.id) {
            playerBScored(scoreToAdd);
        } else if (playerB === socket.id) {
            playerAScored(scoreToAdd);
        };
    };

    //when current player leave to lobby + emit to opponent
    const endGame = () => {
        navigate('/lobby');
        socket.emit('userLeftGame', roomId);
    };

    //when the opponent have left the room
    const opponentLeftRoom = () => {
        alertify.alert('Opponent left Room', `${currentOpponent.name} has left the room. press ok the return to the lobby`, () => {
            endGame();
        });
    };

    //the socket listeners
    const socketListeners = () => {
        //change role to guesser (when opponent guessed correctly)
        socket.on('changeToGuesser', async (data) => {
            await opponentScored(data);
            await changeRole();
        });

        //when opponent have left the room
        socket.on('opponentLeftRoom', () => {
            opponentLeftRoom();
        });

        //update redux when a new best score has been reached by some player
        socket.on('BestScoreChanged', (data) => {
            addCurrentBestScore(data);
        });

    };

    //set the current player and current opponent
    const setPlayerAndOpponent = () => {
        if (opponents.inviteBy.name === userName) {
            setCurrentPlayer(opponents.inviteBy);
            setCurrentOpponent(opponents.inviteTo);
        } else if (opponents.inviteTo.name === userName) {
            setCurrentPlayer(opponents.inviteTo);
            setCurrentOpponent(opponents.inviteBy);
        };
    };

    //get the scores after current player info arrived\changed
    useEffect(() => {
        if (currentPlayer.name.length > 0) {
            getScores();
        }
    }, [currentPlayer]);

    //on mount, set the player and opponent + listen to sockets
    useEffect(() => {
        socketListeners();
        setPlayerAndOpponent();
    }, []);
    
    //set current width of container div (for canvas to be 100% of the div on any phone)
    useEffect(() => {
        setCurrentWidth(ref.current.offsetWidth);
    }, [ref.current]);

    return (
        <div className='container'>
            {!wordBeenChosen && <ChooseWordModal setChosenWord={(chosenWord) => sendWordToGuesser(chosenWord)} />}
            <div>
                <h3>Your score is: {currentPlayerScore} VS {currentOpponent.name}'s score is: {currentOpponentScore}</h3>
            </div>
            <div className='buttons-container'>
                <button
                    onClick={() => {
                        saveableCanvas.eraseAll();
                    }}
                >
                    Erase drawing
                </button>
                <button
                    onClick={() => {
                        saveableCanvas.undo();
                    }}
                >
                    Undo last move
                </button>
                <input type="color" id="colorInput" onChange={({ target: { value } }) => setCurrentColor(value)} />
            </div>
            <br />
            <div className='canvas-container' ref={ref}>
                {currentWidth && <CanvasDraw
                    id="canvas"
                    style={{ margin: 'auto' }}
                    onChange={() => userDrawedSomething()}
                    ref={canvasDraw => setSaveableCanvas(canvasDraw)}
                    canvasWidth={currentWidth}
                    canvasHeight={400}
                    gridColor={'black'}
                    brushRadius={5}
                    brushColor={currentColor}
                />}
            </div>
            {chosenWord && <h2>
                Drawing: {chosenWord}
            </h2>}
            <Button
                variant="contained"
                color="error"
                style={{ marginTop: '50px', width: '100%' }}
                onClick={() => endGame()}
            >
                back to lobby (end game)
            </Button>
        </div>
    );

};

const mapStateToProps = state => {
    return {
        opponents: state.addOpponent.opponent,
        userName: state.userLogin.userName,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        addCurrentBestScore: (currentBestScore) => dispatch(addBestScore(currentBestScore))
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
