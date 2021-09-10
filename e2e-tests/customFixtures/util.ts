import fs from 'fs';
import path from 'path';

export async function readPageFileContent(filename: string) {
    const stream = fs.createReadStream(path.join(__dirname, '..', 'pages', ...filename.split('/')), {
        autoClose: true,
        encoding: 'utf-8'
    });

    let content = '';

    for await (const chunk of stream) {
        content += chunk;
    }

    return content;
}
