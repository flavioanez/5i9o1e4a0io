import fs from 'fs';
import path from 'path';

const rootDir = '.';
const htmlDir = rootDir;
const backupDir = path.join(rootDir, 'html_backup');
const imgDir = path.join(rootDir, 'images');

// Extraemos recursos visuales embebidos, no tocamos estilos ni scripts
const base64Regex = /<img[^>]+src=["']data:(image\/[a-zA-Z+]+);base64,([^"']+)["'][^>]*>/gi;
const inlineSvgRegex = /<svg\b[\s\S]*?<\/svg>/gi;

ensureDir(imgDir);
ensureDir(backupDir);

const htmlEntries = fs
  .readdirSync(htmlDir)
  .filter((entry) => entry.toLowerCase().endsWith('.html'))
  .map((entry) => path.join(htmlDir, entry))
  .filter((entry) => fs.statSync(entry).isFile());

if (!htmlEntries.length) {
  console.warn('No se encontraron archivos HTML para procesar.');
  process.exit(0);
}

console.log('🖼️  Iniciando extracción de imágenes embebidas...\n');

for (const filePath of htmlEntries) {
  const fileName = path.basename(filePath);
  const baseName = path.parse(fileName).name;
  const sanitizedName = sanitizeFileName(baseName);

  // Crear backup si no existe
  const backupPath = path.join(backupDir, fileName);
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(`📋 Backup creado: ${fileName}`);
  }

  let html = fs.readFileSync(filePath, 'utf-8');
  let imageCount = 0;
  let svgCount = 0;
  let modified = false;

  // Extraer imágenes base64 en etiquetas <img>
  html = html.replace(base64Regex, (match, mimeType, base64Data) => {
    modified = true;
    let ext = mimeType.split('/')[1] || 'png';
    ext = ext.toLowerCase().split('+')[0] || ext.toLowerCase();
    imageCount += 1;
    const imgName = `${sanitizedName}_${String(imageCount).padStart(3, '0')}.${ext}`;
    const imgPath = path.join(imgDir, imgName);

    try {
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(imgPath, buffer);
      console.log(`✅ ${fileName}: imagen extraída como ${imgName}`);
      return match.replace(/src=["'][^"']+["']/, `src="images/${imgName}"`);
    } catch (error) {
      console.error(`❌ Error procesando imagen en ${fileName}:`, error.message);
      return match; // Devolver el original si hay error
    }
  });

  // Extraer SVG inline y reemplazarlos por <img>
  html = html.replace(inlineSvgRegex, (svgMarkup) => {
    if (shouldKeepInlineSvg(svgMarkup)) {
      return svgMarkup;
    }

    modified = true;
    svgCount += 1;

    const svgName = `${sanitizedName}_svg_${String(svgCount).padStart(3, '0')}.svg`;
    const svgPath = path.join(imgDir, svgName);

    try {
      fs.writeFileSync(svgPath, normalizeSvgMarkup(svgMarkup), 'utf-8');
      console.log(`✅ ${fileName}: SVG extraido como ${svgName}`);
      return buildSvgImgTag(svgMarkup, `images/${svgName}`);
    } catch (error) {
      console.error(`❌ Error procesando SVG en ${fileName}:`, error.message);
      svgCount -= 1;
      return svgMarkup;
    }
  });

  // Solo escribir si se modificó algo
  if (modified) {
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`📝 Actualizado: ${fileName} (${imageCount} imagenes base64 y ${svgCount} SVG extraidos)\n`);
  } else {
    console.log(`⏭️  Sin cambios: ${fileName}\n`);
  }
}

console.log('✨ Proceso completado. Se extrajeron imagenes base64 y SVG inline.');
console.log('📌 Nota: Los estilos y scripts inline se mantuvieron intactos para preservar el layout.');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function sanitizeFileName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'archivo';
}

function normalizeSvgMarkup(svgMarkup) {
  if (/\bxmlns=/.test(svgMarkup)) {
    return svgMarkup;
  }
  return svgMarkup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
}

function shouldKeepInlineSvg(svgMarkup) {
  return (
    /_ngcontent-[\w-]+/i.test(svgMarkup) ||
    /\bmat-checkbox\b/i.test(svgMarkup) ||
    /\bmat-icon\b/i.test(svgMarkup) ||
    /\bclass\s*=\s*("([^"]*\bmat-[^"]*)"|'([^']*\bmat-[^']*)'|[^\s>]*\bmat-[^\s>]*)/i.test(svgMarkup) ||
    /\bfocusable\s*=\s*("false"|'false'|false)\b/i.test(svgMarkup)
  );
}

function buildSvgImgTag(svgMarkup, src) {
  const attrsToCarry = ['class', 'style', 'width', 'height', 'id', 'role', 'aria-label', 'aria-hidden'];
  const carriedAttrs = attrsToCarry
    .map((attrName) => readAttribute(svgMarkup, attrName))
    .filter(Boolean);

  const altAttr = readAttribute(svgMarkup, 'aria-label') || 'alt=""';
  return `<img src="${src}" ${carriedAttrs.join(' ')} ${altAttr}>`;
}

function readAttribute(markup, attrName) {
  const escapedName = attrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escapedName}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = markup.match(regex);

  if (!match) {
    return '';
  }

  const rawValue = match[2] ?? match[3] ?? match[4] ?? '';
  return `${attrName}="${escapeHtmlAttribute(rawValue)}"`;
}

function escapeHtmlAttribute(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}
