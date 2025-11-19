-- Stored Procedures for User Management

-- Updated all TEXT parameter types to UUID
-- Procedure to create a new user
CREATE OR REPLACE FUNCTION create_user(
  p_username TEXT,
  p_email TEXT,
  p_password_hash TEXT,
  p_role TEXT DEFAULT 'user'
)
RETURNS TABLE(user_id UUID, username TEXT, email TEXT, role TEXT, credits INTEGER) AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO users (username, email, password_hash, role, credits)
  VALUES (p_username, p_email, p_password_hash, p_role, 1000)
  RETURNING id INTO new_user_id;
  
  -- Automatically create user stats entry
  INSERT INTO user_stats (user_id) VALUES (new_user_id);
  
  -- Grant novice badge
  INSERT INTO user_inventory (user_id, item_id) 
  SELECT new_user_id, i.id FROM items i WHERE i.name = 'Novice Player'
  ON CONFLICT (user_id, item_id) DO NOTHING;
  
  RETURN QUERY SELECT id, users.username, users.email, users.role, users.credits FROM users WHERE id = new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Updated parameter type from TEXT to UUID
-- Procedure to update user credits
CREATE OR REPLACE FUNCTION update_user_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  new_credits INTEGER;
BEGIN
  UPDATE users 
  SET credits = credits + p_amount,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_user_id
  RETURNING credits INTO new_credits;
  
  RETURN new_credits;
END;
$$ LANGUAGE plpgsql;

-- Fixed record_game_result to match game_history schema and return UUID
-- Procedure to record a game result
CREATE OR REPLACE FUNCTION record_game_result(
  p_user_id UUID,
  p_game_type TEXT,
  p_bet_amount INTEGER,
  p_result TEXT,
  p_payout INTEGER
)
RETURNS UUID AS $$
DECLARE
  game_uuid UUID;
  v_outcome TEXT;
BEGIN
  -- Determine outcome based on payout vs bet
  v_outcome := CASE 
    WHEN p_payout > p_bet_amount THEN 'win'
    WHEN p_payout < p_bet_amount THEN 'loss'
    ELSE 'tie'
  END;
  
  -- Insert game history (note: using 'outcome' not 'result')
  INSERT INTO game_history (user_id, game_type, bet_amount, outcome, payout)
  VALUES (p_user_id, p_game_type, p_bet_amount, v_outcome, p_payout)
  RETURNING id INTO game_uuid;
  
  -- Update user credits (deduct bet, add payout)
  PERFORM update_user_credits(p_user_id, p_payout - p_bet_amount);
  
  RETURN game_uuid;
END;
$$ LANGUAGE plpgsql;

-- Updated parameter types from TEXT to UUID
-- Procedure to grant item to user
CREATE OR REPLACE FUNCTION grant_item_to_user(
  p_user_id UUID,
  p_item_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO user_inventory (user_id, item_id)
  VALUES (p_user_id, p_item_id)
  ON CONFLICT (user_id, item_id) DO NOTHING;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Updated parameter types from TEXT to UUID
-- Procedure to remove item from user
CREATE OR REPLACE FUNCTION remove_item_from_user(
  p_user_id UUID,
  p_item_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM user_inventory
  WHERE user_id = p_user_id AND item_id = p_item_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Updated parameter type from TEXT to UUID
-- Function to check if user can afford bet
CREATE OR REPLACE FUNCTION can_afford_bet(
  p_user_id UUID,
  p_bet_amount INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  user_credits INTEGER;
BEGIN
  SELECT credits INTO user_credits FROM users WHERE id = p_user_id;
  RETURN user_credits >= p_bet_amount;
END;
$$ LANGUAGE plpgsql;

-- Updated parameter type from TEXT to UUID
-- Function to get user win rate
CREATE OR REPLACE FUNCTION get_user_win_rate(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_games INTEGER;
  total_wins INTEGER;
BEGIN
  SELECT total_games_played, total_wins INTO total_games, total_wins
  FROM user_stats WHERE user_id = p_user_id;
  
  IF total_games = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((total_wins::NUMERIC / total_games::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;
