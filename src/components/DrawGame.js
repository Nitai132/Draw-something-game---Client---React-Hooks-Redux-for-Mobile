import { stepConnectorClasses } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import Drawer from '../components/Drawer';
import Guesser from '../components/Guesser';

const DrawGame = ({ socket }) => {
    const [role, setRole] = useState('');
    const { playerA } = useParams();
    const { playerB } = useParams();
    const [playerAScore, setPlayerAScore] = useState(0);
    const [playerBScore, setPlayerBScore] = useState(0);


    //when playerA have scored
    const playerAHaveScored = (scoreToAdd) => {
        setPlayerAScore(playerAScore + scoreToAdd);
    };

    //when playerB have scored
    const playerBHaveScored = (scoreToAdd) => {
        setPlayerBScore(playerBScore + scoreToAdd);
    };
    //change the player's role (after a correct guess)
    const changeRole = () => {
        if (role === 'Guesser') {
            setRole('Drawer');
        } else if (role === 'Drawer') {
            setRole('Guesser');
        };
    };

    //on mount, set the player's role. inviter is drawer, invited is guesser
    useEffect(() => {
        if (socket.id === playerA) {
            setRole('Drawer');
        } else if (socket.id === playerB) {
            setRole('Guesser');
        };
    }, []);

    return (
        <div>
            {role === 'Drawer' && <Drawer
                socket={socket}
                roomId={playerA}
                playerAScore={playerAScore}
                playerBScore={playerBScore}
                playerAScored={(scoreToAdd) => playerAHaveScored(scoreToAdd)}
                playerBScored={(scoreToAdd) => playerBHaveScored(scoreToAdd)}
                changeRole={() => changeRole()}
            />}
            {role === 'Guesser' && <Guesser
                socket={socket}
                roomId={playerA}
                playerAScore={playerAScore}
                playerBScore={playerBScore}
                playerAScored={(scoreToAdd) => playerAHaveScored(scoreToAdd)}
                playerBScored={(scoreToAdd) => playerBHaveScored(scoreToAdd)}
                changeRole={() => changeRole()}
            />}
        </div>
    );
};


const mapStateToProps = state => {
    return {
        socket: state.addSocket.socket
    };
};


export default connect(mapStateToProps, null)(DrawGame);
