const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace hex codes first
    content = content.replace(/#154667/g, 'brand-blue');
    content = content.replace(/#002c49/g, 'brand-dark');
    content = content.replace(/#10b981/g, 'brand-emerald');
    
    // Replace common blue utility classes with brand-blue / brand-dark
    content = content.replace(/text-blue-500/g, 'text-brand-blue');
    content = content.replace(/text-blue-600/g, 'text-brand-dark');
    content = content.replace(/text-blue-400/g, 'text-brand-blue');
    content = content.replace(/bg-blue-500/g, 'bg-brand-blue');
    content = content.replace(/bg-blue-600/g, 'bg-brand-dark');
    content = content.replace(/bg-blue-400/g, 'bg-brand-blue');
    content = content.replace(/border-blue-500/g, 'border-brand-blue');
    content = content.replace(/border-blue-600/g, 'border-brand-dark');
    
    // Handle arbitrary arbitrary values if they look like bg-[#154667] but we already replaced the hex above
    // so it would look like bg-[brand-blue]. Let's fix that.
    content = content.replace(/bg-\[brand-blue\]/g, 'bg-brand-blue');
    content = content.replace(/text-\[brand-blue\]/g, 'text-brand-blue');
    content = content.replace(/border-\[brand-blue\]/g, 'border-brand-blue');
    content = content.replace(/bg-\[brand-dark\]/g, 'bg-brand-dark');
    content = content.replace(/text-\[brand-dark\]/g, 'text-brand-dark');
    
    // Some components might have hover:bg-blue-500, etc., these are caught by the above replaces!
    // What if it was from-blue-500 to-blue-600?
    content = content.replace(/from-blue-600/g, 'from-brand-blue');
    content = content.replace(/to-blue-650/g, 'to-brand-dark');
    
    // Let's replace any "bg-emerald-500" left over from previous things that should be "bg-brand-emerald"
    content = content.replace(/emerald-500/g, 'brand-emerald');
    content = content.replace(/emerald-600/g, 'brand-emerald');
    content = content.replace(/emerald-400/g, 'brand-emerald');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
