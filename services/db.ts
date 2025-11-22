import {
  TVShow,
  TVShowSeason,
  Cast,
  Crew,
  Episode,
  ScreenTime,
  ActorScreenTime,
  EpisodeScreenTime,
  CrewEpisode,
  UserRole,
  User
} from '../types';

// Seed Data
const SEED_SHOWS: TVShow[] = [
  { Title: 'Galactic Horizons', Description: 'A journey through the cosmos.' },
  { Title: 'Urban Legends', Description: 'Myths coming to life in the city.' },
];

const SEED_SEASONS: TVShowSeason[] = [
  { SeasonID: 1, SeasonNumber: 1, SeasonDescription: 'The Beginning', DateStarted: '2023-01-01', DateEnded: '2023-03-01', Title: 'Galactic Horizons' },
  { SeasonID: 2, SeasonNumber: 2, SeasonDescription: 'The Expansion', DateStarted: '2024-01-01', DateEnded: '2024-03-01', Title: 'Galactic Horizons' },
];

const SEED_EPISODES: Episode[] = [
  { EpisodeNumber: 101, Episodetitle: 'Pilot', EpisodeDescription: 'Launch day.', Rating: 8, DatePublished: '2023-01-01', SeasonID: 1 },
  { EpisodeNumber: 102, Episodetitle: 'First Contact', EpisodeDescription: 'We are not alone.', Rating: 9, DatePublished: '2023-01-08', SeasonID: 1 },
];

const SEED_CAST: Cast[] = [
  { ActorID: 1, ActorsFirstName: 'John', ActorsLastName: 'Doe' },
  { ActorID: 2, ActorsFirstName: 'Jane', ActorsLastName: 'Smith' },
];

const SEED_CREW: Crew[] = [
  { CrewID: 1, FirstName: 'Alice', LastName: 'Director', PersonDefination: 'Director' },
];

// Pre-calculated SHA-256 hashes for default users
// admin / admin
const ADMIN_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
// user / user
const USER_HASH = "04f8996da763b7a969b1028ee3007569eaf3a635486ddab211d512c85b9df8fb";

