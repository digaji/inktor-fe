interface Grid {
  cellSize: number
  columnCount: number
  rowCount: number
}

const Grid = (cellSize = 50, columnCount = 10, rowCount = 10): Grid => {
  return { cellSize, columnCount, rowCount }
}

export default Grid
