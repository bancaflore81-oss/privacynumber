#!/bin/bash

# Script per restore immagini SMS-Man Clone
# Data: $(date)

set -e

SOURCE_DIR="/home/sms-man-clone/frontend/public/Receive SMS Online to a Temporary Phone Number from \$0.05"
PROJECT_ROOT="/home/sms-man-clone/frontend"
LOG_FILE="/home/sms-man-clone/frontend/image-restore-log.csv"
MISSING_DIR="/home/sms-man-clone/frontend/public/assets/missing-images"

# Inizializza log CSV
echo "filename,source_path,destination_paths,action,sha256,notes" > "$LOG_FILE"

# Crea directory missing-images se non esiste
mkdir -p "$MISSING_DIR"

# Contatori
total_images=0
placed_images=0
missing_images=0

echo "=== SCANSIONE IMMAGINI NELLA CARTELLA SORGENTE ==="
cd "$SOURCE_DIR"

# Trova tutte le immagini
images=()
while IFS= read -r -d '' file; do
    images+=("$file")
    ((total_images++))
done < <(find . -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" -o -iname "*.webp" -o -iname "*.svg" \) -print0)

echo "Trovate $total_images immagini nella cartella sorgente"

echo "=== SCANSIONE RIFERIMENTI NEL PROGETTO ==="
cd "$PROJECT_ROOT"

# Trova tutti i riferimenti a immagini nel codice
echo "Scansionando riferimenti a immagini..."
grep -r -E "(src=|url\(|background-image|\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg)" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.css" --include="*.scss" --include="*.html" --include="*.json" . > /tmp/image_references.txt || true

echo "=== PROCESSAMENTO IMMAGINI ==="

for image_path in "${images[@]}"; do
    filename=$(basename "$image_path")
    source_full_path="$SOURCE_DIR/$image_path"
    
    echo "Processando: $filename"
    
    # Calcola SHA256 del file sorgente
    source_sha256=$(sha256sum "$source_full_path" | cut -d' ' -f1)
    
    # Cerca riferimenti a questo file nel codice
    references=$(grep -i "$filename" /tmp/image_references.txt 2>/dev/null || true)
    
    if [ -n "$references" ]; then
        echo "  Trovati riferimenti per $filename"
        
        # Estrai percorsi dalle referenze
        destinations=()
        while IFS= read -r ref; do
            # Estrai percorsi da src="..." o url(...)
            path=$(echo "$ref" | grep -oE '(src=["\x27][^"\x27]*["\x27]|url\([^)]*\))' | sed -E 's/(src=["\x27]|url\(|["\x27]\)|)//g' | grep -E '\.(png|jpg|jpeg|gif|webp|svg)' | head -1)
            
            if [ -n "$path" ]; then
                # Rimuovi query parameters e fragments
                clean_path=$(echo "$path" | sed 's/[?#].*$//')
                # Rimuovi leading slash se presente
                clean_path=$(echo "$clean_path" | sed 's|^/||')
                
                if [ -n "$clean_path" ]; then
                    destinations+=("$PROJECT_ROOT/public/$clean_path")
                fi
            fi
        done <<< "$references"
        
        # Rimuovi duplicati
        destinations=($(printf "%s\n" "${destinations[@]}" | sort -u))
        
        if [ ${#destinations[@]} -gt 0 ]; then
            echo "  Destinazioni trovate: ${destinations[*]}"
            
            # Copia il file in tutte le destinazioni
            for dest in "${destinations[@]}"; do
                dest_dir=$(dirname "$dest")
                mkdir -p "$dest_dir"
                
                if [ -f "$dest" ]; then
                    # File esiste, controlla se è identico
                    dest_sha256=$(sha256sum "$dest" | cut -d' ' -f1)
                    
                    if [ "$source_sha256" != "$dest_sha256" ]; then
                        # File diverso, crea backup
                        timestamp=$(date +"%Y%m%dT%H%M")
                        backup_path="$dest.bak-$timestamp"
                        cp "$dest" "$backup_path"
                        cp "$source_full_path" "$dest"
                        echo "    Copiato $filename -> $dest (backup: $backup_path)"
                        echo "$filename,$source_full_path,$dest,backup,$source_sha256,File esistente diverso, creato backup" >> "$LOG_FILE"
                    else
                        echo "    File identico già presente: $dest"
                        echo "$filename,$source_full_path,$dest,skipped,$source_sha256,File identico già presente" >> "$LOG_FILE"
                    fi
                else
                    # File non esiste, copia direttamente
                    cp "$source_full_path" "$dest"
                    echo "    Copiato $filename -> $dest"
                    echo "$filename,$source_full_path,$dest,copied,$source_sha256,Nuovo file copiato" >> "$LOG_FILE"
                fi
            done
            
            ((placed_images++))
        else
            # Nessuna destinazione valida trovata
            cp "$source_full_path" "$MISSING_DIR/"
            echo "  Nessuna destinazione trovata, spostato in missing-images"
            echo "$filename,$source_full_path,$MISSING_DIR/$filename,missing,$source_sha256,Nessun riferimento trovato" >> "$LOG_FILE"
            ((missing_images++))
        fi
    else
        # Nessun riferimento trovato
        cp "$source_full_path" "$MISSING_DIR/"
        echo "  Nessun riferimento trovato, spostato in missing-images"
        echo "$filename,$source_full_path,$MISSING_DIR/$filename,missing,$source_sha256,Nessun riferimento trovato" >> "$LOG_FILE"
        ((missing_images++))
    fi
done

# Cleanup
rm -f /tmp/image_references.txt

echo "=== OPERAZIONE COMPLETATA ==="
echo "Totale immagini elaborate: $total_images"
echo "Immagini collocate nelle posizioni originali: $placed_images"
echo "Immagini inserite in missing-images: $missing_images"
echo "Log salvato in: $LOG_FILE"

# Salva report finale
cat > /home/sms-man-clone/image-restore-report.txt << EOF
=== REPORT RESTORE IMMAGINI SMS-MAN CLONE ===
Data: $(date)
Cartella sorgente: $SOURCE_DIR

RISULTATI:
- Totale immagini elaborate: $total_images
- Immagini collocate nelle posizioni originali: $placed_images
- Immagini inserite in missing-images: $missing_images
- Log dettagliato: $LOG_FILE

OPERAZIONE COMPLETATA CON SUCCESSO!
EOF

echo "Report salvato in: /home/sms-man-clone/image-restore-report.txt"
