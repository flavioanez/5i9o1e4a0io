import fs from 'fs';
import path from 'path';

const rootDir = '.';
const htmlDir = rootDir;
const backupDir = path.join(rootDir, 'html_backup');
const cssDir = path.join(rootDir, 'css');
const jsDir = path.join(rootDir, 'js');
const imgDir = path.join(rootDir, 'images');

const styleRegex = /<style([^>]*)>([\s\S]*?)<\/style>/gi;
const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
const iframeRegex = /<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi;
const base64Regex = /<img[^>]+src=["']data:(image\/[a-zA-Z+]+);base64,([^"']+)["'][^>]*>/gi;

ensureDir(cssDir);
ensureDir(jsDir);
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

const report = {
  primengStyles: [],
  hiddenIframes: [],
  failures: [],
};

for (const filePath of htmlEntries) {
  const fileName = path.basename(filePath);
  const baseName = path.parse(fileName).name;
  const sanitizedName = sanitizeFileName(baseName);

  try {
    const backupPath = path.join(backupDir, fileName);
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
    }

    let html = fs.readFileSync(filePath, 'utf-8');

    const extractedStyles = [];
    html = html.replace(styleRegex, (match, attrRaw, css) => {
      const trimmed = css.trim();
      if (trimmed) {
        extractedStyles.push(trimmed);
      }
      if (attrRaw && /data-primeng-style-id=["']primitive-variables["']/i.test(attrRaw)) {
        report.primengStyles.push({ file: fileName, snippet: match });
      }
      return '';
    });

    let cssTarget = null;
    let cssContent = null;
    if (extractedStyles.length) {
      const stylePath = path.join(cssDir, `${sanitizedName}.css`);
      cssContent = extractedStyles.join('\n\n') + '\n';
      cssTarget = `css/${path.basename(stylePath)}`;
      html = insertCssLink(html, cssTarget);
    }

    const extractedScripts = [];
    html = html.replace(scriptRegex, (_, js) => {
      const trimmed = js.trim();
      if (trimmed) {
        extractedScripts.push(trimmed);
      }
      return '';
    });

    let iframeIndex = 0;
    html = html.replace(iframeRegex, (iframeMarkup) => {
      iframeIndex += 1;
      if (isIframeHidden(iframeMarkup)) {
        report.hiddenIframes.push({ file: fileName, iframeIndex, markup: iframeMarkup });
      }
      return iframeMarkup;
    });

    let jsTarget = null;
    let jsContent = null;
    if (extractedScripts.length) {
      const scriptPath = path.join(jsDir, `${sanitizedName}.js`);
      jsContent = extractedScripts.join('\n\n') + '\n';
      jsTarget = `js/${path.basename(scriptPath)}`;
      html = insertJsLink(html, jsTarget);
    }

    let imageCount = 0;
    const extractedImages = [];
    html = html.replace(base64Regex, (match, mimeType, base64Data) => {
      let ext = mimeType.split('/')[1] || 'png';
      ext = ext.toLowerCase().split('+')[0] || ext.toLowerCase();
      imageCount += 1;
      const imgName = `${sanitizedName}_${String(imageCount).padStart(3, '0')}.${ext}`;
      const imgPath = path.join(imgDir, imgName);
      const buffer = Buffer.from(base64Data, 'base64');

      extractedImages.push({ imgName, imgPath, buffer });
      return match.replace(/src=["'][^"']+["']/, `src="images/${imgName}"`);
    });

    if (cssContent !== null) {
      const stylePath = path.join(cssDir, `${sanitizedName}.css`);
      fs.writeFileSync(stylePath, cssContent, 'utf-8');
    }

    if (jsContent !== null) {
      const scriptPath = path.join(jsDir, `${sanitizedName}.js`);
      fs.writeFileSync(scriptPath, jsContent, 'utf-8');
    }

    extractedImages.forEach(({ imgName, imgPath, buffer }) => {
      fs.writeFileSync(imgPath, buffer);
      console.log(`🖼️ ${fileName}: imagen extraída como ${imgName}`);
    });

    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`✅ Procesado ${fileName}: CSS → ${cssTarget ?? 'sin cambios'}, JS → ${jsTarget ?? 'sin cambios'}`);
  } catch (error) {
    report.failures.push({ file: fileName, error: error.message });
    console.error(`❌ Error procesando ${fileName}: ${error.message}`);
  }
}

if (report.primengStyles.length) {
  console.log('\n⚠️ Bloques <style> con data-primeng-style-id="primitive-variables" detectados:');
  report.primengStyles.forEach(({ file }) => {
    console.log(`   - ${file}`);
  });
}

if (report.hiddenIframes.length) {
  console.log('\n⚠️ Iframes potencialmente ocultos detectados (no transformados):');
  report.hiddenIframes.forEach(({ file, iframeIndex }) => {
    console.log(`   - ${file} → iframe #${iframeIndex}`);
  });
  console.log('   Confirme cómo desea manejarlos antes de automatizar su migración a JS.');
}

if (report.failures.length) {
  console.log('\n❌ Archivos con errores:');
  report.failures.forEach(({ file, error }) => {
    console.log(`   - ${file}: ${error}`);
  });
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function sanitizeFileName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'archivo';
}

function insertCssLink(html, href) {
  const linkTag = `<link rel="stylesheet" href="${href}">`;
  if (html.includes(`href="${href}"`)) {
    return html;
  }
  if (html.includes('</head>')) {
    return html.replace('</head>', `  ${linkTag}\n</head>`);
  }
  return `${linkTag}\n${html}`;
}

function insertJsLink(html, src) {
  const scriptTag = `<script src="${src}"></script>`;
  if (html.includes(`src="${src}"`)) {
    return html;
  }
  if (html.includes('</body>')) {
    return html.replace('</body>', `  ${scriptTag}\n</body>`);
  }
  return `${html}\n${scriptTag}`;
}

function isIframeHidden(markup) {
  const styleMatch = markup.match(/style=["']([^"']*)["']/i);
  if (styleMatch) {
    const style = styleMatch[1].toLowerCase();
    if (/\bdisplay\s*:\s*none\b/.test(style) || /\bvisibility\s*:\s*hidden\b/.test(style) || /\bopacity\s*:\s*0\b/.test(style)) {
      return true;
    }
    if (/\bwidth\s*:\s*0\b/.test(style) || /\bheight\s*:\s*0\b/.test(style)) {
      return true;
    }
  }
  if (/\bhidden\b/i.test(markup)) {
    return true;
  }
  if (/\bwidth=["']?\s*0/i.test(markup) || /\bheight=["']?\s*0/i.test(markup)) {
    return true;
  }
  if (/class=["'][^"']*(?:d-none|hidden|sr-only)[^"']*["']/i.test(markup)) {
    return true;
  }
  return false;
}
