import './Homepage.css';
import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { connect } from 'react-redux'
import { userLogin } from './redux-components/actions/index';
import alertify from 'alertifyjs';

const Homepage = ({ login }) => {
    const navigate = useNavigate();
    const [userName, setUsername] = useState('');
    const userNameChanged = (value) => {
        setUsername(value);
    };

    //enter the lobby + set userName to redux state
    const enterLobby = () => {
        if (userName.length > 0) {
            login(userName);
            navigate('/lobby');
        } else {
            alertify.alert('No username been set.', 'please set a username before entering the lobby')
        }
    }

    return (
        <div className='Homepage'>
            <h1>Welcome to Draw something by Nitai</h1>
            <label>Enter your username</label>
            <br />
            <br />
            <input
                type="text"
                placeholder='Username'
                onChange={({ target: { value } }) => userNameChanged(value)}
            />
            <br />
            <br />
            <button onClick={() => enterLobby()}>
                Start playing
            </button>
        </div>
    )
}

const mapDispatchToProps = (dispatch) => {
    return {
        login: (userName) => dispatch(userLogin(userName))
    }
};

export default connect(null, mapDispatchToProps)(Homepage)