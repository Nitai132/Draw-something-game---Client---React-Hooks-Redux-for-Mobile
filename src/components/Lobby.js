import './Lobby.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { connect } from 'react-redux';
import socketIOClient from 'socket.io-client';
import alertify from 'alertifyjs'
import axios from 'axios'

import WaitingRoom from './WaitingRoom'
import { addSocket, addOpponent, addBestScore } from './redux-components/actions/index';

import 'alertifyjs/build/css/alertify.min.css';
import 'alertifyjs/build/css/themes/semantic.min.css';


const Lobby = ({ userName, addCurrentSocket, addCurrentOpponent, addCurrentBestScore }) => {
    const [users, setUsers] = useState([]);
    const [opponentUser, setOpponentUser] = useState('');
    const [socket, setSocket] = useState('');
    const [recievedGame, setRecievedGame] = useState('');
    const [topScorer, setTopScorer] = useState({ currentTopScore: '', userName: '' })
    const navigate = useNavigate();

    //init socketIO-client + socket listeners
    const initSocketListeners = async () => {
        const socket = await socketIOClient({ reconnection: false });
        setSocket(socket);
        addCurrentSocket(socket);
        socket.emit('enterLobby', userName);

        //get all the Lobby users
        socket.on('usersData', (users) => {
            const onlineUsers = users.filter((user) => user.name !== userName);
            setUsers(onlineUsers);
        });

        //listen to a new player that joined the lobby
        socket.on('userJoinedLobby', (data) => {
            const onlineUsers = data.filter((user) => user.name !== userName);
            setUsers(onlineUsers);
        });

        //listen to a player that left the lobby
        socket.on('userLeftLobby', (data) => {
            const onlineUsers = data.filter((user) => user.name !== userName);
            setUsers(onlineUsers);
        });

        //listen to new game invites
        socket.on('recieveGameInvite', (data) => {
            alertify.confirm('New Game Invite', `Received a game invite from ${data.inviteBy}. press Ok to start playing, press Cancel to stay in lobby`
                , function () {
                    socket.emit('startGame', data);
                }, function () {
                    alertify.error('Game invitation declined.');
                    socket.emit('gameDeclined', data.inviteBy);
                }).set('labels', { ok: 'accept', cancel: 'decline' });
            setRecievedGame(data.inviteBy);
        });

        //listen to a new game that have been accepted
        socket.on('DrawGameStarted', (data) => {
            addCurrentOpponent(data);
            navigate(`/DrawGame/${data.inviteBy.id}/${data.inviteTo.id}`);
        });

        //listen to new best score + update redux state
        socket.on('BestScoreChanged', (data) => {
            setTopScorer({ currentTopScore: data.newBestScore, userName: data.userName });
            addCurrentBestScore(data);
        });

        socket.on('opponentDeclinedGameInvitation', () => {
            alertify.alert('Game invitation declined!', 'Your invitation has been declined');
            setOpponentUser('');
        });
    };

    //send a game invite to lobby user
    const sendInvite = (opponnent) => {
        setOpponentUser(opponnent);
        socket.emit('gameInviteSent', ({ inviteBy: userName, inviteTo: opponnent }));
    };

    //get the best scorer from DB + set redux state + react state
    const getBestScore = async () => {
        const { data } = await axios.get('/scores/getbest');
        setTopScorer(data);
        addCurrentBestScore(data.currentTopScore);
    };

    //init socket + listeners + get the best score on mount
    useEffect(() => {
        initSocketListeners();
        getBestScore();
    }, []);


    return (
        <div className='container'>
            {opponentUser && <WaitingRoom socket={socket} opponent={opponentUser} />}
            <h1>Welcome {userName}.</h1>
            <h3>Select a player from the lobby to start playing</h3>
            <div className='lobby-container'>
                <h2>Online Players</h2>
                {users.map((user, index) => {
                    return (
                        <p key={index}>
                            {user.name}
                            <button
                                style={{ marginLeft: '20px' }}
                                onClick={() => sendInvite(user.name)}
                            >Invite to game</button>
                        </p>
                    )
                })}
            </div>
            {topScorer.userName.length > 0 && <h3>The current top score is: {topScorer.currentTopScore} by: {topScorer.userName}</h3>}
        </div>
    );
};

//get current username from redux state
const mapStateToProps = state => {
    return {
        userName: state.userLogin.userName
    }
};
//dispatch redux functions
const mapDispatchToProps = (dispatch) => {
    return {
        addCurrentSocket: (socket) => dispatch(addSocket(socket)),
        addCurrentOpponent: (userData) => dispatch(addOpponent(userData)),
        addCurrentBestScore: (currentBestScore) => dispatch(addBestScore(currentBestScore))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);
