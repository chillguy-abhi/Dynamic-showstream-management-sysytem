// Data Entities based on ER Diagram

export interface TVShow {
  Title: string; // PK, CHAR(128)
  Description: string; // CHAR(200)
}

export interface TVShowSeason {
  SeasonID: number; // PK, INT
  SeasonNumber: number; // INT
  SeasonDescription: string; // CHAR(200)
  DateStarted: string; // DATE (ISO string)
  DateEnded: string; // DATE (ISO string)
  Title: string; // FK ref TVShow.Title
}

export interface Cast {
  ActorID: number; // PK, INT
  ActorsFirstName: string; // CHAR(128)
  ActorsLastName: string; // CHAR(128)
}

export interface Crew {
  CrewID: number; // PK, INT
  FirstName: string; // CHAR(128)
  LastName: string; // CHAR(128)
  PersonDefination: string; // CHAR(128) (sic: Defination from prompt)
}

export interface Episode {
  EpisodeNumber: number; // PK, INT (Treating as Unique ID)
  Episodetitle: string; // CHAR(128)
  EpisodeDescription: string; // CHAR(200)
  Rating: number; // INT
  DatePublished: string; // DATE
  SeasonID: number; // FK ref TVShowSeason.SeasonID
}

export interface ScreenTime {
  ScreenTimeID: number; // PK, INT
  StartTime: string; // DATETIME (ISO string)
  EndTime: string; // DATETIME (ISO string)
  RoleName: string; // CHAR(128)
  RoleType: string; // CHAR(128)
}

// Junction Tables

export interface ActorScreenTime {
  ActorID: number; // FK
  ScreenTimeID: number; // FK
}

export interface EpisodeScreenTime {
  EpisodeNumber: number; // FK
  ScreenTimeID: number; // FK
}

export interface CrewEpisode {
  CrewID: number; // FK
  EpisodeNumber: number; // FK
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  username: string;
  role: UserRole;
}
