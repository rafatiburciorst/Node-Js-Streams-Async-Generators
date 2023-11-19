import { createWriteStream, createReadStream } from 'node:fs'
import csv from 'csv-parser'
import { Transform, Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'


const sourceFile = 'source'

const source = createReadStream(sourceFile)

// const transform = new Transform({
//     objectMode: true,
//     transform(chunk, enc, cb) {
//         const newObject = {
//             ...chunk,
//             name: 'Rafael'
//         }
//         cb(null, newObject)
//     }
// })

async function* transform(chunks) {
    for await (const chunk of chunks) {
        const newObject = {
            ...chunk,
            name: 'Rafael'
        }
        yield newObject
    }
}


async function* toCsv(chunks) {
    let count = 0
    for await (const chunk of chunks) {
        if (count === 0) {
            const header = `id;blade;turbine;local;workorder;name`.concat('\n')
            count++
            yield header
        } else {
            const body = `${chunk.id};${chunk.blade};${chunk.turbine};${chunk.local};${chunk.workorder};${chunk.name}`.concat('\n')
            yield body
        }
    }
}


// let count = 0
// const toCsv = new Transform({
//     objectMode: true,
//     transform(chunk, enc, cb) {
//         if (count === 0) {
//             const header = `id;blade;turbine;local;workorder;name`.concat('\n')
//             count++
//             return cb(null, header)
//         }
//         const body = `${chunk.id};${chunk.blade};${chunk.turbine};${chunk.local};${chunk.workorder};${chunk.name}`.concat('\n')
//         cb(null, body)
//     }
// })


async function main() {

    try {
        await pipeline(
            source,
            csv({
                separator: ';',
                mapHeaders: ({ header, index }) => header.trim(),
                mapValues: ({ header, index, value }) => value.trim(),
            }),
            transform,
            toCsv,
            createWriteStream('./src/myscsv.csv')
        )
    } catch (error) {
        console.error(error);
    }

}

main()