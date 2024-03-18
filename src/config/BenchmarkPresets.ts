import { Color, SVGPathCommandType } from '@inktor/inktor-crdt-rs'

export enum BenchmarkPresetType {
  S = 'Scenario 1',
  M = 'Scenario 2',
  L = 'Scenario 3',
}

export enum BenchmarkElementType {
  CIRCLE = 0,
  RECTANGLE = 1,
  PATH = 2,
}

interface DefaultManipulations {
  stroke_width: number
  opacity: number
  fill?: Color
  stroke?: Color
}

export interface CircleManipulations extends DefaultManipulations {
  x: number
  y: number
  radius: number
}

export interface RectangleManipulations extends DefaultManipulations {
  x: number
  y: number
  width: number
  height: number
}

export interface PathManipulations extends DefaultManipulations {
  points?: {
    type: SVGPathCommandType
    x: number
    y: number
    handle1?: {
      x: number
      y: number
    }
    handle2?: {
      x: number
      y: number
    }
  }[]
}

export interface BenchmarkPreset {
  size: BenchmarkPresetType
  creation: {
    circle: number
    rectangle: number
    path: number
  }
  manipulation: {
    element: BenchmarkElementType
    edits: CircleManipulations | RectangleManipulations | PathManipulations
  }[]
}

