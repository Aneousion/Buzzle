import { FC, useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import confetti from 'canvas-confetti';
import { cn } from "./lib/utils";

interface Tile {
  id: number;
  correctX: number;
  correctY: number;
  currentX: number;
  currentY: number;
}

interface JigsawPuzzleProps {
  imageSrc: string;
  gridSize?: number;
  onSolved?: () => void;
}

const JigsawPuzzle: FC<JigsawPuzzleProps> = ({
  imageSrc,
  gridSize = 4,
  onSolved = () => { },
}) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const shuffleTiles = useCallback(() => {
    const positions = new Set<string>();
    const shuffledTiles: Tile[] = [];

    for (let i = 0; i < gridSize * gridSize; i++) {
      const correctX = i % gridSize;
      const correctY = Math.floor(i / gridSize);

      let currentX, currentY;
      do {
        currentX = Math.floor(Math.random() * gridSize);
        currentY = Math.floor(Math.random() * gridSize);
      } while (positions.has(`${currentX},${currentY}`));

      positions.add(`${currentX},${currentY}`);
      shuffledTiles.push({
        id: i,
        correctX,
        correctY,
        currentX,
        currentY,
      });
    }
    setTiles(shuffledTiles);
  }, [gridSize]);

  useEffect(() => {
    shuffleTiles();
  }, [gridSize, shuffleTiles]);

  const handleDragStart = (id: number) => {
    setIsDragging(id);
  };

  const handleDrop = (x: number, y: number) => {
    if (isDragging === null) return;

    setTiles((prevTiles) => {
      const draggedTileIndex = prevTiles.findIndex((tile) => tile.id === isDragging);
      const targetTileIndex = prevTiles.findIndex(
        (tile) => tile.currentX === x && tile.currentY === y
      );

      if (draggedTileIndex === -1) return prevTiles;

      const newTiles = [...prevTiles];
      const draggedTile = newTiles[draggedTileIndex];

      if (targetTileIndex !== -1) {
        const targetTile = newTiles[targetTileIndex];
        newTiles[targetTileIndex] = {
          ...targetTile,
          currentX: draggedTile.currentX,
          currentY: draggedTile.currentY,
        };
      }

      newTiles[draggedTileIndex] = { ...draggedTile, currentX: x, currentY: y };

      const allSolved = newTiles.every(
        (tile) =>
          tile.correctX === tile.currentX && tile.correctY === tile.currentY
      );

      if (allSolved) {
        setShowSuccess(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        onSolved();
      }

      return newTiles;
    });

    setIsDragging(null);
  };

  const handlePlayAgain = () => {
    window.location.reload();
  };

  return (
    
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-navy-900 text-white rounded-xl shadow-lg">
      
      <div className="flex flex-col md:flex-row md:gap-8">

        {/* Puzzle Grid */}

        <div
          className={cn(
            "relative w-full aspect-square",
            " rounded-lg overflow-hidden shadow-xl",
            "bg-white"
          )}
        >
          
          {tiles.map((tile) => (
            <div
              key={tile.id}
              draggable
              onDragStart={() => handleDragStart(tile.id)}
              onDragEnd={() => setIsDragging(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(tile.currentX, tile.currentY)}
              className={cn(
                "absolute cursor-grab active:cursor-grabbing transition-transform",
                "hover:z-10 hover:scale-105",
                isDragging === tile.id ? "z-20 scale-105" : "z-10"
              )}
              style={{
                top: `${(tile.currentY / gridSize) * 100}%`,
                left: `${(tile.currentX / gridSize) * 100}%`,
                width: `${100 / gridSize}%`,
                height: `${100 / gridSize}%`,
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                backgroundPosition: `${(tile.correctX / (gridSize - 1)) * 100
                  }% ${(tile.correctY / (gridSize - 1)) * 100}%`,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
              }}
            />
          ))}
        </div>


        {/* Reference Image */}
        <div className="mt-4 md:mt-0 w-full md:w-1/2 aspect-square overflow-hidden shadow-lg">
          <img
            src={imageSrc}
            alt="Puzzle Reference"
            className="object-cover"
          />
        </div>
      </div>
      <Button
            onClick={shuffleTiles}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Shuffle Tiles
          </Button>
      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md bg-navy-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-bold text-blue-300">
              🎉 Puzzle Solved! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-xl mb-6">
             Unfortunately for you, you have a high IQ.
            </p>
            <Button
              onClick={handlePlayAgain}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg"
            >
              Play Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JigsawPuzzle;

