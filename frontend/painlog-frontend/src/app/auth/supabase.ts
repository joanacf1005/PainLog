import { Injectable } from '@angular/core';
import {AuthChangeEvent, createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  signInWithPassword(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  signUp(email: string, password: string, firstName: string, lastName: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
        },
      },
    });
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  get supabasePublic() {
    return this.supabase;
  }

  async getTodaysPainEntry(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await this.supabase
      .from('PainEntries')
      .select('*')
      .eq('userId', userId)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
  }

  async deletePainEntry(id: string) {
    return await this.supabase
      .from('PainEntries')
      .delete()
      .eq('id', id);
  }
}
