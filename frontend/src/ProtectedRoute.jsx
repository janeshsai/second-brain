import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    // Check if the user has an access token in their browser storage
    const token = localStorage.getItem('access');

    // If no token exists, kick them back to the login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If they have a token, let them see the protected page (the 'children')
    return children;
}

export default ProtectedRoute;