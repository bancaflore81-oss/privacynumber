#!/bin/bash

echo "=== RESTORE IMMAGINI SMS-MAN CLONE ==="
echo "Data: $(date)"

# Percorsi
SOURCE_DIR="/home/sms-man-clone/frontend/public/Receive SMS Online to a Temporary Phone Number from \$0.05"
PROJECT_ROOT="/home/sms-man-clone/frontend"
LOG_FILE="/home/sms-man-clone/frontend/image-restore-log.csv"
MISSING_DIR="/home/sms-man-clone/frontend/public/assets/missing-images"

# Crea directory missing-images
mkdir -p "$MISSING_DIR"

# Inizializza log CSV
echo "filename,source_path,destination_paths,action,sha256,notes" > "$LOG_FILE"

# Contatori
total_images=0
placed_images=0
missing_images=0

echo "Cartella sorgente: $SOURCE_DIR"

# Trova tutte le immagini nella cartella sorgente
cd "$SOURCE_DIR"
images=($(find . -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" -o -iname "*.webp" -o -iname "*.svg" \)))

total_images=${#images[@]}
echo "Trovate $total_images immagini"

# Scansiona il progetto per riferimenti
cd "$PROJECT_ROOT"
echo "Scansionando riferimenti nel progetto..."

# Trova riferimenti a immagini
grep -r -E "(src=|url\(|background-image)" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.css" --include="*.scss" --include="*.html" . > /tmp/refs.txt 2>/dev/null || true

echo "=== PROCESSAMENTO IMMAGINI ==="

for image in "${images[@]}"; do
    filename=$(basename "$image")
    source_path="$SOURCE_DIR/$image"
    
    echo "Processando: $filename"
    
    # Calcola SHA256
    sha256=$(sha256sum "$source_path" | cut -d' ' -f1)
    
    # Cerca riferimenti nel codice
    found_refs=$(grep -i "$filename" /tmp/refs.txt 2>/dev/null || true)
    
    if [ -n "$found_refs" ]; then
        echo "  Trovati riferimenti per $filename"
        
        # Estrai percorsi dalle referenze
        paths=()
        while IFS= read -r ref; do
            # Estrai percorsi da src="..." o url(...)
            path=$(echo "$ref" | grep -oE '(src=["\x27][^"\x27]*["\x27]|url\([^)]*\))' | sed -E 's/(src=["\x27]|url\(|["\x27]\)|)//g' | grep -E '\.(png|jpg|jpeg|gif|webp|svg)' | head -1)
            
            if [ -n "$path" ]; then
                # Pulisci il percorso
                clean_path=$(echo "$path" | sed 's/[?#].*$//' | sed 's|^/||')
                if [ -n "$clean_path" ]; then
                    paths+=("$PROJECT_ROOT/public/$clean_path")
                fi
            fi
        done <<< "$found_refs"
        
        # Rimuovi duplicati
        paths=($(printf "%s\n" "${paths[@]}" | sort -u))
        
        if [ ${#paths[@]} -gt 0 ]; then
            echo "  Destinazioni: ${paths[*]}"
            
            # Copia in tutte le destinazioni
            for dest in "${paths[@]}"; do
                dest_dir=$(dirname "$dest")
                mkdir -p "$dest_dir"
                
                if [ -f "$dest" ]; then
                    dest_sha256=$(sha256sum "$dest" | cut -d' ' -f1)
                    if [ "$sha256" != "$dest_sha256" ]; then
                        timestamp=$(date +"%Y%m%dT%H%M")
                        cp "$dest" "$dest.bak-$timestamp"
                        cp "$source_path" "$dest"
                        echo "    Copiato con backup: $dest"
                        echo "$filename,$source_path,$dest,backup,$sha256,File diverso, creato backup" >> "$LOG_FILE"
                    else
                        echo "    File identico: $dest"
                        echo "$filename,$source_path,$dest,skipped,$sha256,File identico" >> "$LOG_FILE"
                    fi
                else
                    cp "$source_path" "$dest"
                    echo "    Copiato: $dest"
                    echo "$filename,$source_path,$dest,copied,$sha256,Nuovo file" >> "$LOG_FILE"
                fi
            done
            
            ((placed_images++))
        else
            cp "$source_path" "$MISSING_DIR/"
            echo "  Nessuna destinazione valida, spostato in missing-images"
            echo "$filename,$source_path,$MISSING_DIR/$filename,missing,$sha256,Nessuna destinazione valida" >> "$LOG_FILE"
            ((missing_images++))
        fi
    else
        cp "$source_path" "$MISSING_DIR/"
        echo "  Nessun riferimento trovato, spostato in missing-images"
        echo "$filename,$source_path,$MISSING_DIR/$filename,missing,$sha256,Nessun riferimento" >> "$LOG_FILE"
        ((missing_images++))
    fi
done

# Cleanup
rm -f /tmp/refs.txt

echo "=== OPERAZIONE COMPLETATA ==="
echo "Totale immagini elaborate: $total_images"
echo "Immagini collocate nelle posizioni originali: $placed_images"
echo "Immagini inserite in missing-images: $missing_images"
echo "Log salvato in: $LOG_FILE"

# Report finale
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
