-- Democlipse Game Database Schema

DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS rooms;

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    entry_code TEXT
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
    status TEXT,
    revealed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes (partial unique index for entry_code)
CREATE UNIQUE INDEX idx_room_entry_code
    ON rooms(entry_code)
    WHERE entry_code IS NOT NULL;

CREATE INDEX idx_games_room ON games(room_id);
CREATE INDEX idx_players_game ON players(game_id);
CREATE INDEX idx_players_user ON players(user_id);
