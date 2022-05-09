import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

import './WaitingRoom.css';

export default function WaitingRoom({ socket, opponent }) {

    return (
        <div id="waitingRoom-container">
            <div id="waitingRoom-text">
                <CircularProgress color="secondary" style={{ marginTop: '250px' }} />
                <h3 >waiting for {opponent} to accept the game</h3>
            </div>
        </div>
    )

}