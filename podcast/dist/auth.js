export async function handleLogin(e, elements, showMainContent, loadTracks) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok && data.token) {
            localStorage.setItem('token', data.token);
            showMainContent();
            loadTracks();
        }
        else {
            alert(data.message || 'Ошибка входа');
        }
    }
    catch (error) {
        console.error('Ошибка входа:', error);
        alert('Ошибка при попытке входа');
    }
}
export async function handleRegister(e, elements, showLogin) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    try {
        const response = await fetch('http://localhost:8000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Регистрация успешна! Теперь вы можете войти.');
            showLogin();
        }
        else {
            alert(data.message || 'Ошибка регистрации');
        }
    }
    catch (error) {
        console.error('Ошибка регистрации:', error);
        alert('Ошибка при попытке регистрации');
    }
}
export function showLogin(elements) {
    elements.authContainer.classList.remove('hidden');
    elements.registerContainer.classList.add('hidden');
}
export function showRegister(elements) {
    elements.authContainer.classList.add('hidden');
    elements.registerContainer.classList.remove('hidden');
}
//# sourceMappingURL=auth.js.map