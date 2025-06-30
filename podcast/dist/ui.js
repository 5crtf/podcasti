export function showSection(section, elements, favoritesListInstance) {
    document.querySelectorAll('.section').forEach(el => {
        el.classList.add('hidden');
    });
    document.getElementById(`${section}Section`)?.classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-section="${section}"]`)?.classList.add('active');
    // Загружаем избранное, если переключились на раздел избранного
    if (section === 'favorites') {
        favoritesListInstance.loadFavorites();
    }
}
export function showMessage(message, isError = false) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isError ? 'error' : 'info'}`;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}
export function updatePlayerUI(currentTrack, updatePlayerInfo, updatePlayButton) {
    if (currentTrack) {
        updatePlayerInfo(currentTrack);
        updatePlayButton();
    }
}
//# sourceMappingURL=ui.js.map