const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
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
let modifiedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace URL
    content = content.replace(/process\.env\.NEXT_PUBLIC_SUPABASE_URL!/g, "(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co')");
    
    // Replace SERVICE ROLE KEY
    content = content.replace(/process\.env\.SUPABASE_SERVICE_ROLE_KEY!/g, "(process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_key')");

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Modified:', file);
        modifiedFiles++;
    }
});
console.log('Total files modified:', modifiedFiles);
