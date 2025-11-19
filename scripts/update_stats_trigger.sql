-- Drop old trigger and function
DROP TRIGGER IF EXISTS trigger_update_game_stats ON game_history;
DROP TRIGGER IF EXISTS trigger_update_stats_on_game ON game_history;
DROP FUNCTION IF EXISTS update_game_stats();
DROP FUNCTION IF EXISTS update_user_stats_on_game();

-- Create new trigger function that matches current schema
CREATE OR REPLACE FUNCTION update_game_stats() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE user_stats
    SET 
      total_games_played = total_games_played + 1,
      total_wins = total_wins + CASE WHEN NEW.outcome = 'win' THEN 1 ELSE 0 END,
      total_losses = total_losses + CASE WHEN NEW.outcome = 'loss' THEN 1 ELSE 0 END,
      total_wagered = total_wagered + NEW.bet_amount,
      total_winnings = total_winnings + NEW.payout,
      -- Changed column names from *_played to *_games to match actual schema
      blackjack_games = blackjack_games + CASE WHEN NEW.game_type = 'blackjack' THEN 1 ELSE 0 END,
      blackjack_wins = blackjack_wins + CASE WHEN NEW.game_type = 'blackjack' AND NEW.outcome = 'win' THEN 1 ELSE 0 END,
      roulette_games = roulette_games + CASE WHEN NEW.game_type = 'roulette' THEN 1 ELSE 0 END,
      roulette_wins = roulette_wins + CASE WHEN NEW.game_type = 'roulette' AND NEW.outcome = 'win' THEN 1 ELSE 0 END,
      poker_games = poker_games + CASE WHEN NEW.game_type = 'poker' THEN 1 ELSE 0 END,
      poker_wins = poker_wins + CASE WHEN NEW.game_type = 'poker' AND NEW.outcome = 'win' THEN 1 ELSE 0 END,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_game_stats
AFTER INSERT ON game_history
FOR EACH ROW
EXECUTE FUNCTION update_game_stats();
