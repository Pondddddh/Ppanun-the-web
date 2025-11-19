-- Create items table to define all available items in the game
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('badge', 'trophy', 'cosmetic', 'avatar', 'title')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_inventory table to track which items each user owns
CREATE TABLE IF NOT EXISTS user_inventory (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_id ON user_inventory(item_id);

-- Insert default items
INSERT INTO items (name, description, type, rarity, icon) VALUES
  ('Novice Player', 'Started your gambling journey', 'badge', 'common', '🎮'),
  ('First Win', 'Won your first game', 'badge', 'common', '🏆'),
  ('High Roller', 'Bet over 1000 credits in a single game', 'badge', 'rare', '💎'),
  ('Lucky Streak', 'Won 5 games in a row', 'badge', 'epic', '🍀'),
  ('Blackjack Master', 'Won 100 blackjack games', 'trophy', 'epic', '🃏'),
  ('Roulette Champion', 'Won 100 roulette games', 'trophy', 'epic', '🎰'),
  ('Poker Pro', 'Won 100 poker games', 'trophy', 'epic', '♠️'),
  ('VIP Badge', 'Exclusive VIP member badge', 'cosmetic', 'legendary', '⭐')
ON CONFLICT (name) DO NOTHING;

-- Grant novice badge to demo user
INSERT INTO user_inventory (user_id, item_id) 
SELECT u.id, i.id 
FROM users u, items i 
WHERE u.username = 'demo' AND i.name = 'Novice Player'
ON CONFLICT (user_id, item_id) DO NOTHING;
