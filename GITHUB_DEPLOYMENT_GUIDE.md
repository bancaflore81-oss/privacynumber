# GitHub Deployment con Rollback - PrivacyNumber

Questa guida ti aiuterà a configurare il deployment automatico su GitHub con capacità di rollback per il progetto PrivacyNumber.

## 🚀 Panoramica

Il sistema di deployment include:
- **Deployment automatico** tramite GitHub Actions
- **Rollback automatico** a versioni precedenti
- **Backup automatici** prima di ogni deployment
- **Monitoraggio** dello stato dell'applicazione
- **Notifiche** via Slack (opzionale)

## 📋 Prerequisiti

1. **Repository GitHub** configurato
2. **Server di produzione** con accesso SSH
3. **Docker e Docker Compose** installati sul server
4. **Variabili d'ambiente** configurate

## 🔧 Configurazione GitHub Secrets

Prima di procedere, devi configurare i seguenti secrets nel tuo repository GitHub:

### Secrets Obbligatori

Vai su `Settings > Secrets and variables > Actions` e aggiungi:

```
PRODUCTION_HOST          # IP del server di produzione
PRODUCTION_USER          # Username SSH per il server
PRODUCTION_SSH_KEY       # Chiave SSH privata per il server
DATABASE_URL             # URL del database PostgreSQL
SMS_MAN_API_KEY          # Chiave API per SMS-man
NEXTAUTH_SECRET          # Secret per NextAuth
NEXTAUTH_URL             # URL dell'applicazione (es. https://www.privatenumber.org)
POSTGRES_USER            # Username PostgreSQL
POSTGRES_PASSWORD        # Password PostgreSQL
POSTGRES_DB              # Nome del database
```

### Secrets Opzionali

```
SLACK_WEBHOOK            # Webhook Slack per notifiche
```

## 🎯 Workflow GitHub Actions

### 1. Deployment Automatico (`deploy.yml`)

Il workflow si attiva:
- **Automaticamente** quando fai push su `main`
- **Manualmente** tramite GitHub Actions tab

**Caratteristiche:**
- Build dell'immagine Docker
- Push su GitHub Container Registry
- Creazione di tag di deployment
- Backup automatico prima del deployment
- Deploy sul server di produzione
- Verifica del deployment

### 2. Rollback (`rollback.yml`)

Il workflow di rollback si attiva:
- **Solo manualmente** per sicurezza
- Richiede conferma digitando "ROLLBACK"

**Caratteristiche:**
- Lista dei deployment disponibili
- Backup dello stato corrente
- Rollback al tag specificato
- Verifica del rollback

## 🛠️ Script di Deployment

### 1. `deploy-manager.sh` - Manager Principale

Script principale per gestire tutti gli aspetti del deployment:

```bash
# Deploy in produzione
./deploy-manager.sh deploy

# Rollback interattivo
./deploy-manager.sh rollback

# Rollback a tag specifico
./deploy-manager.sh rollback --tag deploy-20241201-143022

# Mostra stato attuale
./deploy-manager.sh status

# Lista deployment disponibili
./deploy-manager.sh list

# Controllo salute applicazione
./deploy-manager.sh health

# Mostra logs
./deploy-manager.sh logs

# Crea backup manuale
./deploy-manager.sh backup

# Ripristina da backup
./deploy-manager.sh restore
```

### 2. `rollback.sh` - Script di Rollback

Script dedicato per il rollback:

```bash
# Rollback interattivo
./rollback.sh

# Rollback a tag specifico
./rollback.sh --tag deploy-20241201-143022

# Lista deployment disponibili
./rollback.sh --list

# Aiuto
./rollback.sh --help
```

## 📦 Sistema di Backup

### Backup Automatici

Il sistema crea automaticamente backup in questi casi:
- **Prima di ogni deployment** (`.deployment-backup-TIMESTAMP`)
- **Prima di ogni rollback** (`.rollback-backup-TIMESTAMP`)

### Backup Manuali

```bash
# Crea backup manuale
./deploy-manager.sh backup

# Ripristina da backup
./deploy-manager.sh restore
```

## 🔄 Processo di Rollback

### 1. Rollback via GitHub Actions

1. Vai su `Actions` nel tuo repository GitHub
2. Seleziona `Rollback Deployment`
3. Clicca `Run workflow`
4. Inserisci il tag di deployment (es. `deploy-20241201-143022`)
5. Digita `ROLLBACK` per confermare
6. Clicca `Run workflow`

### 2. Rollback via Script Locale

```bash
# Rollback interattivo
./rollback.sh

# Rollback diretto
./rollback.sh --tag deploy-20241201-143022
```

### 3. Rollback via Deploy Manager

```bash
# Rollback interattivo
./deploy-manager.sh rollback

# Rollback a tag specifico
./deploy-manager.sh rollback --tag deploy-20241201-143022
```

## 📊 Monitoraggio e Verifica

### Controllo Stato

```bash
# Stato completo
./deploy-manager.sh status

# Solo salute applicazione
./deploy-manager.sh health
```

### Logs

```bash
# Logs in tempo reale
./deploy-manager.sh logs

# Logs specifici
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f db
docker-compose -f docker-compose.prod.yml logs -f nginx
```

## 🚨 Gestione degli Errori

### Problemi Comuni

1. **Deployment fallisce**
   - Controlla i logs in GitHub Actions
   - Verifica i secrets configurati
   - Controlla la connessione SSH al server

2. **Rollback fallisce**
   - Verifica che il tag esista
   - Controlla i permessi SSH
   - Verifica lo spazio disco sul server

3. **Applicazione non risponde**
   - Controlla i container Docker
   - Verifica le variabili d'ambiente
   - Controlla i logs dell'applicazione

### Procedure di Emergenza

```bash
# Stop completo
docker-compose -f docker-compose.prod.yml down

# Ripristino da backup più recente
ls -la .*backup-* | tail -1
# Copia il backup più recente

# Riavvio
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 Sicurezza

### Best Practices

1. **Non committare** file `.env` o secrets
2. **Usa HTTPS** sempre in produzione
3. **Limita l'accesso SSH** al server
4. **Aggiorna regolarmente** le dipendenze
5. **Monitora** i logs per attività sospette

### Gestione Secrets

- I secrets sono crittografati in GitHub
- Non sono mai visibili nei logs
- Vengono passati solo alle azioni autorizzate

## 📈 Ottimizzazioni

### Performance

- Le immagini Docker sono cached
- I backup sono compressi
- Le notifiche sono asincrone

### Affidabilità

- Backup automatici prima di ogni operazione
- Verifica dello stato dopo ogni deployment
- Rollback automatico in caso di fallimento

## 🆘 Supporto

### Debugging

```bash
# Stato completo del sistema
./deploy-manager.sh status

# Logs dettagliati
docker-compose -f docker-compose.prod.yml logs --tail=100

# Verifica connessioni
docker-compose -f docker-compose.prod.yml exec app curl localhost:3000
```

### Contatti

Per problemi o domande:
1. Controlla i logs dell'applicazione
2. Verifica la configurazione dei secrets
3. Testa i componenti individualmente
4. Consulta questa guida

## 🎉 Conclusione

Con questa configurazione hai:
- ✅ Deployment automatico su GitHub
- ✅ Sistema di rollback robusto
- ✅ Backup automatici
- ✅ Monitoraggio completo
- ✅ Gestione degli errori
- ✅ Sicurezza implementata

Il sistema è ora pronto per il deployment in produzione con capacità di rollback complete!
