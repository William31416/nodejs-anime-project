import { Router } from 'express';
import { promises as fs } from 'fs';
import { fileURLToPath } from "url";
import path from "path";

const routerCharacter = Router();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const charactersFilePath = path.join(_dirname, '../../data/characters.json');

const readCharactersFs = async () => {
    try {
        const characters = await fs.readFile(charactersFilePath);
        return JSON.parse(characters);
    } catch (err) {
        throw new Error(`Error en la promesa ${err}`);
    }
};

const writeCharactersFs = async (characters) => {
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2));
};

routerCharacter.post('/', async (req, res) => {
    const characters = await readCharactersFs();
    const newCharacter = {
        id: characters.length + 1,
        name: req.body.name,
        animeId: req.body.animeId
    };

    characters.push(newCharacter);
    await writeCharactersFs(characters);
    res.status(201).json({ message: "Personaje creado exitosamente", character: newCharacter });
});

routerCharacter.get('/', async (req, res) => {
    const characters = await readCharactersFs();
    res.json({ characters });
});

routerCharacter.get('/:id', async (req, res) => {
    const characters = await readCharactersFs();
    const character = characters.find(c => c.id === parseInt(req.params.id));
    if (!character) return res.status(404).send('Personaje no encontrado');
    res.json({ character });
});

routerCharacter.put('/:id', async (req, res) => {
    const characters = await readCharactersFs();
    const indexCharacter = characters.findIndex(c => c.id === parseInt(req.params.id));
    if (indexCharacter === -1) return res.status(404).send('Personaje no encontrado');
    const updatedCharacter = {
        ...characters[indexCharacter],
        name: req.body.name,
        animeId: req.body.animeId
    };

    characters[indexCharacter] = updatedCharacter;
    await writeCharactersFs(characters);
    res.json({ message: `Personaje actualizado exitosamente`, character: updatedCharacter });
});

routerCharacter.delete('/:id', async (req, res) => {
    const characters = await readCharactersFs();
    const characterIndex = characters.findIndex(character => character.id === parseInt(req.params.id));
    if (characterIndex === -1) return res.status(404).send('Personaje no encontrado');
    characters.splice(characterIndex, 1);
    await writeCharactersFs(characters);
    res.json({ message: 'Personaje eliminado exitosamente' });
});

export default routerCharacter;