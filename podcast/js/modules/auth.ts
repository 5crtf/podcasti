import { ApiResponse, AppElements } from '../types.js';

export async function handleLogin(e: Event, elements: AppElements, showMainContent: () => void, loadTracks: () => void): Promise<void> {
    e.preventDefault();
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data: ApiResponse = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem('token', data.token);
            showMainContent();
            loadTracks();
        } else {
            alert(data.message || 'Ошибка входа');
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        alert('Ошибка при попытке входа');
    }
}

export async function handleRegister(e: Event, elements: AppElements, showLogin: () => void): Promise<void> {
    e.preventDefault();
    const username = (document.getElementById('regUsername') as HTMLInputElement).value;
    const password = (document.getElementById('regPassword') as HTMLInputElement).value;

    try {
        const response = await fetch('http://localhost:8000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data: ApiResponse = await response.json();

        if (response.ok) {
            alert('Регистрация успешна! Теперь вы можете войти.');
            showLogin();
        } else {
            alert(data.message || 'Ошибка регистрации');
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        alert('Ошибка при попытке регистрации');
    }
}

export function showLogin(elements: AppElements): void {
    elements.authContainer.classList.remove('hidden');
    elements.registerContainer.classList.add('hidden');
}

export function showRegister(elements: AppElements): void {
    elements.authContainer.classList.add('hidden');
    elements.registerContainer.classList.remove('hidden');
} 