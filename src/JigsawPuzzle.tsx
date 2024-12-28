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
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [touchedTile, setTouchedTile] = useState<number | null>(null);
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
    setSelectedTile(null);
  }, [gridSize]);

  useEffect(() => {
    shuffleTiles();
  }, [gridSize, shuffleTiles]);

  const handleTouchStart = (e: React.TouchEvent, id: number) => {
    e.preventDefault();
    setTouchedTile(id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchedTile === null) return;

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const puzzleGrid = element.closest('.puzzle-grid');
    if (!puzzleGrid) return;

    const rect = puzzleGrid.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    const tileSize = 100 / gridSize;
    const targetX = Math.floor(x / tileSize);
    const targetY = Math.floor(y / tileSize);

    if (targetX >= 0 && targetX < gridSize && targetY >= 0 && targetY < gridSize) {
      handleDrop(targetX, targetY);
    }

    setTouchedTile(null);
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.stopPropagation();
    setIsDragging(id);
  };

  const handleClick = (e: React.MouseEvent, clickedTileId: number) => {
    // Only handle clicks if we're not dragging
    if (isDragging !== null) return;
    
    e.preventDefault();
    e.stopPropagation();

    if (selectedTile === null) {
      setSelectedTile(clickedTileId);
      return;
    }

    if (selectedTile === clickedTileId) {
      setSelectedTile(null);
      return;
    }

    // Swap tiles
    swapTiles(selectedTile, clickedTileId);
    setSelectedTile(null);
  };

  const swapTiles = (firstTileId: number, secondTileId: number) => {
    setTiles((prevTiles) => {
      const firstTileIndex = prevTiles.findIndex((tile) => tile.id === firstTileId);
      const secondTileIndex = prevTiles.findIndex((tile) => tile.id === secondTileId);

      if (firstTileIndex === -1 || secondTileIndex === -1) return prevTiles;

      const newTiles = [...prevTiles];
      const firstTile = newTiles[firstTileIndex];
      const secondTile = newTiles[secondTileIndex];

      // Swap positions
      const tempX = firstTile.currentX;
      const tempY = firstTile.currentY;
      
      newTiles[firstTileIndex] = {
        ...firstTile,
        currentX: secondTile.currentX,
        currentY: secondTile.currentY,
      };
      
      newTiles[secondTileIndex] = {
        ...secondTile,
        currentX: tempX,
        currentY: tempY,
      };

      checkSolution(newTiles);
      return newTiles;
    });
  };

  const handleDrop = (x: number, y: number) => {
    const activeId = isDragging !== null ? isDragging : touchedTile;
    if (activeId === null) return;

    const targetTile = tiles.find(tile => tile.currentX === x && tile.currentY === y);
    if (targetTile) {
      swapTiles(activeId, targetTile.id);
    }

    setIsDragging(null);
    setTouchedTile(null);
  };

  const checkSolution = (currentTiles: Tile[]) => {
    const allSolved = currentTiles.every(
      (tile) => tile.correctX === tile.currentX && tile.correctY === tile.currentY
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
  };

  const handlePlayAgain = () => {
    window.location.reload();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-navy-900 text-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row md:gap-8">
        <div
          className={cn(
            "relative w-full aspect-square puzzle-grid",
            "rounded-lg overflow-hidden shadow-xl",
            "bg-white"
          )}
        >
          {tiles.map((tile) => (
            <div
              key={tile.id}
              draggable
              onDragStart={(e) => handleDragStart(e, tile.id)}
              onDragEnd={() => setIsDragging(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(tile.currentX, tile.currentY)}
              onTouchStart={(e) => handleTouchStart(e, tile.id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={(e) => handleClick(e, tile.id)}
              className={cn(
                "absolute transition-all cursor-pointer",
                "hover:z-10 hover:brightness-110",
                (isDragging === tile.id || touchedTile === tile.id) ? "z-20 scale-105" : "",
                selectedTile === tile.id ? "z-20 scale-105 ring-4 ring-blue-500 brightness-110" : "z-10"
              )}
              style={{
                top: `${(tile.currentY / gridSize) * 100}%`,
                left: `${(tile.currentX / gridSize) * 100}%`,
                width: `${100 / gridSize}%`,
                height: `${100 / gridSize}%`,
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                backgroundPosition: `${(tile.correctX / (gridSize - 1)) * 100}% ${(tile.correctY / (gridSize - 1)) * 100}%`,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
                touchAction: "none"
              }}
            />
          ))}
        </div>

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