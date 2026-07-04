import bcrypt from 'bcryptjs';

type SeedRunResult = {
  lastInsertRowid?: number | bigint;
  rows?: unknown[];
  rowCount?: number | null;
};

type SeedStatement = {
  run(...params: unknown[]): Promise<SeedRunResult> | SeedRunResult;
};

type SeedDatabase = {
  exec(sql: string): Promise<unknown> | unknown;
  transaction(fn: (db: SeedDatabase) => Promise<void> | void): Promise<void> | void;
  prepare(query: string): SeedStatement;
};

export async function seedDatabase(db: SeedDatabase) {
  const hash = bcrypt.hashSync('password123', 10);

  await db.transaction(async () => {
    const deleteStatements = [
      'DELETE FROM messages',
      'DELETE FROM conversations',
      'DELETE FROM post_likes',
      'DELETE FROM comments',
      'DELETE FROM posts',
      'DELETE FROM gig_applications',
      'DELETE FROM gigs',
      'DELETE FROM connections',
      'DELETE FROM experiences',
      'DELETE FROM user_genres',
      'DELETE FROM user_skills',
      'DELETE FROM genres',
      'DELETE FROM skills',
      'DELETE FROM users',
    ];

    for (const sql of deleteStatements) {
      await db.exec(sql);
    }

    const skillNames = ['Guitar', 'Bass', 'Drums', 'Vocals', 'Keyboard', 'DJ', 'Violin', 'Dance', 'Saxophone', 'Trumpet'];
    for (const name of skillNames) {
      await db.prepare('INSERT INTO skills (name) VALUES (?)').run(name);
    }

    const genreNames = ['Jazz', 'Rock', 'Pop', 'Hip-Hop', 'Classical', 'Electronic', 'Country', 'R&B', 'Blues', 'Latin'];
    for (const name of genreNames) {
      await db.prepare('INSERT INTO genres (name) VALUES (?)').run(name);
    }

    const users = [
      { email: 'marcus.johnson@email.com', fn: 'Marcus', ln: 'Johnson', headline: 'Jazz Guitarist | Session Musician', bio: 'Professional jazz guitarist with 15 years of experience. Available for studio sessions, live performances, and teaching.', location: 'Nashville, TN', type: 'musician', avail: 'available' },
      { email: 'sarah.chen@email.com', fn: 'Sarah', ln: 'Chen', headline: 'Vocalist & Songwriter', bio: 'Singer-songwriter specializing in pop and R&B. Grammy-nominated for Best New Artist.', location: 'Los Angeles, CA', type: 'musician', avail: 'available' },
      { email: 'james.williams@email.com', fn: 'James', ln: 'Williams', headline: 'Professional Drummer | Music Producer', bio: 'Touring drummer with experience in rock, jazz, and blues. Also produce tracks in my home studio.', location: 'Austin, TX', type: 'musician', avail: 'available' },
      { email: 'elena.rodriguez@email.com', fn: 'Elena', ln: 'Rodriguez', headline: 'Classical Violinist | Orchestra Member', bio: 'First violin with the Nashville Symphony. Available for private events and recording sessions.', location: 'Nashville, TN', type: 'musician', avail: 'busy' },
      { email: 'mike.taylor@email.com', fn: 'Mike', ln: 'Taylor', headline: 'DJ & Electronic Music Producer', bio: 'Resident DJ at Club Neon. Specializing in electronic, house, and EDM. Available for events and festivals.', location: 'Miami, FL', type: 'musician', avail: 'available' },
      { email: 'lisa.park@email.com', fn: 'Lisa', ln: 'Park', headline: 'Professional Dancer & Choreographer', bio: 'Contemporary and hip-hop dancer with 10 years of performance experience. Choreography for music videos and live shows.', location: 'New York, NY', type: 'musician', avail: 'available' },
      { email: 'david.brown@email.com', fn: 'David', ln: 'Brown', headline: 'Bass Player | Studio Musician', bio: 'Versatile bass player comfortable in jazz, funk, rock, and country. Let me lay down the groove for your project.', location: 'Nashville, TN', type: 'musician', avail: 'available' },
      { email: 'amy.foster@email.com', fn: 'Amy', ln: 'Foster', headline: 'Keyboard Player | Music Director', bio: 'Church music director and session keyboard player. Proficient in piano, organ, and synthesizer.', location: 'Atlanta, GA', type: 'musician', avail: 'available' },
      { email: 'grandballroom@email.com', fn: 'The Grand', ln: 'Ballroom', headline: 'Premier Event Venue | Nashville', bio: 'Nashville premiere event venue hosting weddings, corporate events, and live music every weekend.', location: 'Nashville, TN', type: 'venue', avail: 'available' },
      { email: 'soundwave@email.com', fn: 'Soundwave', ln: 'Events', headline: 'Event Planning & Production', bio: 'Full-service entertainment and event production company. We connect talent with opportunities.', location: 'Los Angeles, CA', type: 'organizer', avail: 'available' },
      { email: 'robert.kim@email.com', fn: 'Robert', ln: 'Kim', headline: 'Saxophonist | Jazz Ensemble Leader', bio: 'Leading my own jazz quartet for the past 8 years. We play everything from standards to modern fusion.', location: 'Chicago, IL', type: 'musician', avail: 'available' },
      { email: 'nina.adams@email.com', fn: 'Nina', ln: 'Adams', headline: 'Trumpet Player | Brass Section', bio: 'Professional trumpet player experienced in big band, orchestral, and Latin music settings.', location: 'New York, NY', type: 'musician', avail: 'available' },
    ];

    for (const u of users) {
      await db.prepare('INSERT INTO users (email, password_hash, first_name, last_name, headline, bio, location, account_type, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        u.email,
        hash,
        u.fn,
        u.ln,
        u.headline,
        u.bio,
        u.location,
        u.type,
        u.avail,
      );
    }

    const userSkills: Record<number, number[]> = {
      1: [1], 2: [4], 3: [3], 4: [7], 5: [6], 6: [8], 7: [2], 8: [5], 9: [], 10: [],
      11: [9], 12: [10],
    };
    for (const [userId, skillIds] of Object.entries(userSkills)) {
      for (const skillId of skillIds) {
        await db.prepare('INSERT INTO user_skills (user_id, skill_id) VALUES (?, ?)').run(parseInt(userId, 10), skillId);
      }
    }

    const userGenres: Record<number, number[]> = {
      1: [1, 9], 2: [3, 8], 3: [2, 1, 9], 4: [5], 5: [6], 6: [4, 3], 7: [1, 2, 7], 8: [3, 5, 8],
      11: [1, 9], 12: [1, 10],
    };
    for (const [userId, genreIds] of Object.entries(userGenres)) {
      for (const genreId of genreIds) {
        await db.prepare('INSERT INTO user_genres (user_id, genre_id) VALUES (?, ?)').run(parseInt(userId, 10), genreId);
      }
    }

    const experiences = [
      { uid: 1, title: 'Lead Guitarist', org: 'Nashville Jazz Collective', loc: 'Nashville, TN', start: '2020-01-01', end: '', desc: 'Lead guitarist for a 5-piece jazz ensemble performing weekly at downtown venues.' },
      { uid: 1, title: 'Session Musician', org: 'RCA Studio B', loc: 'Nashville, TN', start: '2015-06-01', end: '2020-01-01', desc: 'Recorded guitar tracks for over 50 albums across multiple genres.' },
      { uid: 2, title: 'Solo Artist', org: 'Independent', loc: 'Los Angeles, CA', start: '2019-01-01', end: '', desc: 'Released 2 EPs and 1 full album. 500K+ monthly Spotify listeners.' },
      { uid: 3, title: 'Touring Drummer', org: 'The Wildcards', loc: 'Touring', start: '2018-01-01', end: '', desc: 'National touring act performing 100+ shows per year.' },
      { uid: 4, title: 'First Violin', org: 'Nashville Symphony', loc: 'Nashville, TN', start: '2016-09-01', end: '', desc: 'Principal first violin for the Nashville Symphony Orchestra.' },
    ];
    for (const exp of experiences) {
      await db.prepare('INSERT INTO experiences (user_id, title, organization, location, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        exp.uid,
        exp.title,
        exp.org,
        exp.loc,
        exp.start,
        exp.end,
        exp.desc,
      );
    }

    const gigs = [
      { pid: 9, title: 'Wedding Band Guitarist Needed', desc: 'Looking for an experienced guitarist to join our wedding band for a reception at The Grand Ballroom. Must know jazz standards and popular hits. Professional attire required.', venue: 'The Grand Ballroom', loc: 'Nashville, TN', date: '2026-03-15', time: '7:00 PM - 11:00 PM', pmin: 300, pmax: 400, ptype: 'fixed', genre: 'Jazz', skills: 'Guitar, Vocals' },
      { pid: 10, title: 'Singer for Corporate Event', desc: 'Need a versatile singer for an annual corporate gala. Mix of contemporary hits and classic songs. Band provided, just need lead vocals.', venue: 'The Ritz Carlton', loc: 'Los Angeles, CA', date: '2026-04-20', time: '6:00 PM - 10:00 PM', pmin: 500, pmax: 700, ptype: 'fixed', genre: 'Pop', skills: 'Vocals' },
      { pid: 9, title: 'Jazz Trio for Restaurant', desc: 'Seeking a jazz trio (piano, bass, drums) for weekly Friday evening performances. Ongoing engagement with competitive pay.', venue: 'The Blue Note Bistro', loc: 'Nashville, TN', date: '2026-03-01', time: '8:00 PM - 11:00 PM', pmin: 150, pmax: 200, ptype: 'fixed', genre: 'Jazz', skills: 'Keyboard, Bass, Drums' },
      { pid: 10, title: 'DJ for Music Festival', desc: 'Major music festival seeking DJs for our electronic stage. 45-minute sets. Exposure to 10,000+ attendees.', venue: 'Soundwave Festival', loc: 'Miami, FL', date: '2026-05-10', time: '2:00 PM - 11:00 PM', pmin: 1000, pmax: 2000, ptype: 'fixed', genre: 'Electronic', skills: 'DJ' },
      { pid: 9, title: 'String Quartet for Ceremony', desc: 'Need a string quartet for a beautiful garden wedding ceremony. Repertoire should include classical standards and modern pop arrangements.', venue: 'Cheekwood Gardens', loc: 'Nashville, TN', date: '2026-04-05', time: '3:00 PM - 5:00 PM', pmin: 200, pmax: 300, ptype: 'fixed', genre: 'Classical', skills: 'Violin' },
      { pid: 10, title: 'Backup Dancers for Music Video', desc: 'Casting 4 backup dancers for a hip-hop music video shoot. Must be comfortable with hip-hop and contemporary styles. 2-day shoot.', venue: 'Studio 54 LA', loc: 'Los Angeles, CA', date: '2026-03-25', time: '9:00 AM - 6:00 PM', pmin: 400, pmax: 600, ptype: 'fixed', genre: 'Hip-Hop', skills: 'Dance' },
      { pid: 9, title: 'Bass Player for Country Band', desc: 'Our country band needs a bass player for upcoming shows. Must be comfortable with traditional and modern country. Rehearsals on Wednesdays.', venue: 'Various Venues', loc: 'Nashville, TN', date: '2026-03-20', time: 'Evenings', pmin: 150, pmax: 250, ptype: 'fixed', genre: 'Country', skills: 'Bass' },
      { pid: 10, title: 'Keyboard Player for Church', desc: 'Growing church community seeking a dedicated keyboard player for Sunday services and special events. Welcoming and supportive environment.', venue: 'Community Grace Church', loc: 'Atlanta, GA', date: '2026-03-02', time: '9:00 AM - 12:00 PM', pmin: 100, pmax: 150, ptype: 'fixed', genre: 'R&B', skills: 'Keyboard' },
      { pid: 9, title: 'Saxophone Player for Jazz Club', desc: 'The Blue Door Jazz Club is looking for a saxophone player to join our house band rotation. Weekly Thursday night slot available.', venue: 'The Blue Door Jazz Club', loc: 'Chicago, IL', date: '2026-03-06', time: '9:00 PM - 12:00 AM', pmin: 200, pmax: 300, ptype: 'fixed', genre: 'Jazz', skills: 'Saxophone' },
      { pid: 10, title: 'Latin Band for Festival', desc: 'Seeking a full Latin band for our annual cultural festival. Salsa, merengue, and bachata. Must have own PA system.', venue: 'Central Park', loc: 'New York, NY', date: '2026-06-15', time: '12:00 PM - 6:00 PM', pmin: 2000, pmax: 3000, ptype: 'fixed', genre: 'Latin', skills: 'Trumpet, Drums, Vocals' },
    ];
    for (const g of gigs) {
      await db.prepare('INSERT INTO gigs (poster_id, title, description, venue, location, gig_date, gig_time, pay_min, pay_max, pay_type, genre, skills_needed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        g.pid,
        g.title,
        g.desc,
        g.venue,
        g.loc,
        g.date,
        g.time,
        g.pmin,
        g.pmax,
        g.ptype,
        g.genre,
        g.skills,
      );
    }

    const validConnections = [
      { req: 1, rec: 3, status: 'accepted' },
      { req: 1, rec: 7, status: 'accepted' },
      { req: 2, rec: 6, status: 'accepted' },
      { req: 3, rec: 7, status: 'accepted' },
      { req: 4, rec: 1, status: 'accepted' },
      { req: 5, rec: 6, status: 'pending' },
      { req: 8, rec: 1, status: 'accepted' },
      { req: 11, rec: 1, status: 'accepted' },
      { req: 12, rec: 11, status: 'accepted' },
      { req: 2, rec: 1, status: 'accepted' },
      { req: 6, rec: 1, status: 'pending' },
      { req: 12, rec: 3, status: 'pending' },
    ];
    for (const c of validConnections) {
      await db.prepare('INSERT INTO connections (requester_id, recipient_id, status, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(c.req, c.rec, c.status);
    }

    const posts = [
      { aid: 1, content: 'Just wrapped up an amazing studio session at RCA Studio B! The new album is sounding incredible. Can\'t wait to share it with everyone.', type: 'text' },
      { aid: 2, content: 'Excited to announce that my new single "Midnight Dreams" drops next Friday! Pre-save link in my profile.', type: 'announcement' },
      { aid: 3, content: 'Looking for a bassist to jam with this weekend in Austin. Hit me up if you\'re free! Jazz and blues preferred.', type: 'text' },
      { aid: 4, content: 'Tonight\'s symphony performance of Beethoven\'s 9th was absolutely transcendent. So grateful to be part of this orchestra.', type: 'text' },
      { aid: 5, content: 'New remix dropping on SoundCloud tonight at midnight! Electronic meets jazz - something completely different.', type: 'announcement' },
      { aid: 6, content: 'Just finished choreographing a new routine for an upcoming music video. The dancers killed it!', type: 'text' },
      { aid: 7, content: 'Nothing beats the feeling of a packed house vibing to live music. Nashville, you never disappoint!', type: 'text' },
      { aid: 8, content: 'Sunday service was incredible today. Music truly brings people together. Blessed to share my gift.', type: 'text' },
      { aid: 1, content: 'Pro tip for guitarists: Always warm up with scales before a gig. Your fingers will thank you!', type: 'text' },
      { aid: 2, content: 'Had an amazing collaboration with @MarcusJohnson last week. Jazz meets pop - stay tuned!', type: 'text' },
      { aid: 11, content: 'Looking for musicians to join a jazz jam session at the Blue Door next Thursday. All instruments welcome!', type: 'text' },
      { aid: 12, content: 'Just got back from a brass workshop in New Orleans. So much inspiration for new arrangements!', type: 'text' },
      { aid: 3, content: 'New drum kit day! Can\'t wait to break these in at our next show.', type: 'text' },
      { aid: 7, content: 'Session work tip: always bring extra strings, cables, and a backup instrument if possible. Be prepared!', type: 'text' },
      { aid: 1, content: 'Grateful for all the connections I\'ve made through GigBoard. This platform is a game-changer for musicians!', type: 'text' },
    ];
    for (const p of posts) {
      await db.prepare('INSERT INTO posts (author_id, content, post_type) VALUES (?, ?, ?)').run(p.aid, p.content, p.type);
    }

    const likes = [
      [2, 1], [3, 1], [7, 1], [4, 1],
      [1, 2], [6, 2], [3, 2],
      [1, 3], [7, 3],
      [1, 4], [2, 4], [8, 4],
      [6, 5], [3, 5],
      [2, 6], [5, 6],
    ];
    for (const [userId, postId] of likes) {
      await db.prepare('INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)').run(userId, postId);
      await db.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId);
    }

    const commentsList = [
      { pid: 1, aid: 2, content: 'Can\'t wait to hear it! Your studio work is always top-notch.' },
      { pid: 1, aid: 3, content: 'RCA Studio B is legendary! Must have been an incredible experience.' },
      { pid: 2, aid: 1, content: 'Congratulations Sarah! Pre-saved it already.' },
      { pid: 3, aid: 7, content: 'I\'m in Austin this weekend! Let\'s jam. I\'ll bring my bass.' },
      { pid: 4, aid: 1, content: 'Beethoven\'s 9th is a masterpiece. Wish I could have been there!' },
      { pid: 6, aid: 2, content: 'Your choreography is always so creative! Would love to collaborate.' },
    ];
    for (const c of commentsList) {
      await db.prepare('INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)').run(c.pid, c.aid, c.content);
      await db.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?').run(c.pid);
    }

    const convos = [
      { u1: 1, u2: 2, messages: [
        { sender: 1, content: 'Hey Sarah! Love your new single. Would you be interested in collaborating on a jazz-pop fusion track?' },
        { sender: 2, content: 'Marcus! Thanks so much! I\'d absolutely love that. When are you free to discuss?' },
        { sender: 1, content: 'How about next Tuesday? We could meet at the studio or hop on a video call.' },
        { sender: 2, content: 'Tuesday works! Let\'s do the studio - I\'d love to hear your setup.' },
      ]},
      { u1: 1, u2: 3, messages: [
        { sender: 3, content: 'Hey Marcus, saw you\'re looking for musicians in Nashville. I\'m a drummer - would love to connect!' },
        { sender: 1, content: 'James! Your work with The Wildcards is awesome. Definitely let\'s jam sometime.' },
        { sender: 3, content: 'Awesome! I\'m free most weekday afternoons. What works for you?' },
      ]},
      { u1: 1, u2: 7, messages: [
        { sender: 7, content: 'Marcus, I heard you need a bass player for your trio. Count me in!' },
        { sender: 1, content: 'David! You\'d be perfect. We rehearse Tuesdays at 7pm. Can you make it?' },
        { sender: 7, content: 'Absolutely. See you Tuesday!' },
      ]},
      { u1: 2, u2: 6, messages: [
        { sender: 2, content: 'Lisa, your choreography is amazing! Would you be interested in doing a music video for my new single?' },
        { sender: 6, content: 'Oh my gosh, yes! I\'ve been following your music. When\'s the shoot?' },
        { sender: 2, content: 'We\'re planning for late March. I\'ll send you the details soon!' },
      ]},
    ];
    for (const conv of convos) {
      const result = await db.prepare('INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)').run(conv.u1, conv.u2);
      const convId = Number(result.lastInsertRowid);
      for (const msg of conv.messages) {
        await db.prepare('INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)').run(convId, msg.sender, msg.content);
      }
      await db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(convId);
    }
  });
}
