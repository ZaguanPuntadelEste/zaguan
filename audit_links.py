import sys, os

def audit_file(filepath):
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    errors = []
    
    # 1. Regla Above the Fold en links/index.html
    if "links/index.html" in filepath:
        if ".brand {" in content:
            idx = content.find(".brand {")
            chunk = content[idx:idx+200]
            if "270px" in chunk or "300px" in chunk:
                errors.append("FAIL: Logo demasiado grande. Maximo permitido: 140px.")
        pos_alq = content.find("/alquileres/la-fortuna-agata/")
        pos_pozo = content.find("/proyectos/")
        if pos_alq != -1 and pos_pozo != -1 and pos_alq > pos_pozo:
            errors.append("FAIL: Los alquileres estan debajo de pozo. Deben ir arriba de todo.")
            
    # 2. Regla de coherencia de mensajes WhatsApp
    lines = content.splitlines()
    for l in lines:
        if "wa.me" in l or "api.whatsapp.com" in l:
            if "links/index.html" in filepath and "pozo" in l.lower():
                errors.append("FAIL: Boton de WhatsApp en links/ tiene mensaje de pozo.")
                
    # 3. Regla de caracteres rotos en moneda
    for l in lines:
        if "( 30.000" in l or "( 28.000" in l:
            errors.append("FAIL: Parentesis con espacio vacio o simbolo de moneda comido.")
        
    return errors

if __name__ == "__main__":
    target = "/Users/arianawajntraub/Library/CloudStorage/GoogleDrive-ariana@starunionservicios.com.ar/Mi unidad/zaguan/zaguan-main/links/index.html"
    errs = audit_file(target)
    if errs:
        print("❌ ERRORES ENCONTRADOS EN LA AUDITORIA:")
        for e in errs:
            print("  -", e)
        sys.exit(1)
    else:
        print("✅ AUDITORIA FISICA DE PRIMERA PANTALLA Y ENLACES: PASS (0 errores)")
        sys.exit(0)
