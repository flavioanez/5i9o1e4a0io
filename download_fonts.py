import urllib.request
import os

# Carpeta de destino para las fuentes
fonts_dir = os.path.join(os.path.dirname(__file__), "fonts")
os.makedirs(fonts_dir, exist_ok=True)

files = [
    "fontawesome-webfont.woff2",
    "fontawesome-webfont.woff",
    "fontawesome-webfont.ttf",
    "fontawesome-webfont.eot",
    "fontawesome-webfont.svg"
]

base_url = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/"

print("Iniciando la descarga de fuentes de Font Awesome 4.7.0...")

for file in files:
    url = base_url + file
    target_path = os.path.join(fonts_dir, file)
    print(f"Descargando {url} en {target_path}...")
    try:
        urllib.request.urlretrieve(url, target_path)
        print(f"-> Completado: {file}")
    except Exception as e:
        print(f"-> Error descargando {file}: {e}")

print("Proceso finalizado. La carpeta 'fonts' ya tiene todos los archivos requeridos.")
