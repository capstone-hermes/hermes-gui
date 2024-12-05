// Import des modules nécessaires
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Garder une référence globale de la fenêtre pour éviter qu'elle soit supprimée par le garbage collector
let mainWindow;

// Fonction pour créer la fenêtre principale
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800, // Largeur de la fenêtre
    height: 600, // Hauteur de la fenêtre
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Charger un script preload si nécessaire
      nodeIntegration: true, // Activer Node.js (désactiver si vous utilisez un framework moderne comme React)
      contextIsolation: false // Important pour la sécurité (true si vous utilisez preload.js)
    },
  });

  // Charger le fichier HTML ou une URL
  mainWindow.loadFile('index.html'); // Ou loadURL('https://example.com') pour charger un site web

  // Ouvrir les outils de développement si nécessaire
  // mainWindow.webContents.openDevTools();

  // Gérer la fermeture de la fenêtre
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Appelé lorsque l'application est prête
app.whenReady().then(() => {
  createMainWindow();

  // Gérer la re-création de fenêtres si aucune n'est ouverte (pour macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quitter l'application si toutes les fenêtres sont fermées (pour Windows/Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
