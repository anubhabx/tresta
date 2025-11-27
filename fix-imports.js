const fs = require('fs');
const path = require('path');

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            // Replace imports that don't have an extension (and are relative)
            // Look for: from '.../something' where something doesn't end in .js or .ts or .json
            let newContent = content.replace(/from ['"](\.{1,2}\/[^'"]+)['"]/g, (match, p1) => {
                if (p1.endsWith('.js') || p1.endsWith('.json')) return match;
                return `from '${p1}.js'`;
            });
            
            // Also handle existing .ts imports if any were missed or reverted
            newContent = newContent.replace(/from ['"](\.{1,2}\/[^'"]+)\.ts['"]/g, "from '$1.js'");

            if (content !== newContent) {
                console.log(`Fixing ${filePath}`);
                fs.writeFileSync(filePath, newContent);
            }
        }
    });
}

walk('apps/api/src');
console.log('Done');
