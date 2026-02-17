const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

// Update UI Guide for step 3
content = content.replace(
    /title: "Purge & Clone", desc: "[^"]+"/, 
    'title: "Purge & Clone", desc: "USE EL ICONO DE BASURA en Cookie-Editor para borrar cookies viejas ANTES de importar el JSON."'
);

// If it hasn't been renamed yet to Purge & Clone
content = content.replace(
    'title: "Import Clone", desc: "In Cookie-Editor, use \'Import\' and paste the Safe JSON. Click \'Import\' again."', 
    'title: "Limpieza Total", desc: "USA EL ICONO DE BASURA en Cookie-Editor para borrar cookies anteriores ANTES de importar."'
);

fs.writeFileSync('src/app/sessions/page.tsx', content, 'utf8');
