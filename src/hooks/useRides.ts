import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Ride } from "../types";

export function useRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // ADDED THIS

  const fetchRides = async () => {
    try {
      const { data, error } = await supabase
        .from("rides")
        .select("*") // Removed the timeline relational query
        .not("id", "eq", "00000000-0000-0000-0000-000000000000")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = data.map((ride: any) => ({
        ...ride,
        googleMapUrl: ride.google_map_url,
        contentType: ride.content_type || {},
        links: ride.links || {},
      }));

      setRides(formatted);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  return { rides, loading, error, refetch: fetchRides };
}