// Database Class
class MockDatabase {
  private get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    try {
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error parsing DB data", e);
        return [];
    }
  }

  private set<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  init() {
    if (!localStorage.getItem('tvshow')) {
      this.set('tvshow', SEED_SHOWS);
      this.set('tvshowseasons', SEED_SEASONS);
      this.set('episode', SEED_EPISODES);
      this.set('cast', SEED_CAST);
      this.set('crew', SEED_CREW);
      this.set('screentime', []);
      this.set('actor_screentime', []);
      this.set('episode_screentime', []);
      this.set('crew_episode', []);
    }
    
    if (!localStorage.getItem('users')) {
      this.set('users', [
          { username: 'admin', passwordHash: ADMIN_HASH, role: UserRole.ADMIN },
          { username: 'user', passwordHash: USER_HASH, role: UserRole.USER }
      ]);
    }
  }

  // --- Authentication & User Management ---

  private async hashPassword(password: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async registerUser(username: string, password: string, role: UserRole): Promise<User> {
      const users = this.get<any>('users');
      if (users.some(u => u.username === username)) {
          throw new Error("Username already exists");
      }
      
      const passwordHash = await this.hashPassword(password);
      users.push({ username, passwordHash, role });
      this.set('users', users);
      
      return { username, role };
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
      const users = this.get<any>('users');
      const user = users.find(u => u.username === username);
      if (!user) return null;
      
      const inputHash = await this.hashPassword(password);
      if (inputHash === user.passwordHash) {
          return { username: user.username, role: user.role };
      }
      return null;
  }

  // --- Admin User Management ---

  getAllUsers(): User[] {
    const users = this.get<any>('users');
    // Return only public info, ensure role exists and user is valid
    return users
        .filter(u => u && u.username) 
        .map(u => ({ username: u.username, role: u.role || UserRole.USER }));
  }

  deleteUser(username: string) {
    const users = this.get<any>('users');
    // Filter out the user. Use optional chaining to handle potential corrupt data.
    const newUsers = users.filter(u => u?.username !== username);
    
    if (newUsers.length === users.length) {
        console.warn(`User ${username} not found to delete.`);
    }
    
    this.set('users', newUsers);
  }

  updateUserRole(username: string, newRole: UserRole) {
    const users = this.get<any>('users');
    const idx = users.findIndex(u => u.username === username);
    if (idx !== -1) {
      users[idx].role = newRole;
      this.set('users', users);
    } else {
        throw new Error("User not found");
    }
  }

  // --- Generic CRUD Helpers ---
  
  getAll<T>(table: string): T[] {
    return this.get<T>(table);
  }

  create<T>(table: string, item: T) {
    const list = this.get<T>(table);
    list.push(item);
    this.set(table, list);
  }

  update<T>(table: string, keyField: keyof T, keyValue: any, updates: Partial<T>) {
    const list = this.get<T>(table);
    const idx = list.findIndex((i) => i[keyField] === keyValue);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.set(table, list);
    }
  }

  delete<T>(table: string, keyField: keyof T, keyValue: any) {
    const list = this.get<T>(table);
    const newList = list.filter((i) => i[keyField] !== keyValue);
    this.set(table, newList);
  }

  // --- Specific Table Methods with Integrity Checks ---

  // TV Shows
  getShows() { return this.getAll<TVShow>('tvshow'); }
  addShow(show: TVShow) {
    if (this.getShows().some(s => s.Title === show.Title)) throw new Error("Show Title already exists");
    this.create('tvshow', show);
  }
  deleteShow(title: string) {
    // Check FK constraints
    const seasons = this.getSeasons().filter(s => s.Title === title);
    if (seasons.length > 0) throw new Error("Cannot delete Show with existing Seasons.");
    this.delete('tvshow', 'Title', title);
  }

  // Seasons
  getSeasons() { return this.getAll<TVShowSeason>('tvshowseasons'); }
  addSeason(season: TVShowSeason) {
    // FK Check
    if (!this.getShows().some(s => s.Title === season.Title)) throw new Error("Invalid Show Title FK");
    if (this.getSeasons().some(s => s.SeasonID === season.SeasonID)) throw new Error("SeasonID exists");
    this.create('tvshowseasons', season);
  }
  deleteSeason(id: number) {
    if (this.getEpisodes().some(e => e.SeasonID === id)) throw new Error("Cannot delete Season with existing Episodes.");
    this.delete('tvshowseasons', 'SeasonID', id);
  }

  // Episodes
  getEpisodes() { return this.getAll<Episode>('episode'); }
  addEpisode(episode: Episode) {
    if (!this.getSeasons().some(s => s.SeasonID === episode.SeasonID)) throw new Error("Invalid SeasonID FK");
    if (this.getEpisodes().some(e => e.EpisodeNumber === episode.EpisodeNumber)) throw new Error("EpisodeNumber exists");
    this.create('episode', episode);
  }
  deleteEpisode(id: number) {
    // Check Junctions
    const epSt = this.getAll<EpisodeScreenTime>('episode_screentime').filter(x => x.EpisodeNumber === id);
    const crewEp = this.getAll<CrewEpisode>('crew_episode').filter(x => x.EpisodeNumber === id);
    
    if (epSt.length > 0 || crewEp.length > 0) throw new Error("Cannot delete Episode with associated Screentime or Crew.");
    
    this.delete('episode', 'EpisodeNumber', id);
  }

  // Cast
  getCast() { return this.getAll<Cast>('cast'); }
  addCast(actor: Cast) {
    if (this.getCast().some(a => a.ActorID === actor.ActorID)) throw new Error("ActorID exists");
    this.create('cast', actor);
  }

  // Crew
  getCrew() { return this.getAll<Crew>('crew'); }
  addCrew(crew: Crew) {
    if (this.getCrew().some(c => c.CrewID === crew.CrewID)) throw new Error("CrewID exists");
    this.create('crew', crew);
  }

  // Screentime & Junctions
  getScreenTimes() { return this.getAll<ScreenTime>('screentime'); }
  addScreenTime(st: ScreenTime, episodeId: number, actorIds: number[]) {
     // Validation: EndTime > StartTime
     if (new Date(st.EndTime) <= new Date(st.StartTime)) throw new Error("EndTime must be after StartTime");
     
     // FK Check
     if (!this.getEpisodes().some(e => e.EpisodeNumber === episodeId)) throw new Error("Invalid Episode ID");
     
     // Create ScreenTime
     this.create('screentime', st);
     
     // Link to Episode
     const est: EpisodeScreenTime = { EpisodeNumber: episodeId, ScreenTimeID: st.ScreenTimeID };
     this.create('episode_screentime', est);

     // Link to Actors
     actorIds.forEach(aid => {
         if(this.getCast().some(c => c.ActorID === aid)) {
             const ast: ActorScreenTime = { ActorID: aid, ScreenTimeID: st.ScreenTimeID };
             this.create('actor_screentime', ast);
         }
     });
  }
  
  // Complex Getters
  getDetailedEpisode(episodeId: number) {
    const episode = this.getEpisodes().find(e => e.EpisodeNumber === episodeId);
    if (!episode) return null;

    // Get connected Screentimes
    const epStLinks = this.getAll<EpisodeScreenTime>('episode_screentime').filter(l => l.EpisodeNumber === episodeId);
    const screenTimeIds = epStLinks.map(l => l.ScreenTimeID);
    const allScreenTimes = this.getScreenTimes().filter(st => screenTimeIds.includes(st.ScreenTimeID));

    // Enrich Screentimes with Actors
    const richScreenTimes = allScreenTimes.map(st => {
        const actorLinks = this.getAll<ActorScreenTime>('actor_screentime').filter(l => l.ScreenTimeID === st.ScreenTimeID);
        const actors = this.getCast().filter(c => actorLinks.some(al => al.ActorID === c.ActorID));
        return { ...st, actors };
    });

    // Get Crew
    const crewLinks = this.getAll<CrewEpisode>('crew_episode').filter(l => l.EpisodeNumber === episodeId);
    const crew = this.getCrew().filter(c => crewLinks.some(cl => cl.CrewID === c.CrewID));

    return { ...episode, screenTimes: richScreenTimes, crew };
  }
}

export const db = new MockDatabase();
db.init();