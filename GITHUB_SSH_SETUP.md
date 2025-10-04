# Configurazione SSH per GitHub

## 🔑 Chiave SSH Generata

È stata generata una nuova chiave SSH per il deployment:

**Chiave Pubblica:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEZsY3oNiPb7CBF0iUZ5kYr+EdNyCqLUccQY9Kj9IezO deployment@privacynumber
```

## 📋 Passaggi per Configurare GitHub

### 1. Aggiungi la Chiave SSH a GitHub

1. Vai su GitHub.com e accedi al tuo account
2. Vai su **Settings** > **SSH and GPG keys**
3. Clicca **New SSH key**
4. Inserisci:
   - **Title**: `Deployment Key - PrivacyNumber`
   - **Key**: Copia la chiave pubblica sopra
5. Clicca **Add SSH key**

### 2. Configura SSH sul Server

```bash
# Aggiungi la configurazione SSH
echo "Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_deploy
    IdentitiesOnly yes" >> ~/.ssh/config

# Imposta i permessi corretti
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/github_deploy
chmod 644 ~/.ssh/github_deploy.pub
```

### 3. Testa la Connessione

```bash
# Testa la connessione SSH
ssh -T git@github.com

# Dovresti vedere: "Hi privacynumber! You've successfully authenticated..."
```

### 4. Configura i Secrets GitHub

Dopo aver configurato SSH, configura i secrets:

```bash
# Esegui lo script di configurazione
./setup-github-secrets.sh
```

## 🚀 Deployment

Una volta configurato tutto:

1. **Push del codice:**
   ```bash
   git push origin main
   ```

2. **Monitora il deployment:**
   - Vai su GitHub > Actions
   - Controlla il workflow "Deploy to Production"

3. **Testa il rollback:**
   - Vai su Actions > "Rollback Deployment"
   - Esegui il workflow manualmente

## 🔧 Troubleshooting

### Problema: "Host key verification failed"

```bash
# Rimuovi la chiave host esistente
ssh-keygen -R github.com

# Aggiungi la nuova chiave host
ssh-keyscan -t ed25519 github.com >> ~/.ssh/known_hosts
```

### Problema: "Permission denied"

1. Verifica che la chiave sia stata aggiunta correttamente a GitHub
2. Controlla i permessi dei file SSH:
   ```bash
   ls -la ~/.ssh/
   ```

### Problema: "Repository not found"

1. Verifica che il repository esista su GitHub
2. Controlla che l'utente abbia accesso al repository
3. Verifica l'URL del repository:
   ```bash
   git remote -v
   ```

## 📞 Supporto

Se hai problemi:
1. Controlla i logs di GitHub Actions
2. Verifica la configurazione SSH
3. Testa la connessione manualmente
4. Controlla i permessi del repository
