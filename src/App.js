import React, { useState } from 'react';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userAdded, setUserAdded] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: username, password })
      });

      if (response.ok) {
        const { token } = await response.json();
        setIsLoggedIn(true);
        localStorage.setItem('token', token);
        setUsername('');
        setPassword('');
      } else {
        console.log('Login failed');
      }
    } catch (error) {
      console.log('Network error');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, phoneNumber: username, password })
      });

      if (response.ok) {
        setUserAdded(true);
        setUsername('');
        setPassword('');
      } else {
        console.log('Signup failed');
      }
    } catch (error) {
      console.log('Network error');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ /* Add user data */ })
      });

      if (response.ok) {
        setUserAdded(true);
      } else {
        console.log('Add user failed');
      }
    } catch (error) {
      console.log('Network error');
    }
  };

  const handleGetOrderDetails = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/users/userId/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      } else {
        console.log('Failed to get order details');
      }
    } catch (error) {
      console.log('Network error');
    }
  };

  return (
    <div>
      {!isLoggedIn && (
        <>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button type="submit">Login</button>
          </form>
          <br />
          <h2>Signup</h2>
          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button type="submit">Signup</button>
          </form>
        </>
      )}

      {isLoggedIn && !userAdded && (
        <>
          <h2>Add User</h2>
          <form onSubmit={handleAddUser}>
            {/* Add input fields for user data */}
            <button type="submit">Add User</button>
          </form>
        </>
      )}

      {isLoggedIn && userAdded && (
        <>
          <h2>Order Details</h2>
          <button onClick={handleGetOrderDetails}>Get Order Details</button>
          <ul>
            {orderDetails.map((order, index) => (
              <li key={index}>{order}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default App;
