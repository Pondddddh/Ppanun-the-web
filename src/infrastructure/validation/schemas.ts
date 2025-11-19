import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6),
});

export const LoginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6),
});

export const PlaceBetSchema = z.object({
  userId: z.string().uuid(),
  gameType: z.enum(['blackjack', 'roulette', 'poker']),
  betAmount: z.number().positive(),
  outcome: z.enum(['win', 'loss', 'tie']),
  payout: z.number().min(0),
  details: z.record(z.any()),
});

export const GrantItemSchema = z.object({
  userId: z.string().uuid(),
  itemId: z.string().uuid(),
});
