"use client"

import { useEffect, useState } from "react"
import { rouletteNumbers } from "@/lib/roulette"

interface RouletteWheelProps {
  result: number | null
  isSpinning: boolean
}

export function RouletteWheel({ result, isSpinning }: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (isSpinning && result !== null) {
      const resultIndex = rouletteNumbers.findIndex((n) => n.number === result)
      const degreesPerSlot = 360 / rouletteNumbers.length
      const targetRotation = 360 * 5 + resultIndex * degreesPerSlot
      setRotation(targetRotation)
    }
  }, [isSpinning, result])

  return (
    <div className="relative w-64 h-64 mx-auto">
      <div className="absolute inset-0 rounded-full bg-linear-to-br from-amber-700 to-amber-900 shadow-2xl flex items-center justify-center">
        <div
          className="w-56 h-56 rounded-full relative transition-transform duration-4000ms ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            background:
              "conic-gradient(from 0deg, " +
              rouletteNumbers
                .map((n, i) => {
                  const start = (i / rouletteNumbers.length) * 360
                  const end = ((i + 1) / rouletteNumbers.length) * 360
                  const color = n.color === "green" ? "#059669" : n.color === "red" ? "#dc2626" : "#1f2937"
                  return `${color} ${start}deg ${end}deg`
                })
                .join(", ") +
              ")",
          }}
        >
          {rouletteNumbers.map((n, i) => {
            const angle = (i / rouletteNumbers.length) * 360
            return (
              <div
                key={i}
                className="absolute text-white text-xs font-bold"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${angle}deg) translateY(-100px)`,
                  transformOrigin: "center",
                }}
              >
                <span style={{ transform: "rotate(90deg)", display: "inline-block" }}>{n.number}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-yellow-400 z-10" />

      {result !== null && !isSpinning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold">{result}</span>
          </div>
        </div>
      )}
    </div>
  )
}
