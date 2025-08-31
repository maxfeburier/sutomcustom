import React, { useState, useEffect, useCallback } from 'react';
import './Sutom.css';
import {InputDaysWord} from "./InputDaysWord";
import {Button, MenuItem, Select} from "@mui/material";
import {Keyboard} from "./Keyboard";
import {supabase} from "../utils/supabase";

interface LetterState {
    letter: string;
    status: 'correct' | 'present' | 'absent' | 'empty';
}

type playerType = {
    id: number;
    name: string;
}

type wordType = {
    id: number;
    word: string;
    to_player: number;
}

const MAX_ATTEMPTS = 6;

export const Sutom: React.FC = () => {
    const [currentRow, setCurrentRow] = useState(0);
    const [currentCol, setCurrentCol] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [message, setMessage] = useState('');
    const [inputPaused, setInputPaused] = useState(false);
    const [player, setPlayer] = useState('');
    const [playerId, setPlayerId] = useState(1);
    const [players, setPlayers] = useState<playerType[]>();
    const [targetWord, setTargetWord] = useState<{ word:string,id:number }>({word:"",id:0});
    const [wordLength, setWordLength] = useState<number>(targetWord.word.length);

    useEffect(() => {
        async function getAllPlayers() {
            const { data: players } = await supabase.from('players').select()

            if (players && players.length > 1) {
                const typedPlayers: playerType[] = players.map((p) => ({
                    id: p.id,
                    name: p.name
                }));
                setPlayers(typedPlayers)
                setPlayer(typedPlayers[0].name);
                setPlayerId(players[0].id);
            }
        }
        getAllPlayers();
    }, []);

    useEffect(() => {
        async function getWordsForMe() {
            const { data: words } = await supabase.from('actuals_words').select('word,id').eq('to_player', playerId);

            if (words && words.length > 0) {
                const typedWords: wordType = words[0] as wordType;
                setTargetWord(typedWords);
                setWordLength(words[0].word.length);
            }else{
                setTargetWord({word:"",id:0});
                setWordLength(0);
            }
        }
        getWordsForMe();

    }, [playerId]);

    const [grid, setGrid] = useState<LetterState[][]>(
        Array(MAX_ATTEMPTS).fill(null).map(() =>
            Array(wordLength).fill(null).map(() => ({ letter: '', status: 'empty' as const }))
        )
    );

    useEffect(() => {

        async function getAllAttempts() {
            const { data: attempts } = await supabase.from('attempts').select('attempt').eq('player', playerId).eq('word_id', targetWord.id);
            console.log(attempts);
            if (attempts && attempts.length > 0) {
                const newGrid = Array(MAX_ATTEMPTS).fill(null).map(() =>
                    Array(wordLength).fill(null).map(() => ({ letter: '', status: 'empty' as const }))
                );

                let newCurrentRow = 0;

                attempts.forEach((attemptObj, index) => {
                    const attempt = attemptObj.attempt.toUpperCase();

                    for (let i = 0; i < wordLength; i++) {
                        newGrid[index][i] = { letter: attempt[i], status: 'empty' };
                    }
                    newCurrentRow++;
                });
                setGrid(newGrid);
                setCurrentRow(newCurrentRow);
                setCurrentCol(0);
            } else {
                setGrid(Array(MAX_ATTEMPTS).fill(null).map(() =>
                    Array(wordLength).fill(null).map(() => ({ letter: '', status: 'empty' as const }))
                ));
                setCurrentRow(0);
                setCurrentCol(0);
            }
        }
        resetGame();
        getAllAttempts();
    }, [playerId, targetWord, wordLength]);


    useEffect(() => {

    }, [wordLength]);

    const resetGame = () => {
        setGrid(Array(MAX_ATTEMPTS).fill(null).map(() =>
            Array(wordLength).fill(null).map(() => ({ letter: '', status: 'empty' as const }))
        ));
        setCurrentRow(0);
        setCurrentCol(0);
        setGameOver(false);
        setWon(false);
        setMessage('');
    };

    const checkWord = useCallback(() => {
        const currentWord = grid[currentRow].map(cell => cell.letter).join('');
        console.log('Checking word:', currentWord, 'against target:', targetWord.word);
        if (currentWord.length !== wordLength) {
            setMessage('Mot incomplet !');
            return;
        }

        const newGrid = [...grid];
        const targetLetters = targetWord.word.split('');
        const wordLetters = currentWord.split('');

        // Première passe : marquer les lettres correctes
        for (let i = 0; i < wordLength; i++) {
            if (wordLetters[i] === targetLetters[i]) {
                newGrid[currentRow][i].status = 'correct';
                targetLetters[i] = '';
                wordLetters[i] = '';
            }
        }

        // Deuxième passe : marquer les lettres présentes mais mal placées
        for (let i = 0; i < wordLength; i++) {
            if (wordLetters[i] && targetLetters.includes(wordLetters[i])) {
                newGrid[currentRow][i].status = 'present';
                const targetIndex = targetLetters.indexOf(wordLetters[i]);
                targetLetters[targetIndex] = '';
            } else if (wordLetters[i]) {
                newGrid[currentRow][i].status = 'absent';
            }
        }

        setGrid(newGrid);
        setMessage('');

        if (currentWord === targetWord.word) {
            setWon(true);
            setGameOver(true);
            setMessage('Félicitations ! Vous avez trouvé le mot !');
        } else if (currentRow + 1 === MAX_ATTEMPTS) {
            setGameOver(true);
            setMessage(`Perdu ! Le mot était : ${targetWord.word}`);
        } else {
            setCurrentRow(currentRow + 1);
            setCurrentCol(0);
        }
    }, [grid, currentRow, currentCol]);

    const handleKeyPress = useCallback((key: string) => {
        if (gameOver) return;

        if (key === 'ENTER') {
            if (currentCol === wordLength) {
                checkWord();
            } else {
                setMessage('Mot incomplet !');
            }
        } else if (key === 'BACKSPACE') {
            if (currentCol > 0) {
                const newGrid = [...grid];
                newGrid[currentRow][currentCol - 1] = { letter: '', status: 'empty' };
                setGrid(newGrid);
                setCurrentCol(currentCol - 1);
                setMessage('');
            }
        } else if (key.match(/^[A-Z]$/) && currentCol < wordLength) {
            const newGrid = [...grid];
            newGrid[currentRow][currentCol] = { letter: key, status: 'empty' };
            setGrid(newGrid);
            setCurrentCol(currentCol + 1);
            setMessage('');
        }
    }, [currentRow, currentCol, gameOver, grid, checkWord]);

    useEffect(() => {
        if(!inputPaused){
            const handleKeyDown = (event: KeyboardEvent) => {
                const key = event.key.toUpperCase();
                handleKeyPress(key);
            };

            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [handleKeyPress, inputPaused]);

    const getCellClass = (cell: LetterState, rowIndex: number) => {
        let className = `cell ${cell.status}`;
        if (rowIndex === currentRow && !gameOver) {
            className += ' current-row';
        }
        return className;
    };

    return (
        <div className="sutom-container">
            <h1>Batard & Morue</h1>
            <div className="row">
                <p className="white-text">Qui est en train de jouer ?</p>
                <Select onChange={(e)=> {
                    setPlayer(e.target.value);
                    const selectedPlayer = players?.find(p => p.name === e.target.value);
                    if (selectedPlayer) {
                        setPlayerId(selectedPlayer.id);
                    }
                }} value={player}>
                    {players && players.length > 0 && players.map((p : {id:number, name:string}) => (
                        <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>
                    ))}
                </Select>
            </div>

            <div className="grid">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="row">
                        {row.map((cell, cellIndex) => (
                            <div
                                key={cellIndex}
                                className={getCellClass(cell, rowIndex)}
                            >
                                {cell.letter}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <Keyboard handleKeyPress={handleKeyPress} />

            {message && (
                <h1 className={`message ${won ? 'success' : gameOver ? 'error' : 'info'}`}>
                    {message}
                </h1>
            )}

            {gameOver && (
                <div className="game-controls">
                    <Button variant="contained" onClick={resetGame} className="reset-button">
                        Nouvelle partie
                    </Button>
                </div>
            )}
            <br/>
            <InputDaysWord playerId={playerId} isInputMode={inputPaused} setIsInputMode={setInputPaused} />
            <br/>

        </div>
    );
};

export default Sutom;
