import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/login/', { username, password });
            // For now, we store the tokens in localStorage so you can see them easily
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            navigate('/'); // Send them to the dashboard
        } catch (error) {
            alert('Invalid credentials!');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
            <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-lg shadow-lg flex flex-col gap-4 w-80">
                <h2 className="text-2xl font-bold text-emerald-400 mb-4 text-center">Access Brain</h2>
                <input 
                    type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
                    className="p-2 rounded bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <input 
                    type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="p-2 rounded bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2 rounded">Login</button>
                <p className="text-center text-sm text-slate-400 mt-2">
                    Don't have an account? <a href="/register" className="text-emerald-400 hover:underline">Register here</a>
                </p>
            </form>
        </div>
    );
}

export default Login;