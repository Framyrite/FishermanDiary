export type CaughtStatus = "uncaught" | "caught_manual" | "caught_trophy" | "caught_both";

export type UserProfile = {
  id: string;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type FishSpecies = {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  description: string | null;
  caught_status: CaughtStatus;
  trophy_count: number;
  best_weight_grams: number | null;
  best_length_cm: number | null;
};

export type Trophy = {
  id: string;
  user_id: string;
  species_id: string;
  photo_url: string | null;
  weight_grams: number | null;
  length_cm: number | null;
  date_caught: string | null;
  place_name: string | null;
  bait: string | null;
  note: string | null;
  visibility: "private" | "friends" | "link";
  show_place: boolean;
  created_at: string;
  species?: {
    id: string;
    name: string;
    category: string;
    image_url: string | null;
  } | null;
};

export type RecordItem = {
  species_id: string;
  species_name: string;
  category: string;
  best_weight_grams: number | null;
  best_length_cm: number | null;
  trophy_id: string;
  photo_url: string | null;
  date_caught: string | null;
};

export type FriendSummary = {
  id: string;
  username: string | null;
  first_name: string | null;
  avatar_url: string | null;
  caught_species_count: number;
  trophies_count: number;
  best_trophy: string | null;
};

export type ProfileStats = {
  caught_species_count: number;
  species_total: number;
  trophies_count: number;
  records_count: number;
  best_trophy: string | null;
};
