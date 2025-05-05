#!/usr/bin/env node
import os from "node:os";
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output, stderr } from 'node:process';
import fs from 'node:fs';
import path from 'node:path';

const rl = readline.createInterface({ input, output });
const args = process.argv.slice(2);
console.log(args)

const username = args.find(arg => arg.startsWith("--username="))?.split('=')[1] || 'Stranger'

const homeDir = os.homedir()
let currDir = homeDir
console.log(os.homedir())

console.log(`Welcome to the File Manager, ${username}!\n`)
console.log(`You are currently in ${currDir}`)

rl.on('line',async (i) => {
    const input = i.trim()

    if(input === '.exit') {process.exit(0);}
    else if ((input === 'up') && (currDir !== homeDir)) {
        const root = path.parse(currDir).root;
        if (currDir !== root) {
            currDir = path.resolve(currDir, '..');
        }
    }
    else if (input.startsWith('cd ')) {
        const targetDir = input.split(' ')[1].trim()
        const currDir = path.isAbsolute(targetDir)
            ? targetDir
            : path.resolve(currDir, targetDir);
    } else if (
        input === 'ls'
    ) {
        const files = await fs.promises.readdir(currDir);
        const filesDetailList = await Promise.all(files.map(async (file) => {
            const fullPath = path.join(currDir, file);
            const stat = await fs.promises.stat(fullPath);
            return {
                name: file,
                type: stat.isDirectory() ? 'directory' : 'file',
            };
        }));

        console.table(filesDetailList.sort((a, b) => {
            if (a.type === b.type) {
                return a.name.localeCompare(b.name);
            }
            return a.type === 'directory' ? -1 : 1;
        }
        )
        )
    } else if(input.startsWith('cat ')) {
        const fileNameInput = input.split(' ')[1].trim()
        const fileName = path.isAbsolute(fileNameInput)
            ? fileNameInput
            : path.resolve(currDir, fileNameInput);
        fs.createReadStream(fileName).pipe(output)

    } else if(
        input.startsWith('mkdir ')
    ) {
        const dirname = input.split(' ')[1].trim()
        await fs.promises.mkdir(path.join(currDir, dirname));

    }


    else {
        stderr.write('Invalid input\n')
    }
    console.log(`You are currently in ${currDir}`)
});

process.on('exit', () => {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
});