export const BenchmarkPresets: BenchmarkPreset[] = [
  {
    size: BenchmarkPresetType.S,
    creation: {
      circle: 2,
      rectangle: 2,
      path: 0,
    },
    manipulation: [
      {
        // 1. Circle
        // X + 50, Y - 20, R + 10, S_W + 5, O -0.5
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 50,
          y: -20,
          radius: 10,
          stroke_width: 5,
          opacity: -0.5,
        },
      },
      {
        // 2. Circle
        // Fill red: -55 blue: -205, Stroke red: 155
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 0,
          y: 0,
          radius: 0,
          stroke_width: 0,
          opacity: 0,
          fill: [-55, 0, -205, 0],
          stroke: [155, 0, 0, 0],
        },
      },
      {
        // 3. Circle
        // X + 10
        element: BenchmarkElementType.CIRCLE,
        edits: { x: 10, y: 0, radius: 0, stroke_width: 0, opacity: 0 },
      },
      {
        // 4. Rectangle
        // X + 10, H + 20, W + 30, O -0.3
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 10,
          y: 0,
          height: 20,
          width: 30,
          stroke_width: 0,
          opacity: -0.3,
        },
      },
      {
        // 5. Rectangle
        // Fill red: -55
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 0,
          y: 0,
          height: 0,
          width: 0,
          stroke_width: 0,
          opacity: 0,
          fill: [-55, 0, 0, 0],
        },
      },
      {
        // 6. Circle
        // X - 30
        element: BenchmarkElementType.CIRCLE,
        edits: { x: -30, y: 0, radius: 0, stroke_width: 0, opacity: 0 },
      },
      {
        // 7. Circle
        // R + 20 , S_W + 5
        element: BenchmarkElementType.CIRCLE,
        edits: { x: 0, y: 0, radius: 20, stroke_width: 5, opacity: 0 },
      },
      {
        // 8. Rectangle
        // W + 100, S_W + 3
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 0,
          y: 0,
          height: 0,
          width: 100,
          stroke_width: 3,
          opacity: 0,
        },
      },
      {
        // 9. Rectangle
        // Y - 50, H + 30, O -0.3
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 0,
          y: -50,
          height: 30,
          width: 0,
          stroke_width: 0,
          opacity: -0.3,
        },
      },
      {
        // 10. Rectangle
        // X + 45, S_W + 5, Fill green: -75
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 45,
          y: 0,
          height: 0,
          width: 0,
          stroke_width: 5,
          opacity: 0,
          fill: [0, -75, 0, 0],
        },
      },
    ],
  },
  {
    size: BenchmarkPresetType.M,
    creation: {
      circle: 4,
      rectangle: 2,
      path: 2,
    },
    manipulation: [
      {
        // 1. Circle
        // X + 20, Y + 50, R + 20, S_W + 2, O - 0.3
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 20,
          y: 50,
          radius: 20,
          stroke_width: 2,
          opacity: -0.3,
        },
      },
      {
        // 2. Rectangle
        // X - 20, W + 30, O - 0.2
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: -20,
          y: 0,
          height: 0,
          width: 30,
          stroke_width: 0,
          opacity: -0.2,
        },
      },
      {
        // 3. Path
        // S_W + 2, O - 0.1
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 2,
          opacity: -0.1,
        },
      },
      {
        // 4. Circle
        // Y + 20
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 0,
          y: 20,
          radius: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 5. Circle
        // X - 80
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: -80,
          y: 0,
          radius: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 6. Rectangle
        // H + 50
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 0,
          y: 0,
          height: 50,
          width: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 7. Rectangle
        // X - 50, Fill green: -75
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: -50,
          y: 0,
          height: 0,
          width: 0,
          stroke_width: 0,
          opacity: 0,
          fill: [0, -75, 0, 0],
        },
      },
      {
        // 8. Path
        // Point: Bezier X: 50 Y: -50
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 0,
          opacity: 0,
          points: [
            {
              type: SVGPathCommandType.BEZIER,
              x: 50,
              y: -50,
            },
          ],
        },
      },
      {
        // 9. Path
        // Point: Bezier Quad X: 0 Y: 50
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 0,
          opacity: 0,
          points: [
            {
              type: SVGPathCommandType.BEZIER_QUAD,
              x: 0,
              y: 50,
            },
          ],
        },
      },
      {
        // 10. Circle
        // Fill blue: -200, Stroke blue: 120
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 0,
          y: 0,
          radius: 0,
          stroke_width: 0,
          opacity: 0,
          fill: [0, 0, -200, 0],
          stroke: [0, 0, 120, 0],
        },
      },
      {
        // 11. Circle
        // R - 5, Fill green: -80
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 0,
          y: 0,
          radius: -5,
          stroke_width: 0,
          opacity: 0,
          fill: [0, -80, 0, 0],
        },
      },
      {
        // 12. Circle
        // X - 20
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: -20,
          y: 0,
          radius: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 13. Rectangle
        // X + 20, Stroke green: 125
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 20,
          y: 0,
          height: 0,
          width: 0,
          stroke_width: 0,
          opacity: 0,
          stroke: [0, 125, 0, 0],
        },
      },
      {
        // 14. Rectangle
        // H - 20
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 0,
          y: 0,
          height: -20,
          width: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 15. Rectangle
        // S_W + 2
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 0,
          y: 0,
          height: 0,
          width: 0,
          stroke_width: 2,
          opacity: 0,
        },
      },
      {
        // 16. Path
        // Fill red: -200 green: -200
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 0,
          opacity: 0,
          fill: [-200, -200, 0, 0],
        },
      },
      {
        // 17. Path
        // O - 0.3
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 0,
          opacity: -0.3,
        },
      },
      {
        // 18. Path
        // Point: Close X: 0 Y: 0
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 0,
          opacity: 0,
          points: [
            {
              type: SVGPathCommandType.CLOSE,
              x: 0,
              y: 0,
            },
          ],
        },
      },
      {
        // 19. Circle
        // S_W + 3, O - 0.2
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 0,
          y: 0,
          radius: 0,
          stroke_width: 3,
          opacity: -0.2,
        },
      },
      {
        // 20. Circle
        // Y + 10
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 0,
          y: 10,
          radius: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
    ],
  },
  {
    size: BenchmarkPresetType.L,
    creation: {
      circle: 8,
      rectangle: 4,
      path: 4,
    },
    manipulation: [
      {
        // 1. Circle
        // X + 20, Y + 50, R + 20, S_W + 2, O - 0.3
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 20,
          y: 50,
          radius: 20,
          stroke_width: 2,
          opacity: -0.3,
        },
      },
      {
        // 2. Rectangle
        // X - 20, W + 30, O - 0.2
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: -20,
          y: 0,
          height: 0,
          width: 30,
          stroke_width: 0,
          opacity: -0.2,
        },
      },
      {
        // 3. Path
        // S_W + 2, O - 0.1
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 2,
          opacity: -0.1,
        },
      },
      {
        // 4. Circle
        // Y + 20
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 0,
          y: 20,
          radius: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 5. Circle
        // X - 80
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: -80,
          y: 0,
          radius: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 6. Rectangle
        // H + 50
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 0,
          y: 0,
          height: 50,
          width: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 7. Rectangle
        // X - 50, Fill green: -75
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: -50,
          y: 0,
          height: 0,
          width: 0,
          stroke_width: 0,
          opacity: 0,
          fill: [0, -75, 0, 0],
        },
      },
      {
        // 8. Path
        // Point: Bezier X: 50 Y: -50
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 0,
          opacity: 0,
          points: [
            {
              type: SVGPathCommandType.BEZIER,
              x: 50,
              y: -50,
            },
          ],
        },
      },
      {
        // 9. Path
        // Point: Bezier Quad X: 0 Y: 50
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 0,
          opacity: 0,
          points: [
            {
              type: SVGPathCommandType.BEZIER_QUAD,
              x: 0,
              y: 50,
            },
          ],
        },
      },
      {
        // 10. Circle
        // Fill blue: -200, Stroke blue: 120
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 0,
          y: 0,
          radius: 0,
          stroke_width: 0,
          opacity: 0,
          fill: [0, 0, -200, 0],
          stroke: [0, 0, 120, 0],
        },
      },
      {
        // 11. Circle
        // R - 5, Fill green: -80
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 0,
          y: 0,
          radius: -5,
          stroke_width: 0,
          opacity: 0,
          fill: [0, -80, 0, 0],
        },
      },
      {
        // 12. Circle
        // X - 20
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: -20,
          y: 0,
          radius: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 13. Rectangle
        // X + 20, Stroke green: 125
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 20,
          y: 0,
          height: 0,
          width: 0,
          stroke_width: 0,
          opacity: 0,
          stroke: [0, 125, 0, 0],
        },
      },
      {
        // 14. Rectangle
        // H - 20
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 0,
          y: 0,
          height: -20,
          width: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 15. Rectangle
        // S_W + 2
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 0,
          y: 0,
          height: 0,
          width: 0,
          stroke_width: 2,
          opacity: 0,
        },
      },
      {
        // 16. Path
        // Fill red: -200 green: -200
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 0,
          opacity: 0,
          fill: [-200, -200, 0, 0],
        },
      },
      {
        // 17. Path
        // O - 0.3
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 0,
          opacity: -0.3,
        },
      },
      {
        // 18. Path
        // Point: Line X: 0 Y: -150
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 0,
          opacity: 0,
          points: [
            {
              type: SVGPathCommandType.LINE,
              x: 0,
              y: 150,
            },
          ],
        },
      },
      {
        // 19. Circle
        // S_W + 3, O - 0.2
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 0,
          y: 0,
          radius: 0,
          stroke_width: 3,
          opacity: -0.2,
        },
      },
      {
        // 20. Circle
        // Y + 10
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 0,
          y: 10,
          radius: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 21. Circle
        // Y - 200
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 0,
          y: -200,
          radius: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 22. Circle
        // R + 20, O - 0.1
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 0,
          y: 0,
          radius: 20,
          stroke_width: 0,
          opacity: -0.1,
        },
      },
      {
        // 23. Rectangle
        // X - 350, Y + 400
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: -350,
          y: 400,
          height: 0,
          width: 0,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 24. Rectangle
        // H + 50, W + 50
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 0,
          y: 0,
          height: 50,
          width: 50,
          stroke_width: 0,
          opacity: 0,
        },
      },
      {
        // 25. Rectangle
        // Fill blue: -75, Stroke red: 100
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 0,
          y: 0,
          height: 0,
          width: 0,
          stroke_width: 0,
          opacity: 0,
          fill: [0, 0, -75, 0],
          stroke: [100, 0, 0, 0],
        },
      },
      {
        // 26. Rectangle
        // S_W + 3, O - 0.3
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 0,
          y: 0,
          height: 0,
          width: 0,
          stroke_width: 3,
          opacity: -0.3,
        },
      },
      {
        // 27. Path
        // S_W + 6
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 6,
          opacity: 0,
        },
      },
      {
        // 28. Path
        // O - 0.1
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 0,
          opacity: -0.1,
        },
      },
      {
        // 29. Path
        // Point: Bezier X: -300 Y: 300
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 0,
          opacity: 0,
          points: [
            {
              type: SVGPathCommandType.BEZIER,
              x: -300,
              y: 300,
            },
          ],
        },
      },
      {
        // 30. Path
        // Point: Close X: 0 Y: 0
        element: BenchmarkElementType.PATH,
        edits: {
          stroke_width: 0,
          opacity: 0,
          points: [
            {
              type: SVGPathCommandType.CLOSE,
              x: 0,
              y: 0,
            },
          ],
        },
      },
    ],
  },
]
