#!/usr/bin/env node
import os from "node:os";
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output, stderr } from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'crypto';
import { getPath } from "./utils.js";
import zlib from "node:zlib"
import { pipeline } from 'node:stream/promises'


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
        const currDir = getPath(currDir, '..')
    }
    else if (input.startsWith('add ')) {
        const fileName = input.split(' ')[1].trim()
        const filePath = getPath(currDir, fileName)
         await fs.promises.writeFile(filePath, '')
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
        const fileName =getPath(currDir, fileNameInput)
        fs.createReadStream(fileName).pipe(output)

    } else if(
        input.startsWith('mkdir ')
    ) {
        const dirname = input.split(' ')[1].trim()
        await fs.promises.mkdir(path.join(currDir, dirname));

    } else if(
        input.startsWith('rn ')
    ) {
        const oldName = input.split(' ')[1].trim()
        const oldNamePath = getPath(currDir, oldName)
        const newName = input.split(' ')[2].trim()
        const newNamePath = getPath(currDir, newName)
        try {
        await fs.promises.rename(oldNamePath, newNamePath)
        } catch (e) {console.error(e)}
    } else if(
        input.startsWith('cp ')
    ) {
        const from = input.split(' ')[1].trim()
        const fromPath = getPath(currDir, from)
        const to = input.split(' ')[2].trim()
        const toPath = getPath(currDir, from)
        const rs = fs.createReadStream(from)
            const ws = fs.createWriteStream(to)
        try {
            await pipeline(rs, ws)
        } catch (e) {console.error(e)}
    }
    else if(
        input.startsWith('mv ')
    ) {
        const from = input.split(' ')[1].trim()
        const fromPath = getPath(currDir, from)
        const to = input.split(' ')[2].trim()
        const toPath = getPath(currDir, from)
        const rs = fs.createReadStream(from)
        const ws = fs.createWriteStream(to)
        try {
            await pipeline(rs, ws)
            await fs.promises.unlink(fromPath)

        } catch (e) {console.error(e)}
    }
else if(
        input.startsWith('rm ')
    ) {
        const from = input.split(' ')[1].trim()
        const fromPath = getPath(currDir, from)
        try {
            await fs.promises.unlink(fromPath)
        } catch (e) {console.error(e)}
    } else if(input.startsWith('os')) {
    const flag  = input.split('--')[1].trim()
     if(flag === 'EOL') {console.log(JSON.stringify(os.EOL))}
     else if(flag === 'cpus') {
         const cpus = os.cpus()

         console.log(`Total CPUs: ${cpus.length}`);
         cpus.forEach((cpu, index) => {
             const ghz = (cpu.speed / 1000).toFixed(2);
             console.log(`CPU ${index + 1}: ${cpu.model} ${ghz} GHz`);
     })
     }
 else if(flag === 'homedir') {
     console.log(homeDir)
     }
 else if (flag === 'username') {console.log(os.userInfo().username)}
 else if (flag === 'architecture') {console.log(os.arch())}
    }
else if(input.startsWith('hash ')) {
        const file = input.split(' ')[1].trim()
        const filePath = getPath(currDir, file)
        const hash = createHash('sha256')
        const rs = fs.createReadStream(filePath)
        rs.on('data', (chunk) => {
            hash.update(chunk)
        })
        rs.on('end', () => {
            const fileHash = hash.digest('hex')
            console.log(fileHash)
        })
        rs.on('error', (err) => {
            console.error('Error reading the file:', err);
        });
    }
else if(input.startsWith('compress')) {
        const file = input.split(' ')[1].trim()
        const destination = input.split(' ')[2].trim()
        const filePath = getPath(currDir, file)
        const destinationPath = getPath(currDir, destination)
        await pipeline(
            fs.createReadStream(filePath),
            zlib.createGzip(),
            fs.createWriteStream(destinationPath)
        );
    }
else if(input.startsWith('decompress')) {
        const file = input.split(' ')[1].trim()
        const destination = input.split(' ')[2].trim()
        const filePath = getPath(currDir, file)
        const destinationPath = getPath(currDir, destination)
        await pipeline(
            fs.createReadStream(filePath),
            zlib.createGunip(),
            fs.createWriteStream(destinationPath)
        );
    }
    else {
        stderr.write('Invalid input\n')
    }
    console.log(`You are currently in ${currDir}`)
});

process.on('exit', () => {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
});