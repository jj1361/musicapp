export interface User {
  id: number;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  headline: string;
  bio: string;
  location: string;
  profile_photo: string;
  cover_photo: string;
  phone: string;
  website: string;
  youtube_url: string;
  soundcloud_url: string;
  spotify_url: string;
  instagram_url: string;
  availability: 'available' | 'busy' | 'not_looking';
  account_type: 'musician' | 'venue' | 'organizer' | 'band';
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  skills: Skill[];
  genres: Genre[];
  experiences: Experience[];
  connection_count?: number;
  connection_status?: 'none' | 'pending' | 'accepted' | 'sent';
}

export interface Skill {
  id: number;
  name: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Experience {
  id: number;
  user_id: number;
  title: string;
  organization: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  created_at: string;
}

export interface Gig {
  id: number;
  poster_id: number;
  title: string;
  description: string;
  venue: string;
  location: string;
  gig_date: string;
  gig_time: string;
  pay_min: number;
  pay_max: number;
  pay_type: 'fixed' | 'hourly' | 'negotiable' | 'unpaid';
  genre: string;
  skills_needed: string;
  status: 'open' | 'filled' | 'cancelled';
  applications: number;
  created_at: string;
  updated_at: string;
  poster?: User;
}

export interface GigApplication {
  id: number;
  gig_id: number;
  user_id: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  user?: User;
}

export interface Post {
  id: number;
  author_id: number;
  content: string;
  post_type: 'text' | 'announcement' | 'gig_share';
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: User;
  user_liked?: boolean;
}

export interface Comment {
  id: number;
  post_id: number;
  author_id: number;
  content: string;
  created_at: string;
  author?: User;
}

export interface Connection {
  id: number;
  requester_id: number;
  recipient_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Conversation {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message_at: string;
  created_at: string;
  other_user?: User;
  last_message?: string;
  last_sender_id?: number;
  unread_count?: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  read: number;
  created_at: string;
  sender?: User;
}

export interface TokenPayload {
  userId: number;
  email: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}
