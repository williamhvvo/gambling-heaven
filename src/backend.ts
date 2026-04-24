import { PlayerProfile } from './types';

export interface ProfileRepository {
  save(profile: PlayerProfile): Promise<void>;
  load(): Promise<PlayerProfile | null>;
}

// This mock API demonstrates how to plug in a real backend later.
// Swap endpoint and auth headers when wiring Firebase, Supabase, or custom API.
export class HttpProfileRepository implements ProfileRepository {
  constructor(private readonly baseUrl: string) {}

  async save(profile: PlayerProfile): Promise<void> {
    await fetch(`${this.baseUrl}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
  }

  async load(): Promise<PlayerProfile | null> {
    const response = await fetch(`${this.baseUrl}/profile`);
    if (!response.ok) {
      return null;
    }
    return response.json() as Promise<PlayerProfile>;
  }
}
