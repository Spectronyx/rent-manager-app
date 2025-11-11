// File: frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the "announcement system"
const AuthContext = createContext();

// Create the "announcer" component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // This runs when the app first loads
    useEffect(() => {
        // Check localStorage for an existing user/token
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            // We set the default authorization header for all future axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
    }, []);

    const login = async (email, password) => {
        try {
            // 1. Call our backend API's login endpoint
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, {
                email,
                password,
            });

            // 2. If successful, get the data
            const { data } = res;

            // 3. Update our global state
            setUser(data);
            setToken(data.token);

            // 4. Set the axios header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            // 5. Save to localStorage to keep user logged in
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);

            return true; // Indicate success
        } catch (error) {
            console.error('Login failed', error.response.data.message);
            return false; // Indicate failure
        }
    };

    const logout = () => {
        // 1. Clear the global state
        setUser(null);
        setToken(null);

        // 2. Remove the axios header
        delete axios.defaults.headers.common['Authorization'];

        // 3. Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const register = async (name, email, password, phone) => {
        try {
            // 1. Call our backend's register endpoint
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, {
                name,
                email,
                password,
                phone,
                // We're letting the backend default the 'role' to 'student'
            });

            // 2. If successful, get the data (which includes the token)
            const { data } = res;

            // 3. Immediately log the new user in
            setUser(data);
            setToken(data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);

            return true; // Indicate success
        } catch (error) {
            console.error('Registration failed', error.response.data.message);
            return false; // Indicate failure
        }
    };

    // We provide the user state and login/logout functions to the app
    return (
        <AuthContext.Provider value={{ user, token, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;