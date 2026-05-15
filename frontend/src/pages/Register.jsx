import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Sends the data to the Django UserSerializer we made earlier!
            await api.post('/api/register/', { username, password });
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            alert('Registration failed. Try a different username.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
            <form onSubmit={handleRegister} className="bg-slate-800 p-8 rounded-lg shadow-lg flex flex-col gap-4 w-80">
                <h2 className="text-2xl font-bold text-emerald-400 mb-4 text-center">Create Second Brain</h2>
                <input 
                    type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
                    className="p-2 rounded bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <input 
                    type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="p-2 rounded bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2 rounded">Register</button>
            </form>
        </div>
    );
}

export default Register;