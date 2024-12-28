import React, { useEffect, useState } from 'react';
import { JigsawPuzzle } from "react-jigsaw-puzzle/lib";
import "react-jigsaw-puzzle/lib/jigsaw-puzzle.css";

import './App.css';

const App: React.FC = () => {
  const [image, setImage] = useState<string>('');

  useEffect(() => {
    // Array of image URLs
    const images = [
      "https://www.steadyteddys.com/MEMES/meme4.jpg",
      "https://www.steadyteddys.com/MEMES/meme1.png",
      "https://www.steadyteddys.com/MEMES/meme2.png"
    ];
    // Select a random image
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setImage(randomImage);
  }, []);

  return (
    <div className="app">
      <header className="header">Teddy Buzzle</header>
      <main className="main">
        {/* Render the puzzle only if an image is selected */}
        {image ? (
          <JigsawPuzzle
            imageSrc={image}
            rows={4}
            columns={4}
            onSolved={() => alert('Congratulations! You solved the puzzle!')}
          />
        ) : (
          <p>Loading puzzle...</p>
        )}
      </main>
      <footer className="footer">
        created by <a href="https://github.com/yourgithub" target="_blank" rel="noopener noreferrer">Your GitHub</a>
      </footer>
    </div>
  );
};

export default App;
