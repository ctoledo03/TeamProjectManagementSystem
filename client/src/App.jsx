import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

import { ApolloProvider } from '@apollo/client';
import { useQuery, gql } from '@apollo/client';

import client from './client';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/Admin/AdminDashboard';
import MemberDashboard from './components/Member/MemberDashboard';

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      role
    }
  }
`;

function PrivateRoute({ children, allowedRoles }) {
  const { loading, error, data } = useQuery(ME_QUERY);

  if (loading) return <div>Loading...</div>;
  if (error) return <Navigate to="/" />;

  if (!data?.me) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(data.me.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/admin/dashboard/*" 
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/member/dashboard/*" 
            element={
              <PrivateRoute allowedRoles={['MEMBER']}>
                <MemberDashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
