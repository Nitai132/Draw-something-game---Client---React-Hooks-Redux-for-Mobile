import './App.css';

import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";

import Homepage from './components/Homepage';
import Lobby from './components/Lobby';
import DrawGame from './components/DrawGame';



function App() {
  return (
      <Router>
        <Routes>
          <Route path='/lobby' element={<Lobby />} />
          <Route path ='/DrawGame/:playerA/:playerB' element={<DrawGame />} />
          <Route path='/' element={<Homepage />} />
        </Routes>
      </Router>
  );
}

export default App;
