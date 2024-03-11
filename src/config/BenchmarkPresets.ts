import { Color, SVGPathCommandType } from '@inktor/inktor-crdt-rs'

export enum BenchmarkPresetType {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

export enum BenchmarkElementType {
  CIRCLE = 0,
  RECTANGLE = 1,
  PATH = 2,
}

interface DefaultManipulations {
  stroke_width: number
  opacity: number
  fill: Color
  stroke: Color
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
  points: {
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
      circle: 50,
      rectangle: 100,
      path: 20,
    },
    manipulation: [
      {
        // Sample full element edit
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 50,
          y: -20,
          radius: 10,
          stroke_width: 5,
          opacity: -0.5,
          fill: [-200, 255, 255, 1],
          stroke: [0, 0, 0, 1],
        },
      },
      {
        // Sample partial element edit
        element: BenchmarkElementType.CIRCLE,
        edits: { x: 10, y: 0, radius: 0, stroke_width: 0, opacity: 0, fill: [0, 0, 0, 0], stroke: [0, 0, 0, 0] },
      },
      {
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 10,
          y: 0,
          height: 20,
          width: 30,
          stroke_width: 0,
          opacity: -0.3,
          fill: [-200, 0, 0, 0],
          stroke: [0, 0, 0, 0],
        },
      },
      {
        element: BenchmarkElementType.PATH,
        edits: {
          points: [
            { type: SVGPathCommandType.START, x: 10, y: 0 },
            {
              type: SVGPathCommandType.BEZIER,
              x: 50,
              y: 0,
              handle1: {
                x: 0,
                y: -50,
              },
              handle2: {
                x: 0,
                y: -50,
              },
            },
            {
              type: SVGPathCommandType.BEZIER_QUAD,
              x: 0,
              y: 50,
              handle1: {
                x: 0,
                y: 50,
              },
              handle2: {
                x: 0,
                y: 0,
              },
            },
          ],
          stroke_width: 0,
          opacity: 0,
          fill: [0, 0, 0, 0],
          stroke: [0, 0, 0, 0],
        },
      },
    ],
  },
  {
    size: BenchmarkPresetType.M,
    creation: {
      circle: 100,
      rectangle: 200,
      path: 40,
    },
    manipulation: [
      {
        // Sample full element edit
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 50,
          y: -20,
          radius: 10,
          stroke_width: 5,
          opacity: -0.5,
          fill: [1, 255, 255, 1],
          stroke: [0, 0, 0, 1],
        },
      },
      {
        // Sample partial element edit
        element: BenchmarkElementType.CIRCLE,
        edits: { x: 10, y: 0, radius: 0, stroke_width: 0, opacity: 0, fill: [0, 0, 0, 0], stroke: [0, 0, 0, 0] },
      },
      {
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 10,
          y: 0,
          height: 20,
          width: 30,
          stroke_width: 0,
          opacity: -0.3,
          fill: [0, 0, 0, 0],
          stroke: [0, 0, 0, 0],
        },
      },
      {
        element: BenchmarkElementType.PATH,
        edits: {
          points: [
            { type: SVGPathCommandType.START, x: 10, y: 0 },
            {
              type: SVGPathCommandType.BEZIER,
              x: 50,
              y: 0,
              handle1: {
                x: 0,
                y: -50,
              },
              handle2: {
                x: 0,
                y: -50,
              },
            },
            {
              type: SVGPathCommandType.BEZIER_QUAD,
              x: 0,
              y: 50,
              handle1: {
                x: 0,
                y: 50,
              },
              handle2: {
                x: 0,
                y: 0,
              },
            },
          ],
          stroke_width: 0,
          opacity: 0,
          fill: [0, 0, 0, 0],
          stroke: [0, 0, 0, 0],
        },
      },
    ],
  },
  {
    size: BenchmarkPresetType.L,
    creation: {
      circle: 200,
      rectangle: 400,
      path: 80,
    },
    manipulation: [
      {
        // Sample full element edit
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 50,
          y: -20,
          radius: 10,
          stroke_width: 5,
          opacity: -0.5,
          fill: [-100, 255, 255, 1],
          stroke: [0, 0, 0, 1],
        },
      },
      {
        // Sample partial element edit
        element: BenchmarkElementType.CIRCLE,
        edits: { x: 10, y: 0, radius: 0, stroke_width: 0, opacity: 0, fill: [0, 0, 0, 0], stroke: [0, 0, 0, 0] },
      },
      {
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 10,
          y: 0,
          height: 20,
          width: 30,
          stroke_width: 0,
          opacity: -0.3,
          fill: [0, 0, 0, 0],
          stroke: [0, 0, 0, 0],
        },
      },
      {
        element: BenchmarkElementType.PATH,
        edits: {
          points: [
            { type: SVGPathCommandType.START, x: 10, y: 0 },
            {
              type: SVGPathCommandType.BEZIER,
              x: 50,
              y: 0,
              handle1: {
                x: 0,
                y: -50,
              },
              handle2: {
                x: 0,
                y: -50,
              },
            },
            {
              type: SVGPathCommandType.BEZIER_QUAD,
              x: 0,
              y: 50,
              handle1: {
                x: 0,
                y: 50,
              },
              handle2: {
                x: 0,
                y: 0,
              },
            },
          ],
          stroke_width: 0,
          opacity: 0,
          fill: [0, 0, 0, 0],
          stroke: [0, 0, 0, 0],
        },
      },
    ],
  },
  {
    size: BenchmarkPresetType.XL,
    creation: {
      circle: 400,
      rectangle: 800,
      path: 160,
    },

    manipulation: [
      {
        // Sample full element edit
        element: BenchmarkElementType.CIRCLE,
        edits: {
          x: 50,
          y: -20,
          radius: 10,
          stroke_width: 5,
          opacity: -0.5,
          fill: [1, 255, 255, 1],
          stroke: [0, 0, 0, 1],
        },
      },
      {
        // Sample partial element edit
        element: BenchmarkElementType.CIRCLE,
        edits: { x: 10, y: 0, radius: 0, stroke_width: 0, opacity: 0, fill: [0, 0, 0, 0], stroke: [0, 0, 0, 0] },
      },
      {
        element: BenchmarkElementType.RECTANGLE,
        edits: {
          x: 10,
          y: 0,
          height: 20,
          width: 30,
          stroke_width: 0,
          opacity: -0.3,
          fill: [0, 0, 0, 0],
          stroke: [0, 0, 0, 0],
        },
      },
      {
        element: BenchmarkElementType.PATH,
        edits: {
          points: [
            { type: SVGPathCommandType.START, x: 10, y: 0 },
            {
              type: SVGPathCommandType.BEZIER,
              x: 50,
              y: 0,
              handle1: {
                x: 0,
                y: -50,
              },
              handle2: {
                x: 0,
                y: -50,
              },
            },
            {
              type: SVGPathCommandType.BEZIER_QUAD,
              x: 0,
              y: 50,
              handle1: {
                x: 0,
                y: 50,
              },
              handle2: {
                x: 0,
                y: 0,
              },
            },
          ],
          stroke_width: 0,
          opacity: 0,
          fill: [0, 0, 0, 0],
          stroke: [0, 0, 0, 0],
        },
      },
    ],
  },
]
