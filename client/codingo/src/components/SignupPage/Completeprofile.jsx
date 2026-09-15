import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl, getAuthHeaders } from "../../utilites/communityHelper";

export default function CompleteProfile() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('token', token);
            window.history.replaceState({}, '', window.location.pathname); // strip token out of the URL/history
        } else if (!localStorage.getItem('token')) {
            navigate('/login');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (username.trim().length < 3) return setError('Username must be at least 3 characters');
        if (password.length < 6) return setError('Password must be at least 6 characters');

        setLoading(true);
        try {
            await axios.post(`${apiUrl}/api/auth/complete-profile`, { username, password }, {
                headers: { ...getAuthHeaders() },
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set a password" />
            {error && <p>{error}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Continue'}</button>
        </form>
    )
};