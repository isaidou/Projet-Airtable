import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Forbidden } from '../pages/Forbidden';

export const AdminRoute = ({ element: Component, ...rest }) => {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!isAdmin) {
        return <Forbidden />;
    }

    return <Component {...rest} />;
};

