'use server'

import { generateText } from 'ai'
import { type Player, type PokerCard, evaluateHand } from './poker'

interface PokerGameState {
  playerHand: PokerCard[]
  communityCards: PokerCard[]
  pot: number
  currentBet: number
  playerBet: number
  playerChips: number
}

export async function getAIPokerAction(gameState: PokerGameState): Promise<'fold' | 'call' | 'raise'> {
  try {
    const handEvaluation = evaluateHand(gameState.playerHand, gameState.communityCards)
    
    const prompt = `You are a professional poker player. Analyze this Texas Hold'em situation and decide whether to fold, call, or raise.

Your Hand: ${gameState.playerHand.map(c => `${c.rank}${c.suit}`).join(', ')}
Community Cards: ${gameState.communityCards.length > 0 ? gameState.communityCards.map(c => `${c.rank}${c.suit}`).join(', ') : 'None yet'}
Hand Strength: ${handEvaluation.description} (value: ${handEvaluation.value})

Current Pot: $${gameState.pot}
Current Bet: $${gameState.currentBet}
Your Current Bet: $${gameState.playerBet}
Your Chips: $${gameState.playerChips}
Amount to Call: $${gameState.currentBet - gameState.playerBet}

Consider:
- Hand strength and potential
- Pot odds (${gameState.currentBet > 0 ? ((gameState.currentBet - gameState.playerBet) / (gameState.pot + gameState.currentBet)).toFixed(2) : '0'})
- Position and betting round
- Stack size

Respond with ONLY one word: "fold", "call", or "raise"`

    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt,
      maxOutputTokens: 10,
      temperature: 0.7,
    })

    const decision = text.toLowerCase().trim()
    
    if (decision.includes('raise')) return 'raise'
    if (decision.includes('call')) return 'call'
    if (decision.includes('fold')) return 'fold'
    
    // Fallback to simple logic if AI response is unclear
    if (handEvaluation.value > 4000000) return 'raise'
    if (handEvaluation.value > 2000000) return 'call'
    return 'fold'
    
  } catch (error) {
    console.error('[v0] AI poker bot error:', error)
    // Fallback to simple logic on error
    const handEvaluation = evaluateHand(gameState.playerHand, gameState.communityCards)
    if (handEvaluation.value > 4000000) return 'raise'
    if (handEvaluation.value > 2000000) return 'call'
    return 'fold'
  }
}
