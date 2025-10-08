-- Democlipse Game Database Schema

-- Drop existing table if it exists (for development)
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS rooms;

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    entry_code TEXT, -- Nullable, 4 digits
    UNIQUE (entry_code) WHERE entry_code IS NOT NULL
);

CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id),
    variant TEXT NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    winner TEXT
);

CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT, -- null | ready | good | bad | joker
    revealed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_room_entry_code
    ON rooms(entry_code)
    WHERE entry_code IS NOT NULL                  -- Unique active codes

CREATE INDEX idx_games_room ON games(room_id)     -- Find games in room
CREATE INDEX idx_players_game ON players(game_id) -- Find players in game
CREATE INDEX idx_players_user ON players(user_id) -- User stats