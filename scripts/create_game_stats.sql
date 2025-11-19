-- Create game_history table to track all games played
CREATE TABLE IF NOT EXISTS game_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('blackjack', 'roulette', 'poker')),
  bet_amount INTEGER NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'push')),
  payout INTEGER NOT NULL DEFAULT 0,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_stats table to track aggregate statistics
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_games_played INTEGER NOT NULL DEFAULT 0,
  total_wins INTEGER NOT NULL DEFAULT 0,
  total_losses INTEGER NOT NULL DEFAULT 0,
  total_wagered INTEGER NOT NULL DEFAULT 0,
  total_winnings INTEGER NOT NULL DEFAULT 0,
  blackjack_played INTEGER NOT NULL DEFAULT 0,
  blackjack_wins INTEGER NOT NULL DEFAULT 0,
  roulette_played INTEGER NOT NULL DEFAULT 0,
  roulette_wins INTEGER NOT NULL DEFAULT 0,
  poker_played INTEGER NOT NULL DEFAULT 0,
  poker_wins INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_game_history_user_id ON game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_game_history_game_type ON game_history(game_type);
CREATE INDEX IF NOT EXISTS idx_game_history_played_at ON game_history(played_at DESC);

-- Create stats using subquery to find user by username
INSERT INTO user_stats (user_id) 
SELECT id FROM users WHERE username = 'demo'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_stats (user_id) 
SELECT id FROM users WHERE username = 'admin'
ON CONFLICT (user_id) DO NOTHING;
