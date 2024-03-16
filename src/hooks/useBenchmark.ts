import Circle from '@/components/atoms/Circle'
import Path from '@/components/atoms/Path'
import Rectangle from '@/components/atoms/Rectangle'
import CrdtClient, { convertUtility } from '@/components/molecules/Crdt'
import { EngineContext } from '@/components/molecules/RenderingEngine/type'
import {
  BenchmarkElementType,
  BenchmarkPresets,
  BenchmarkPresetType,
  CircleManipulations,
  PathManipulations,
  RectangleManipulations,
} from '@/config/BenchmarkPresets'

interface useBenchmark {
  client: CrdtClient
  context: EngineContext
}

const useBenchmark = ({ client, context }: useBenchmark) => {
  const clearCanvas = () => {
    const objects = convertUtility(client.children(), client, context)

    for (const element of objects) {
      client.removeObject(element.id)
    }

    console.log('Cleared canvas')
  }

  const getPresetByType = (size: BenchmarkPresetType) => {
    const preset = BenchmarkPresets.find((preset) => preset.size === size)

    if (!preset) {
      return {
        size: size,
        creation: {
          // Default values
          circle: 0,
          rectangle: 0,
          path: 0,
        },
        manipulation: [
          {
            element: BenchmarkElementType.CIRCLE,
            edits: {
              stroke_width: 0,
              opacity: 0,
            },
          },
        ],
      }
    }

    return preset
  }

  const benchmarkPreset = (size: BenchmarkPresetType) => {
    clearCanvas()

    const selectedPreset = getPresetByType(size)
    const startTime = performance.now()

    let x = 0
    let y = 0

    // Creation
    console.log('Creation start')

    for (const [key, value] of Object.entries(selectedPreset.creation)) {
      switch (key) {
        case 'circle':
          for (let index = 0; index < value; index++) {
            client.addCircle(undefined, { pos: { x: x, y: y }, radius: 25 })
            x += 150
          }
          break
        case 'rectangle':
          for (let index = 0; index < value; index++) {
            client.addRectangle(undefined, { pos: { x: x, y: y }, height: 50, width: 75 })
            x += 150
          }
          break
        case 'path':
          for (let index = 0; index < value; index++) {
            client.addPath(undefined, {
              points: [
                { type: 'START', pos: { x: x, y: y } },
                {
                  type: 'BEZIER',
                  pos: { x: 50 + x, y: 0 + y },
                  handle1: { x: 0 + x, y: -50 + y },
                  handle2: { x: 0 + x, y: -50 + y },
                },
                {
                  type: 'BEZIER_QUAD',
                  pos: { x: 0 + x, y: 50 + y },
                  handle: { x: 0 + x, y: 50 + y },
                },
              ],
            })
            x += 150
          }
      }

      x = 0
      y += 100
    }

    console.log('Creation end')

    // Manipulation
    console.log('Manipulation start')

    for (const procedure of selectedPreset.manipulation) {
      const objects = convertUtility(client.children(), client, context)

      switch (procedure.element) {
        case BenchmarkElementType.CIRCLE: {
          const edits = procedure.edits as CircleManipulations
          const circles = objects.filter((object): object is Circle => object instanceof Circle)

          for (const circle of circles) {
            client.editCircle(circle.id, {
              pos: { x: circle.pos.x() + edits.x, y: circle.pos.y() + edits.y },
              radius: circle.radius + edits.radius,
              stroke_width: circle.stroke_width + edits.stroke_width,
              opacity: circle.opacity + edits.opacity,
              fill: edits.fill
                ? [
                    circle.fill[0] + edits.fill[0],
                    circle.fill[1] + edits.fill[1],
                    circle.fill[2] + edits.fill[2],
                    circle.fill[3] + edits.fill[3],
                  ]
                : circle.fill,
              stroke: edits.stroke
                ? [
                    circle.stroke[0] + edits.stroke[0],
                    circle.stroke[1] + edits.stroke[1],
                    circle.stroke[2] + edits.stroke[2],
                    circle.stroke[3] + edits.stroke[3],
                  ]
                : circle.stroke,
            })
          }
          break
        }
        case BenchmarkElementType.RECTANGLE: {
          const edits = procedure.edits as RectangleManipulations
          const rectangles = objects.filter((object): object is Rectangle => object instanceof Rectangle)

          for (const rectangle of rectangles) {
            client.editRectangle(rectangle.id, {
              pos: { x: rectangle.pos.x() + edits.x, y: rectangle.pos.y() + edits.y },
              width: rectangle.width + edits.width,
              height: rectangle.height + edits.height,
              stroke_width: rectangle.stroke_width + edits.stroke_width,
              opacity: rectangle.opacity + edits.opacity,
              fill: edits.fill
                ? [
                    rectangle.fill[0] + edits.fill[0],
                    rectangle.fill[1] + edits.fill[1],
                    rectangle.fill[2] + edits.fill[2],
                    rectangle.fill[3] + edits.fill[3],
                  ]
                : rectangle.fill,
              stroke: edits.stroke
                ? [
                    rectangle.stroke[0] + edits.stroke[0],
                    rectangle.stroke[1] + edits.stroke[1],
                    rectangle.stroke[2] + edits.stroke[2],
                    rectangle.stroke[3] + edits.stroke[3],
                  ]
                : rectangle.stroke,
            })
          }
          break
        }
        case BenchmarkElementType.PATH: {
          const edits = procedure.edits as PathManipulations
          const paths = objects.filter((object): object is Path => object instanceof Path)

          for (const path of paths) {
            client.editPath(path.id, {
              stroke_width: path.stroke_width + edits.stroke_width,
              opacity: path.opacity + edits.opacity,
              fill: edits.fill
                ? [
                    path.fill[0] + edits.fill[0],
                    path.fill[1] + edits.fill[1],
                    path.fill[2] + edits.fill[2],
                    path.fill[3] + edits.fill[3],
                  ]
                : path.fill,
              stroke: edits.stroke
                ? [
                    path.stroke[0] + edits.stroke[0],
                    path.stroke[1] + edits.stroke[1],
                    path.stroke[2] + edits.stroke[2],
                    path.stroke[3] + edits.stroke[3],
                  ]
                : path.stroke,
            })

            if (edits.points) {
              for (const points of edits.points) {
                client.addPointToPath(path.id, points.type, { x: points.x, y: points.y })
              }
            }
          }
        }
      }
    }

    console.log('Manipulation end')

    const endTime = performance.now()
    const resultTime = endTime - startTime

    console.log(`Result time: ${resultTime} ms`)
  }

  return {
    clearCanvas,
    benchmarkPreset,
  }
}

export default useBenchmark
