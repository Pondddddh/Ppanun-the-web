CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_timestamp();

CREATE OR REPLACE FUNCTION update_user_stats_on_game()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_stats
  SET 
    total_games_played = total_games_played + 1,
    total_wins = total_wins + CASE WHEN NEW.result = 'win' THEN 1 ELSE 0 END,
    total_losses = total_losses + CASE WHEN NEW.result = 'loss' THEN 1 ELSE 0 END,
    total_wagered = total_wagered + NEW.bet_amount,
    total_won = total_won + CASE WHEN NEW.result = 'win' THEN NEW.payout ELSE 0 END,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.user_id;
  
  IF NEW.game_type = 'blackjack' THEN
    UPDATE user_stats
    SET 
      blackjack_played = blackjack_played + 1,
      blackjack_wins = blackjack_wins + CASE WHEN NEW.result = 'win' THEN 1 ELSE 0 END
    WHERE user_id = NEW.user_id;
  ELSIF NEW.game_type = 'roulette' THEN
    UPDATE user_stats
    SET 
      roulette_played = roulette_played + 1,
      roulette_wins = roulette_wins + CASE WHEN NEW.result = 'win' THEN 1 ELSE 0 END
    WHERE user_id = NEW.user_id;
  ELSIF NEW.game_type = 'poker' THEN
    UPDATE user_stats
    SET 
      poker_played = poker_played + 1,
      poker_wins = poker_wins + CASE WHEN NEW.result = 'win' THEN 1 ELSE 0 END
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stats_on_game
AFTER INSERT ON game_history
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_game();

-- Trigger to auto-grant badges based on achievements
CREATE OR REPLACE FUNCTION check_and_grant_badges()
RETURNS TRIGGER AS $$
DECLARE
  user_credits INTEGER;
  consecutive_wins INTEGER;
BEGIN
  IF NEW.result = 'win' AND NEW.total_wins = 1 THEN
    PERFORM grant_item_to_user(NEW.user_id, 'badge-winner');
  END IF;
  
  IF NEW.total_wagered >= 10000 THEN
    PERFORM grant_item_to_user(NEW.user_id, 'badge-highroller');
  END IF;
  
  IF NEW.blackjack_wins >= 100 THEN
    PERFORM grant_item_to_user(NEW.user_id, 'trophy-blackjack');
  END IF;
  
  IF NEW.roulette_wins >= 100 THEN
    PERFORM grant_item_to_user(NEW.user_id, 'trophy-roulette');
  END IF;
  
  IF NEW.poker_wins >= 100 THEN
    PERFORM grant_item_to_user(NEW.user_id, 'trophy-poker');
  END IF;
  
  SELECT credits INTO user_credits FROM users WHERE id = NEW.user_id;
  IF user_credits >= 50000 THEN
    PERFORM grant_item_to_user(NEW.user_id, 'cosmetic-vip');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_badges
AFTER UPDATE ON user_stats
FOR EACH ROW
EXECUTE FUNCTION check_and_grant_badges();

CREATE OR REPLACE FUNCTION create_user_stats_on_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_stats
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_user_stats_on_user_creation();

CREATE OR REPLACE FUNCTION validate_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.credits < 0 THEN
    RAISE EXCEPTION 'User credits cannot be negative';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_credits
BEFORE UPDATE ON users
FOR EACH ROW
WHEN (NEW.credits IS DISTINCT FROM OLD.credits)
EXECUTE FUNCTION validate_user_credits();
