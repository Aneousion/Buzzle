import { useEffect, useState } from 'react';
import JigsawPuzzle from "./JigsawPuzzle";

const App = () => {
  const [image, setImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkAndSetImage = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Generate a random number between 1 and 600
        const randomNumber = Math.floor(Math.random() * 600) + 1;
        const randomImage = `https://www.steadyteddys.com/MEMES/meme${randomNumber}.jpg`;

        // Try to fetch the image
        const response = await fetch(randomImage);
        
        if (!response.ok) {
          throw new Error('Image not found');
        }

        // Check if the response is actually an image
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          throw new Error('Invalid image format');
        }

        setImage(randomImage);
      } catch (err) {
        setError('Failed to load image. Trying another one...');
        // Recursively try another image if this one fails
        checkAndSetImage();
      } finally {
        setLoading(false);
      }
    };

    checkAndSetImage();
  }, []);

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mt-3 text-blue-500">
          Steady Buzzle Game
        </h1>
        
        {loading && (
          <div className="text-center text-white mt-4">
            Loading puzzle...
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-500 mt-4">
            {error}
          </div>
        )}
        
        {image && !loading && (
          <JigsawPuzzle
            imageSrc={image}
            gridSize={4}
            onSolved={() => console.log('Puzzle solved!')}
          />
        )}
      </div>
      <footer className="m-4 text-white">
        Created by <a href="https://x.com/0x_scientist" className="text-blue-500 hover:text-blue-400">0x_scientist</a>
      </footer>
    </div>
  );
};

export default App;