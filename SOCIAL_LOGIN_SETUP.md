# 🔐 **CONFIGURAZIONE SOCIAL LOGIN - SMS-MAN CLONE**

## 📋 **OVERVIEW**
Sistema completo di autenticazione sociale con Google, Facebook, Twitter e Telegram per SMS-Man Clone.

## 🚀 **FUNZIONALITÀ IMPLEMENTATE**

### ✅ **Backend (Node.js + Express)**
- **Passport.js** per gestione OAuth
- **Strategie configurate** per Google, Facebook, Twitter
- **Autenticazione Telegram** tramite Web App API
- **JWT Token** per sessioni sicure
- **Refresh Token** per sessioni persistenti
- **Modello User** esteso con campi social

### ✅ **Frontend (React)**
- **Pulsanti social** funzionanti su Login e Signup
- **Pagina callback** per gestire redirect OAuth
- **Integrazione Telegram Web App**
- **Gestione errori** e stati di caricamento
- **API Service** con metodi social login

## 🔧 **CONFIGURAZIONE RICHIESTA**

### 1. **Google OAuth**
```bash
# Vai su Google Cloud Console
# Crea un nuovo progetto o seleziona esistente
# Abilita Google+ API
# Crea credenziali OAuth 2.0
# Aggiungi URI di redirect: http://yourdomain.com/api/auth/google/callback
```

**Variabili d'ambiente:**
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://yourdomain.com/api/auth/google/callback
```

### 2. **Facebook OAuth**
```bash
# Vai su Facebook Developers
# Crea una nuova app
# Aggiungi prodotto "Facebook Login"
# Configura URL di callback: http://yourdomain.com/api/auth/facebook/callback
```

**Variabili d'ambiente:**
```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://yourdomain.com/api/auth/facebook/callback
```

### 3. **Twitter OAuth**
```bash
# Vai su Twitter Developer Portal
# Crea una nuova app
# Abilita OAuth 2.0
# Configura callback URL: http://yourdomain.com/api/auth/twitter/callback
```

**Variabili d'ambiente:**
```env
TWITTER_CONSUMER_KEY=your-twitter-consumer-key
TWITTER_CONSUMER_SECRET=your-twitter-consumer-secret
TWITTER_CALLBACK_URL=http://yourdomain.com/api/auth/twitter/callback
```

### 4. **Telegram Web App**
```bash
# Crea un bot Telegram con @BotFather
# Configura Web App URL: https://yourdomain.com
# Il bot deve essere aggiunto al tuo sito come Web App
```

## 📁 **FILE MODIFICATI/CREATI**

### **Backend:**
- `config/passport.js` - Configurazione Passport strategies
- `models/User.js` - Modello esteso con campi social
- `routes/auth.js` - Rotte social login aggiunte
- `server.js` - Inizializzazione Passport
- `env.example` - Variabili d'ambiente social

### **Frontend:**
- `pages/AuthCallbackPage.tsx` - Gestione callback OAuth
- `pages/LoginPage.tsx` - Pulsanti social funzionanti
- `pages/SignupPage.tsx` - Pulsanti social funzionanti
- `services/api.ts` - Metodi social login
- `App.tsx` - Rotta callback aggiunta

## 🔄 **FLUSSO DI AUTENTICAZIONE**

### **OAuth (Google, Facebook, Twitter):**
1. **Click pulsante** → Redirect a provider
2. **Autenticazione** su provider
3. **Callback** → Backend riceve dati utente
4. **Creazione/Aggiornamento** utente nel database
5. **Generazione JWT** e refresh token
6. **Redirect** a frontend con token
7. **Login automatico** dell'utente

### **Telegram Web App:**
1. **Click pulsante** → Verifica Telegram Web App
2. **Estrazione dati** utente da Telegram
3. **Invio dati** al backend via API
4. **Creazione/Aggiornamento** utente
5. **Login automatico** dell'utente

## 🛠️ **INSTALLAZIONE**

### **Backend:**
```bash
cd /home/sms-man-clone/backend
npm install passport passport-google-oauth20 passport-facebook passport-twitter passport-jwt bcryptjs express-session
```

### **Frontend:**
```bash
cd /home/sms-man-clone/frontend
# Le dipendenze sono già installate
```

## 🚀 **AVVIO**

### **Backend:**
```bash
cd /home/sms-man-clone/backend
npm start
```

### **Frontend:**
```bash
cd /home/sms-man-clone/frontend
npm start
```

## 🔒 **SICUREZZA**

- **JWT Token** con scadenza configurabile
- **Refresh Token** per sessioni persistenti
- **Hash verification** per Telegram (da implementare)
- **Rate limiting** su tutte le rotte
- **CORS** configurato per dominio specifico
- **Sessioni sicure** per OAuth

## 📱 **TELEGRAM WEB APP**

Per utilizzare Telegram Web App:

1. **Crea un bot** con @BotFather
2. **Configura Web App** nel bot
3. **Aggiungi il bot** al tuo sito
4. **Gli utenti** possono autenticarsi direttamente da Telegram

## 🐛 **TROUBLESHOOTING**

### **Errori comuni:**
- **"Invalid redirect URI"** → Verifica URL callback nei provider
- **"App not verified"** → Configura domini autorizzati
- **"CORS error"** → Verifica configurazione CORS
- **"Token expired"** → Verifica scadenza JWT

### **Log di debug:**
```bash
# Backend logs
tail -f /home/sms-man-clone/backend/logs/app.log

# Frontend console
# Apri Developer Tools → Console
```

## 📞 **SUPPORTO**

Per problemi o domande:
- **Backend issues** → Controlla logs del server
- **Frontend issues** → Controlla console browser
- **OAuth issues** → Verifica configurazione provider
- **Telegram issues** → Verifica bot configuration

---

## 🎯 **PROSSIMI PASSI**

1. **Configurare** le credenziali OAuth per ogni provider
2. **Testare** ogni metodo di autenticazione
3. **Implementare** verifica hash per Telegram
4. **Aggiungere** gestione errori avanzata
5. **Implementare** logout da social provider

**Il sistema è pronto per essere configurato con le credenziali reali!** 🚀

