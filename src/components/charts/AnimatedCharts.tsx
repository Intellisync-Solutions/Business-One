import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Sector
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

interface AnimatedChartProps {
  data: any[]
  type: 'line' | 'bar' | 'pie' | 'radar'
  height?: number
}

const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <text x={cx} y={cy} dy={-4} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#999">
        {`${(percent * 100).toFixed(2)}%`}
      </text>
    </g>
  )
}

export function AnimatedChart({ data, type, height = 400 }: AnimatedChartProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [animatedData, setAnimatedData] = useState<any[]>([])

  useEffect(() => {
    // Animate data loading
    const timer = setTimeout(() => {
      setAnimatedData(data)
    }, 300)

    return () => clearTimeout(timer)
  }, [data])

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={type}
        variants={chartVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ width: '100%', height }}
      >
        <ResponsiveContainer>
          <>
            {type === 'line' && (
              <LineChart data={animatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(animatedData[0] || {})
                  .filter(key => key !== 'name')
                  .map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={COLORS[index % COLORS.length]}
                      activeDot={{ r: 8 }}
                    />
                  ))}
              </LineChart>
            )}
            {type === 'bar' && (
              <BarChart data={animatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(animatedData[0] || {})
                  .filter(key => key !== 'name')
                  .map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={COLORS[index % COLORS.length]}
                      animationDuration={1500}
                      animationBegin={300 * index}
                    >
                      {animatedData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  ))}
              </BarChart>
            )}
            {type === 'pie' && (
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={animatedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  animationDuration={1500}
                  animationBegin={300}
                >
                  {animatedData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
            {type === 'radar' && (
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={animatedData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                {Object.keys(animatedData[0] || {})
                  .filter(key => key !== 'name')
                  .map((key, index) => (
                    <Radar
                      key={key}
                      name={key}
                      dataKey={key}
                      stroke={COLORS[index % COLORS.length]}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.6}
                      animationDuration={1500}
                      animationBegin={300 * index}
                    />
                  ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            )}
          </>
        </ResponsiveContainer>
      </motion.div>
    </AnimatePresence>
  )
}
