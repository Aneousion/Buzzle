import React, { FC, useEffect, useState } from "react";

interface Tile {
  id: number;
  correctX: number;
  correctY: number;
  currentX: number;
  currentY: number;
  isSolved: boolean;
}

interface JigsawPuzzleProps {
  imageSrc: string;
  rows?: number;
  columns?: number;
  onSolved?: () => void;
}

const JigsawPuzzle: FC<JigsawPuzzleProps> = ({
  imageSrc,
  rows = 4,
  columns = 4,
  onSolved = () => {}
}) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isDragging, setIsDragging] = useState<number | null>(null);

  const shuffleTiles = () => {
    const shuffledTiles: Tile[] = [];
    for (let i = 0; i < rows * columns; i++) {
      const correctX = i % columns;
      const correctY = Math.floor(i / columns);
      shuffledTiles.push({
        id: i,
        correctX,
        correctY,
        currentX: Math.floor(Math.random() * columns),
        currentY: Math.floor(Math.random() * rows),
        isSolved: false
      });
    }
    setTiles(shuffledTiles);
  };

  useEffect(() => {
    shuffleTiles();
  }, [rows, columns]);

  const handleDragStart = (id: number) => {
    setIsDragging(id);
  };

  const handleDrop = (x: number, y: number) => {
    if (isDragging === null) return;

    setTiles((prevTiles) => {
      const draggedTile = prevTiles.find((tile) => tile.id === isDragging);
      if (!draggedTile) return prevTiles;

      const updatedTiles = prevTiles.map((tile) =>
        tile.id === isDragging
          ? { ...tile, currentX: x, currentY: y }
          : tile
      );

      // Check if all tiles are solved
      const allSolved = updatedTiles.every(
        (tile) =>
          tile.correctX === tile.currentX &&
          tile.correctY === tile.currentY
      );
      if (allSolved) {
        onSolved();
      }

      return updatedTiles;
    });
    setIsDragging(null);
  };

  const tileSize = 100 / rows; // Percentage size for each tile

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "500px",
        height: "auto",
        aspectRatio: `${columns} / ${rows}`,
        border: "2px solid maroon",
        backgroundColor: "white",
        margin: "0 auto"
      }}
    >
      {tiles.map((tile) => (
        <div
          key={tile.id}
          draggable
          onDragStart={() => handleDragStart(tile.id)}
          onDragEnd={() => setIsDragging(null)}
          onDrop={() => handleDrop(tile.currentX, tile.currentY)}
          style={{
            position: "absolute",
            top: `${tile.currentY * tileSize}%`,
            left: `${tile.currentX * tileSize}%`,
            width: `${tileSize}%`,
            height: `${tileSize}%`,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: `${columns * 100}% ${rows * 100}%`,
            backgroundPosition: `${
              (tile.correctX / (columns - 1)) * 100
            }% ${(tile.correctY / (rows - 1)) * 100}%`,
            border: tile.isSolved ? "none" : "1px solid brown",
            boxSizing: "border-box",
            cursor: "grab"
          }}
        />
      ))}
      {/* Invisible grid for snapping */}
      {Array.from({ length: rows }).map((_, y) =>
        Array.from({ length: columns }).map((_, x) => (
          <div
            key={`${x}-${y}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(x, y)}
            style={{
              position: "absolute",
              top: `${y * tileSize}%`,
              left: `${x * tileSize}%`,
              width: `${tileSize}%`,
              height: `${tileSize}%`,
              border: "1px dashed transparent",
              boxSizing: "border-box"
            }}
          />
        ))
      )}
    </div>
  );
};

export default JigsawPuzzle;
