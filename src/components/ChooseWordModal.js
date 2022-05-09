import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    textAlign: 'center'
};

export default function ChooseWordModal({ setChosenWord }) {
    const [open, setOpen] = React.useState(true);
    const handleClose = () => setOpen(false);
    const [words, setWords] = useState({ easyWord: '', mediumWord: '', hardWord: '' });

    const easyWords = ['bell', 'hat', 'cow', 'skirt', 'axe', 'bed', 'bug', 'crab', 'fish', 'car', 'book', 'boat'];
    const mediumWords = ['pizza', 'juice', 'emoji', 'robot', 'money', 'chair', 'japan', 'train', 'stone', 'elbow', 'horse'];
    const hardWords = ['bicycle', 'flower', 'diamond', 'horse', 'chicken', 'buckle', 'israel', 'football', 'submarine', 'elephant'];

    //when a user chose his word
    const setUserChosenWord = (chosenWord) => {
        setChosenWord(chosenWord);
        setOpen(false);
    };

    //on mount, set 1 easy 1 medium and 1 hard word randomly from the words array.
    useEffect(() => {
        const getWords = {
            easyWord: easyWords[Math.floor(Math.random() * easyWords.length)],
            mediumWord: mediumWords[Math.floor(Math.random() * mediumWords.length)],
            hardWord: hardWords[Math.floor(Math.random() * hardWords.length)]
        };
        setWords(getWords);
    }, []);

    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Choose a word to draw
                    </Typography>
                    <Button onClick={() => setUserChosenWord(words.easyWord)}>{words.easyWord}</Button>
                    <Button onClick={() => setUserChosenWord(words.mediumWord)}>{words.mediumWord}</Button>
                    <Button onClick={() => setUserChosenWord(words.hardWord)}>{words.hardWord}</Button>
                </Box>
            </Modal>
        </div>
    );
}