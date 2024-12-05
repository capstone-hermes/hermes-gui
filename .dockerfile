# Utiliser une image Node.js comme base
FROM node:16

# Installer les dépendances nécessaires pour exécuter des applications graphiques
RUN apt-get update && apt-get install -y \
    libx11-xcb1 \
    libxcomposite1 \
    libxrandr2 \
    libxi6 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcups2 \
    libnss3 \
    libxss1 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers du projet dans le conteneur
COPY . .

# Installer les dépendances du projet
RUN npm install

# Exposer le port (optionnel si ton application utilise un serveur)
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]
