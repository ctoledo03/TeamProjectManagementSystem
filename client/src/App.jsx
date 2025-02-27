import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

import { ApolloProvider } from '@apollo/client';

import client from './client';
import Login from './components/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import MemberDashboard from './components/Member/MemberDashboard';

function App() { 
  return (
    <ApolloProvider client={client}>
      <Router>
        <div>
          <Routes>
            <Route index element={<Login />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/member/dashboard" element={<MemberDashboard />} />
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
