type SchemaDatabase = {
  exec(sql: string): Promise<unknown> | unknown;
};

export async function initializeSchema(db: SchemaDatabase, usePostgres: boolean) {
  const idType = usePostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  const timestampType = usePostgres ? 'TIMESTAMP WITH TIME ZONE' : 'TEXT';
  const timestampDefault = usePostgres ? 'DEFAULT CURRENT_TIMESTAMP' : "DEFAULT (datetime('now'))";

  if (!usePostgres) {
    await db.exec('PRAGMA journal_mode = WAL');
    await db.exec('PRAGMA foreign_keys = ON');
  }

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id              ${idType},
      email           TEXT    NOT NULL UNIQUE,
      password_hash   TEXT    NOT NULL,
      first_name      TEXT    NOT NULL,
      last_name       TEXT    NOT NULL,
      headline        TEXT    DEFAULT '',
      bio             TEXT    DEFAULT '',
      location        TEXT    DEFAULT '',
      profile_photo   TEXT    DEFAULT '',
      cover_photo     TEXT    DEFAULT '',
      phone           TEXT    DEFAULT '',
      website         TEXT    DEFAULT '',
      youtube_url     TEXT    DEFAULT '',
      soundcloud_url  TEXT    DEFAULT '',
      spotify_url     TEXT    DEFAULT '',
      instagram_url   TEXT    DEFAULT '',
      availability    TEXT    DEFAULT 'available',
      account_type    TEXT    DEFAULT 'musician',
      created_at      ${timestampType} ${timestampDefault},
      updated_at      ${timestampType} ${timestampDefault}
    )`,
    `CREATE TABLE IF NOT EXISTS skills (
      id    ${idType},
      name  TEXT    NOT NULL UNIQUE
    )`,
    `CREATE TABLE IF NOT EXISTS user_skills (
      user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skill_id  INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, skill_id)
    )`,
    `CREATE TABLE IF NOT EXISTS genres (
      id    ${idType},
      name  TEXT    NOT NULL UNIQUE
    )`,
    `CREATE TABLE IF NOT EXISTS user_genres (
      user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      genre_id  INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, genre_id)
    )`,
    `CREATE TABLE IF NOT EXISTS experiences (
      id          ${idType},
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title       TEXT    NOT NULL,
      organization TEXT   DEFAULT '',
      location    TEXT    DEFAULT '',
      start_date  TEXT    NOT NULL,
      end_date    TEXT    DEFAULT '',
      description TEXT    DEFAULT '',
      created_at  ${timestampType} ${timestampDefault}
    )`,
    `CREATE TABLE IF NOT EXISTS gigs (
      id              ${idType},
      poster_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title           TEXT    NOT NULL,
      description     TEXT    NOT NULL,
      venue           TEXT    DEFAULT '',
      location        TEXT    NOT NULL,
      gig_date        TEXT    NOT NULL,
      gig_time        TEXT    DEFAULT '',
      pay_min         REAL    DEFAULT 0,
      pay_max         REAL    DEFAULT 0,
      pay_type        TEXT    DEFAULT 'fixed',
      genre           TEXT    DEFAULT '',
      skills_needed   TEXT    DEFAULT '',
      status          TEXT    DEFAULT 'open',
      applications    INTEGER DEFAULT 0,
      created_at      ${timestampType} ${timestampDefault},
      updated_at      ${timestampType} ${timestampDefault}
    )`,
    `CREATE TABLE IF NOT EXISTS gig_applications (
      id          ${idType},
      gig_id      INTEGER NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message     TEXT    DEFAULT '',
      status      TEXT    DEFAULT 'pending',
      created_at  ${timestampType} ${timestampDefault},
      UNIQUE(gig_id, user_id)
    )`,
    `CREATE TABLE IF NOT EXISTS posts (
      id          ${idType},
      author_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content     TEXT    NOT NULL,
      post_type   TEXT    DEFAULT 'text',
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at  ${timestampType} ${timestampDefault}
    )`,
    `CREATE TABLE IF NOT EXISTS post_likes (
      user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id   INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      created_at ${timestampType} ${timestampDefault},
      PRIMARY KEY (user_id, post_id)
    )`,
    `CREATE TABLE IF NOT EXISTS comments (
      id          ${idType},
      post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      author_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content     TEXT    NOT NULL,
      created_at  ${timestampType} ${timestampDefault}
    )`,
    `CREATE TABLE IF NOT EXISTS connections (
      id            ${idType},
      requester_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipient_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status        TEXT    DEFAULT 'pending',
      created_at    ${timestampType} ${timestampDefault},
      updated_at    ${timestampType} ${timestampDefault},
      UNIQUE(requester_id, recipient_id)
    )`,
    `CREATE TABLE IF NOT EXISTS conversations (
      id          ${idType},
      user1_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user2_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      last_message_at ${timestampType} ${timestampDefault},
      created_at  ${timestampType} ${timestampDefault},
      UNIQUE(user1_id, user2_id)
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id              ${idType},
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content         TEXT    NOT NULL,
      read            INTEGER DEFAULT 0,
      created_at      ${timestampType} ${timestampDefault}
    )`,
    `CREATE INDEX IF NOT EXISTS idx_gigs_location ON gigs(location)`,
    `CREATE INDEX IF NOT EXISTS idx_gigs_genre ON gigs(genre)`,
    `CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status)`,
    `CREATE INDEX IF NOT EXISTS idx_gigs_date ON gigs(gig_date)`,
    `CREATE INDEX IF NOT EXISTS idx_gigs_poster ON gigs(poster_id)`,
    `CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id)`,
    `CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id)`,
    `CREATE INDEX IF NOT EXISTS idx_connections_recipient ON connections(recipient_id)`,
    `CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status)`,
    `CREATE INDEX IF NOT EXISTS idx_gig_applications_gig ON gig_applications(gig_id)`,
    `CREATE INDEX IF NOT EXISTS idx_gig_applications_user ON gig_applications(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_genres_user ON user_genres(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_experiences_user ON experiences(user_id)`
  ];

  for (const statement of statements) {
    if (statement.trim()) {
      await db.exec(statement);
    }
  }
}
