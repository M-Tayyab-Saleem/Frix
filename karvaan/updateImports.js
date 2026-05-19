const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    if (content.includes('@/types/navigation')) {
        content = content.replace(/@\/types\/navigation/g, '@/navigation/types');
        changed = true;
    }
    if (content.includes('../types/navigation')) {
        // Adjust relative path: if we are in src/navigation, it becomes ./types
        // If we are in src/screens, it becomes ../navigation/types
        // The safest way is to just replace it based on what it actually needs.
        // Actually, replacing '../types/navigation' with '../navigation/types' works 99% of the time,
        // unless it's inside `src/navigation/` itself, in which case it should be `./types`.
        if (file.includes('src\\navigation\\')) {
            content = content.replace(/\.\.\/types\/navigation/g, './types');
        } else {
            content = content.replace(/\.\.\/types\/navigation/g, '../navigation/types');
        }
        changed = true;
    }
    if (content.includes('../../types/navigation')) {
        content = content.replace(/\.\.\/\.\.\/types\/navigation/g, '../../navigation/types');
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
console.log('Done');
