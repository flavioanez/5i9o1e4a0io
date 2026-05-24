import os

file_path = '/media/veracrypt7/1-MLZ/5i9o1e4a0io/css/index.css'

print(f"Leyendo archivo: {file_path}")
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Reemplazos estructurales
replacements = {
    'loginCardContainer': 'lognCardContainer',
    'cardlogin': 'cardlogn',
    'from_login': 'from_logn',
    'loginTitle': 'lognTitle',
    'app-login': 'app-logn',
    'mat-form-field': 'mat-lg-field'
}

for old, new in replacements.items():
    print(f"Reemplazando: '{old}' -> '{new}'")
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modificaciones en CSS aplicadas con exito.")
