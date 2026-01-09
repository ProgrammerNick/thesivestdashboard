import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { HeroChart } from './HeroChart'
import { PORTFOLIOS, ALL_DATA_SETS } from '../lib/chartData'
import { MiniChart } from './MiniChart'
import { cn } from '../lib/utils'
import { useMediaQuery } from '../hooks/useMediaQuery'

interface PortfolioDeckProps {
    isFanned?: boolean
}

export function PortfolioDeck({ isFanned = false }: PortfolioDeckProps) {
    // Default to null so it stays fanned until a chart is selected
    const [activeId, setActiveId] = useState<string | null>(null)
    const isMobile = useMediaQuery('(max-width: 768px)')

    // If the logo is hovered (isFanned=true), we reset to the "Menu" state (activeId=null).
    // This allows the fan to persist even after the user stops hovering the logo.
    useEffect(() => {
        if (isFanned) {
            setActiveId(null)
        }
    }, [isFanned])

    // Logic: Fan out if explicitly triggered (logo hover) OR if no chart is selected yet.
    const showFan = isFanned || activeId === null

    return (
        <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center perspective-1000">
            <AnimatePresence>
                {PORTFOLIOS.map((portfolio, index) => {
                    const isActive = portfolio.id === activeId

                    // --- Geometry Config ---
                    const totalItems = PORTFOLIOS.length

                    // Fan Geometry: Full 360 Circle (desktop) / Reduced for mobile
                    const spreadAngle = 2 * Math.PI
                    const startAngle = -Math.PI / 2 // Start at top
                    const step = spreadAngle / totalItems

                    const angle = startAngle + (index * step)
                    // Responsive radius: smaller on mobile to prevent overflow
                    const radius = isMobile ? 90 : 140
                    const fannedX = Math.cos(angle) * radius
                    const fannedY = Math.sin(angle) * radius // Circular (no squash)

                    // Stack Geometry (Peeking Cards)
                    const stackX = (index + 1) * 10
                    const stackY = (index + 1) * 5
                    const stackRotate = (index + 1) * 5

                    // Hero Logic
                    const isHero = isActive && !showFan

                    // Animation Stagger
                    // If returning to stack (showFan false), delay 0.
                    // If fanning out (showFan true), stagger.
                    // If active, it moves immediately (0). Others stagger.
                    const delay = showFan
                        ? (isActive ? 0 : 0.05 + (index * 0.03))
                        : 0

                    // Z-Index config
                    // Hero always on top (100).
                    // Fanned: 40-50 range?
                    // Stacked: 10-index.
                    // When fanned, we want them to layer nicely.
                    // But if no activeId, they are all equal? No, index z-ordering is fine for fan overlap.

                    return (
                        <motion.div
                            key={portfolio.id}
                            layoutId={portfolio.id}
                            className={cn(
                                "absolute bg-card font-sans overflow-hidden shadow-2xl border",
                                isHero
                                    ? "rounded-xl bg-background/50 backdrop-blur border-border"
                                    : cn(
                                        "rounded-xl cursor-pointer hover:ring-2 hover:ring-primary z-50 transition-shadow",
                                        portfolio.id === 'thesivest' ? "border-secondary ring-1 ring-secondary shadow-secondary/20" : "border-border"
                                    )
                            )}
                            style={{
                                zIndex: isHero ? 100 : (showFan ? 50 - index : 10 - index),
                                transformOrigin: "center center"
                            }}
                            initial={false}
                            animate={{
                                // Position
                                x: isHero ? 0 : (showFan ? fannedX : stackX),
                                y: isHero ? 0 : (showFan ? fannedY : stackY),
                                // Dimension - smaller on mobile
                                width: isHero ? "calc(100% - 32px)" : (isMobile ? 280 : 310),
                                height: isHero ? "calc(100% - 32px)" : (isMobile ? 180 : 200),
                                // Scale & Rotate
                                scale: 1,
                                rotate: isHero ? 0 : (showFan ? 0 : stackRotate),
                                // Opacity
                                opacity: 1
                            }}
                            transition={{
                                type: "spring",
                                stiffness: isHero ? 120 : 160,
                                damping: isHero ? 20 : 25,
                                mass: isMobile ? 0.8 : 1, // Lighter mass for faster animations on mobile
                                delay: isMobile ? Math.min(delay as number, 0.1) : delay // Reduce stagger on mobile
                            }}
                            onClick={(e) => {
                                if (isHero) return
                                e.stopPropagation()
                                setActiveId(portfolio.id)
                            }}
                            whileHover={!isHero ? { scale: 1.05, zIndex: 60 } : {}}
                        >
                            {/* Inner Content */}
                            <div className="w-full h-full relative flex flex-col">
                                {!isHero && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="px-3 py-2 border-b border-border/50 flex justify-between items-center bg-muted/20 shrink-0"
                                    >
                                        <span className={cn(
                                            "font-bold text-sm truncate max-w-[140px]",
                                            portfolio.id === 'thesivest' ? "text-secondary" : "text-foreground"
                                        )}>{portfolio.name}</span>
                                        {portfolio.id === 'thesivest' && (
                                            <div className="flex gap-2">
                                                <span className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded border border-secondary/20 whitespace-nowrap font-medium tabular-nums">
                                                    α {portfolio.stats?.alpha}
                                                </span>
                                            </div>
                                        )}

                                    </motion.div>
                                )}

                                <div className="flex-1 w-full relative min-h-0">
                                    {/* Context Label - Shown in mini charts only */}
                                    {!isHero && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute top-10 left-3 right-3 flex justify-between items-center z-20 pointer-events-none"
                                        >
                                            {/* Stats Row */}
                                            <div className="flex gap-2 w-full">
                                                <div className="bg-background/80 backdrop-blur px-2 py-1 rounded border border-border/50 text-[10px] text-muted-foreground flex-1 text-center">
                                                    <div className="text-[8px] uppercase tracking-wider text-muted-foreground/70">Beta</div>
                                                    <div className="font-medium tabular-nums text-foreground">{portfolio.stats?.beta}</div>
                                                </div>
                                                <div className="bg-background/80 backdrop-blur px-2 py-1 rounded border border-border/50 text-[10px] text-muted-foreground flex-1 text-center">
                                                    <div className="text-[8px] uppercase tracking-wider text-muted-foreground/70">Return</div>
                                                    <div className={`font-medium tabular-nums ${portfolio.stats?.return.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                                        {portfolio.stats?.return}
                                                    </div>
                                                </div>
                                            </div>

                                        </motion.div>
                                    )}

                                    <AnimatePresence mode="popLayout">
                                        {isHero ? (
                                            <>
                                                <motion.div
                                                    key="hero-chart"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                                                    className="absolute inset-0 w-full h-full z-10"
                                                >
                                                    <HeroChart
                                                        portfolioId={portfolio.id}
                                                        data={ALL_DATA_SETS[portfolio.id]['3Y']}
                                                        className="rounded-none border-0 shadow-none h-full"
                                                    />

                                                    {/* Close Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setActiveId(null)
                                                        }}
                                                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/50 backdrop-blur hover:bg-muted/80 transition-colors border border-border/50 text-foreground cursor-pointer"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </motion.div>
                                                <motion.div
                                                    key="hero-loading"
                                                    initial={{ opacity: 1 }}
                                                    animate={{ opacity: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                                                    className="absolute inset-0 w-full h-full bg-background z-20 pointer-events-none"
                                                />
                                            </>
                                        ) : (
                                            <motion.div
                                                key="mini"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute inset-0 w-full h-full z-10"
                                            >
                                                <MiniChart portfolioId={portfolio.id} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {!isHero && (
                                    <div className="absolute inset-0 hover:bg-primary/5 transition-colors pointer-events-none" />
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>

            {/* Instruction Hint - Only show if NO active ID (initial state) */}
            <AnimatePresence>
                {activeId === null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sm font-bold text-primary bg-background/80 px-4 py-2 rounded-full border border-primary/20 backdrop-blur z-0 shadow-lg"
                    >
                        Select a Portfolio to Begin
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
