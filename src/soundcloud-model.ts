export interface Playlist {
    duration: number;
    genre: string;
    release_day: null;
    permalink: string;
    permalink_url: string;
    release_month: null;
    release_year: null;
    description: string;
    uri: string;
    label_name: string;
    label_id: null;
    label: null;
    tag_list: string;
    track_count: number;
    user_id: number;
    last_modified: string;
    license: License;
    user: User;
    playlist_type: string;
    type: string;
    id: number;
    downloadable: null;
    likes_count: number;
    sharing: Sharing;
    created_at: string;
    release: null;
    tags: string;
    kind: string;
    title: string;
    purchase_title: null;
    ean: string;
    streamable: boolean;
    embeddable_by: EmbeddableBy;
    artwork_url: null;
    purchase_url: null;
    tracks_uri: string;
    tracks: Track[];
}

export enum EmbeddableBy {
    All = "all",
}

export enum License {
    AllRightsReserved = "all-rights-reserved",
}

export enum Sharing {
    Public = "public",
}

export interface Track {
    kind: TrackKind;
    id: number;
    created_at: string;
    duration: number;
    commentable: boolean;
    comment_count: number;
    sharing: Sharing;
    tag_list: string;
    streamable: boolean;
    embeddable_by: EmbeddableBy;
    purchase_url: null | string;
    purchase_title: null | string;
    genre: string;
    title: string;
    description: null | string;
    label_name: null | string;
    release: null | string;
    key_signature: null | string;
    isrc: null | string;
    bpm: null;
    release_year: number | null;
    release_month: number | null;
    release_day: number | null;
    license: License;
    uri: string;
    user: User;
    permalink_url: string;
    artwork_url: string;
    stream_url: string;
    download_url: null | string;
    waveform_url: string;
    available_country_codes: null;
    secret_uri: null;
    user_favorite: null;
    user_playback_count: null;
    playback_count: number;
    download_count: number;
    favoritings_count: number;
    reposts_count: number;
    downloadable: boolean;
    access: Access;
    policy: null;
    monetization_model: null;
}

export enum Access {
    Playable = "playable",
}

export enum TrackKind {
    Track = "track",
}

export interface User {
    avatar_url: string;
    id: number;
    kind: UserKind;
    permalink_url: string;
    uri: string;
    username: string;
    permalink: string;
    created_at: string;
    last_modified: string;
    first_name: null | string;
    last_name: null | string;
    full_name: string;
    city: null | string;
    description: null | string;
    country: null | string;
    track_count: number;
    public_favorites_count: number;
    reposts_count: number;
    followers_count: number;
    followings_count: number;
    plan: Plan;
    myspace_name: null | string;
    discogs_name: null | string;
    website_title: null | string;
    website: null | string;
    comments_count: number;
    online: boolean;
    likes_count: number;
    playlist_count: number;
    subscriptions: Subscription[];
}

export enum UserKind {
    User = "user",
}

export enum Plan {
    Free = "Free",
    Pro = "Pro",
    ProUnlimited = "Pro Unlimited",
}

export interface Subscription {
    product: Product;
}

export interface Product {
    id: ID;
    name: Plan;
}

export enum ID {
    CreatorPro = "creator-pro",
    CreatorProUnlimited = "creator-pro-unlimited",
    Free = "free",
}
