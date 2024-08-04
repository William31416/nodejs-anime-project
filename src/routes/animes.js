import { Router } from 'express';
import { promises as fs } from 'fs';
import { fileURLToPath } from "url";
import path from "path";

const routerAnime = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const animesFilePath = path.join(_dirname, '../../data/animes.json');

const readAnimesFs = async () => {
    try {
        const animes = await fs.readFile(animesFilePath);
        return JSON.parse(animes);
    } catch (err) {
        throw new Error(`Error en la promesa ${err}`);
    }
};

const writeAnimesFs = async (animes) => {
    await fs.writeFile(animesFilePath, JSON.stringify(animes, null, 2));
};

routerAnime.post('/', async (req, res) => {
    const animes = await readAnimesFs();
    const newAnime = {
        id: animes.length + 1,
        title: req.body.title,
        genre: req.body.genre,
        studioId: req.body.studioId
    };

    animes.push(newAnime);
    await writeAnimesFs(animes);
    res.status(201).json({ message: "Anime creado exitosamente", anime: newAnime });
});

routerAnime.get('/', async (req, res) => {
    const animes = await readAnimesFs();
    res.json({ animes });
});

routerAnime.get('/:id', async (req, res) => {
    const animes = await readAnimesFs();
    const anime = animes.find(a => a.id === parseInt(req.params.id));
    if (!anime) return res.status(404).send('Anime no encontrado');
    res.json({ anime });
});

routerAnime.put('/:id', async (req, res) => {
    const animes = await readAnimesFs();
    const indexAnime = animes.findIndex(a => a.id === parseInt(req.params.id));
    if (indexAnime === -1) return res.status(404).send('Anime no encontrado');
    const updatedAnime = {
        ...animes[indexAnime],
        title: req.body.title,
        genre: req.body.genre,
        studioId: req.body.studioId
    };

    animes[indexAnime] = updatedAnime;
    await writeAnimesFs(animes);
    res.json({ message: `Anime actualizado exitosamente`, anime: updatedAnime });
});

routerAnime.delete('/:id', async (req, res) => {
    const animes = await readAnimesFs();
    const animeIndex = animes.findIndex(anime => anime.id === parseInt(req.params.id));
    if (animeIndex === -1) return res.status(404).send('Anime no encontrado');
    animes.splice(animeIndex, 1);
    await writeAnimesFs(animes);
    res.json({ message: 'Anime eliminado exitosamente' });
});

export default routerAnime;
