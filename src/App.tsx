import { useEffect, useState } from 'react';
import JigsawPuzzle from "./JigsawPuzzle";

//import './App.css';

const App: React.FC = () => {
  const [image, setImage] = useState<string>('');

  useEffect(() => {
    // Generate a random number between 1 and 100
    const randomNumber = Math.floor(Math.random() * 600) + 1;

    // Construct the image URL
    const randomImage = `https://www.steadyteddys.com/MEMES/meme${randomNumber}.jpg`;

    // Set the image state
    setImage(randomImage);
  }, []);
  return (
    <div className="min-h-screen bg-navy-900">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mt-3 text-blue-500">Steady Buzzle Game</h1>
        <JigsawPuzzle
          imageSrc={image}
          gridSize={4}
          onSolved={() => console.log('Puzzle solved!')}
        />
      </div>
      <footer className='m-4'>
        Created by <a href="https://x.com/0x_scientist">0x_scientist</a>
      </footer>
    </div>
  );
};

export default App;
