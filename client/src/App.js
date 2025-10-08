import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Checkin from './components/Checkin';
import History from './components/History';
import UserHistory from './components/UserHistory';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/history" element={<History />} />
          <Route path="/user-history/:userId" element={<UserHistory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
