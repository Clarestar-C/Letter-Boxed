import React, { useState, useEffect } from 'react';
import rawWords from 'an-array-of-english-words';
import './App.css';

const DEFAULT_BOARD = {
  R: { x: 60, y: 0, side: 'top' },
  C: { x: 143, y: 0, side: 'top' },
  G: { x: 240, y: 0, side: 'top' },
  X: { x: 300, y: 60, side: 'right' },
  H: { x: 300, y: 143, side: 'right' },
  M: { x: 300, y: 240, side: 'right' },
  T: { x: 240, y: 300, side: 'bottom' },
  U: { x: 143, y: 300, side: 'bottom' },
  I: { x: 60, y: 300, side: 'bottom' },
  A: { x: 0, y: 240, side: 'left' },
  E: { x: 0, y: 143, side: 'left' },
  S: { x: 0, y: 60, side: 'left' }
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

const DICTIONARY = new Set(
  rawWords
    .filter(w => w.length >= 3 && w.length <= 12)
    .map(w => w.toUpperCase())
);

function solveBoard(board) {
  const boardLetters = Object.keys(board);
  const letterSet = new Set(boardLetters);

  const validWords = Array.from(DICTIONARY).filter(word => {
    for (let i = 0; i < word.length; i++) {
      if (!letterSet.has(word[i])) return false;
      if (i > 0 && board[word[i]].side === board[word[i - 1]].side) return false;
    }
    return true;
  });

  if (validWords.length === 0) return 5;

  const wordsByStart = {};
  boardLetters.forEach(l => { wordsByStart[l] = []; });
  validWords.forEach(w => {
    const start = w[0];
    if (wordsByStart[start]) wordsByStart[start].push(w);
  });

  let shortestPath = Infinity;

  function dfs(currentWord, visitedLettersMask, depth) {
    if (depth >= shortestPath) return;

    if (visitedLettersMask === (1 << boardLetters.length) - 1) {
      shortestPath = depth;
      return;
    }

    if (depth >= 5) return;

    const lastChar = currentWord[currentWord.length - 1];
    const nextWords = wordsByStart[lastChar] || [];

    for (const nextWord of nextWords) {
      let newMask = visitedLettersMask;
      for (let i = 0; i < nextWord.length; i++) {
        const idx = boardLetters.indexOf(nextWord[i]);
        if (idx !== -1) newMask |= (1 << idx);
      }
      dfs(nextWord, newMask, depth + 1);
    }
  }

  for (const word of validWords) {
    let mask = 0;
    for (let i = 0; i < word.length; i++) {
      const idx = boardLetters.indexOf(word[i]);
      if (idx !== -1) mask |= (1 << idx);
    }
    dfs(word, mask, 1);
  }

  return shortestPath === Infinity ? 5 : shortestPath;
}

export default function App() {
  const [boardLetters, setBoardLetters] = useState(DEFAULT_BOARD);
  const [guess, setGuess] = useState("");
  const [completedWords, setCompletedWords] = useState([]);
  const [targetWords, setTargetWords] = useState(5);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    generateNewBoard();
  }, []);

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage("");
    }, 2000);
  };

  const letterSequence = [...completedWords, guess].join('');

  const handleSelectLetter = (letter) => {
    if (!letter || !boardLetters[letter]) return;

    if (guess.length > 0) {
      const prevLetter = guess[guess.length - 1];
      const prevSide = boardLetters[prevLetter].side;
      const currentSide = boardLetters[letter].side;
      if (prevSide === currentSide) return;
    }
    setGuess((prev) => prev + letter);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

    if (targetElement) {
      const circleEl = targetElement.closest('.circle');
      if (circleEl) {
        const letter = circleEl.querySelector('.label')?.innerText;
        if (letter && guess[guess.length - 1] !== letter) {
          handleSelectLetter(letter);
        }
      }
    }
  };

  // Submit current guess logic
  const handleEnterSubmit = () => {
    if (guess.length < 3) {
      showError("Too short");
      return;
    }

    if (!DICTIONARY.has(guess)) {
      showError("Not in word list");
      return;
    }

    setCompletedWords((prev) => [...prev, guess]);
    setGuess(guess[guess.length - 1]);
  };

  // Clear current puzzle progress without generating a new board layout
  const handleRestartProgress = () => {
    setCompletedWords([]);
    setGuess("");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();

      if (key === 'ENTER') {
        handleEnterSubmit();
      } else if (key === 'BACKSPACE') {
        setGuess((prev) => prev.slice(0, -1));
      } else if (key.length === 1 && boardLetters[key]) {
        handleSelectLetter(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guess, boardLetters]);

  const generateNewBoard = () => {
    let newBoard = {};
    let minComputerPath = Infinity;

    while (minComputerPath === Infinity) {
      const shuffledVowels = [...VOWELS].sort(() => 0.5 - Math.random());
      const shuffledConsonants = [...CONSONANTS].sort(() => 0.5 - Math.random());
      
      const selected = [...shuffledVowels.slice(0, 3), ...shuffledConsonants.slice(0, 9)];
      const finalLetters = selected.sort(() => 0.5 - Math.random());

      const positions = [60, 143, 240];
      newBoard = {};

      finalLetters.slice(0, 3).forEach((l, idx) => {
        newBoard[l] = { x: positions[idx], y: 0, side: 'top' };
      });
      finalLetters.slice(3, 6).forEach((l, idx) => {
        newBoard[l] = { x: 300, y: positions[idx], side: 'right' };
      });
      finalLetters.slice(6, 9).forEach((l, idx) => {
        newBoard[l] = { x: positions[idx], y: 300, side: 'bottom' };
      });
      finalLetters.slice(9, 12).forEach((l, idx) => {
        newBoard[l] = { x: 0, y: positions[idx], side: 'left' };
      });

      minComputerPath = solveBoard(newBoard);
    }

    const playerTarget = Math.min(minComputerPath + 2, 6);

    setBoardLetters(newBoard);
    setCompletedWords([]);
    setGuess("");
    setTargetWords(playerTarget);
  };

  const getFontSize = (word) => {
    if (word.length > 10) return "1.1rem";
    if (word.length > 7) return "1.4rem";
    if (word.length > 5) return "1.7rem";
    return "2rem";
  };

  return (
    <div className="page">
      {errorMessage && (
        <div className="toast-notification">
          {errorMessage}
        </div>
      )}

      {/* Left UI Panel */}
      <div className="left-panel">
        <div className="guess-container">
          <div className="guess-word" style={{ fontSize: getFontSize(guess) }}>
            {guess}<span className="cursor"></span>
          </div>
        </div>

        <div className="word-stats">
          <p className="word-count">
            {completedWords.length} {completedWords.length === 1 ? 'word' : 'words'}
          </p>

          <div className="history-list">
            {completedWords.map((word, idx) => (
              <p key={idx} className="history-word">{word}</p>
            ))}
          </div>

          <p className="hint">Try to solve in {targetWords} words</p>
          <button className="reset-btn" onClick={generateNewBoard}>New Board</button>
        </div>
      </div>

      {/* Right Column: Game Board + Control Buttons */}
      <div className="board-column">
        <div className="board" onTouchMove={handleTouchMove}>
          <div className="square"></div>

          <svg className="svg-overlay">
            {letterSequence.split('').map((char, index) => {
              if (index === 0) return null;
              const start = boardLetters[letterSequence[index - 1]];
              const end = boardLetters[char];
              if (!start || !end) return null;

              return (
                <line
                  key={index}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  className="connector-line"
                />
              );
            })}
          </svg>

          {Object.entries(boardLetters).map(([letter, pos]) => {
            const isUsed = letterSequence.includes(letter);
            return (
              <div
                key={letter}
                className={`circle ${pos.side} ${isUsed ? 'active' : ''}`}
                onClick={() => handleSelectLetter(letter)}
                style={{
                  left: pos.side === 'left' ? '-7px' : pos.side === 'right' ? 'auto' : `${pos.x}px`,
                  right: pos.side === 'right' ? '-7px' : 'auto',
                  top: pos.side === 'top' ? '-7px' : pos.side === 'bottom' ? 'auto' : `${pos.y}px`,
                  bottom: pos.side === 'bottom' ? '-7px' : 'auto'
                }}
              >
                <span className={`label label-${pos.side}`}>{letter}</span>
              </div>
            );
          })}
        </div>

        {/* Action Controls Bar */}
        <div className="controls-bar">
          <button className="control-btn" onClick={handleRestartProgress}>Restart</button>
          <button className="control-btn" onClick={() => setGuess((prev) => prev.slice(0, -1))}>Delete</button>
          <button className="control-btn" onClick={handleEnterSubmit}>Enter</button>
        </div>
      </div>
    </div>
  );
}
