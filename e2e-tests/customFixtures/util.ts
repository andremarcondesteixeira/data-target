import fs from 'fs';
import path from 'path';

export async function readFile(filename: string) {
    const stream = fs.createReadStream(path.join(__dirname, '..', ...filename.split('/')), {
        autoClose: true,
        encoding: 'utf-8'
    });

    let content = '';

    for await (const chunk of stream) {
        content += chunk;
    }

    return content;
}
