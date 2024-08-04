import { Router } from 'express';
import { promises as fs } from 'fs';
import { fileURLToPath } from "url";
import path from "path";

const routerDirector = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const directorsFilePath = path.join(_dirname, '../../data/directors.json');

const readDirectorsFs = async () => {
    try {
        const directors = await fs.readFile(directorsFilePath);
        return JSON.parse(directors);
    } catch (err) {
        throw new Error(`Error en la promesa ${err}`);
    }
};

const writeDirectorsFs = async (directors) => {
    await fs.writeFile(directorsFilePath, JSON.stringify(directors, null, 2));
};

routerDirector.post('/', async (req, res) => {
    const directors = await readDirectorsFs();
    const newDirector = {
        id: directors.length + 1,
        name: req.body.name
    };

    directors.push(newDirector);
    await writeDirectorsFs(directors);
    res.status(201).json({ message: "Director creado exitosamente", director: newDirector });
});

routerDirector.get('/', async (req, res) => {
    const directors = await readDirectorsFs();
    res.json({ directors });
});

routerDirector.get('/:id', async (req, res) => {
    const directors = await readDirectorsFs();
    const director = directors.find(d => d.id === parseInt(req.params.id));
    if (!director) return res.status(404).send('Director no encontrado');
    res.json({ director });
});

routerDirector.put('/:id', async (req, res) => {
    const directors = await readDirectorsFs();
    const indexDirector = directors.findIndex(d => d.id === parseInt(req.params.id));
    if (indexDirector === -1) return res.status(404).send('Director no encontrado');
    const updatedDirector = {
        ...directors[indexDirector],
        name: req.body.name
    };

    directors[indexDirector] = updatedDirector;
    await writeDirectorsFs(directors);
    res.json({ message: `Director actualizado exitosamente`, director: updatedDirector });
});

routerDirector.delete('/:id', async (req, res) => {
    const directors = await readDirectorsFs();
    const directorIndex = directors.findIndex(director => director.id === parseInt(req.params.id));
    if (directorIndex === -1) return res.status(404).send('Director no encontrado');
    directors.splice(directorIndex, 1);
    await writeDirectorsFs(directors);
    res.json({ message: 'Director eliminado exitosamente' });
});

export default routerDirector;
