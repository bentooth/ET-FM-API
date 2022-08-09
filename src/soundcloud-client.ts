import axios, { AxiosResponse } from "axios";
import NodeCache = require("node-cache");
import * as qs from 'qs';
import SoundCloudConfig from "./constants";
import { Playlist as SCPlaylist, Track } from "./soundcloud-model";

var cache = new NodeCache();

export class SoundCloudService implements ISoundCloudService {
    private accessToken: string;
    private refreshToken: string;
    private expiresIn: string;
    private playlistId: string;
    private baseUrl: string;

    constructor() {
        this.playlistId = '1064225653';
        this.baseUrl = 'https://api.soundcloud.com';
        this.getTokens();
    }

    private setExpiryDate(expiresIn: number): string {
        const now = new Date();
        now.setSeconds(now.getSeconds() + expiresIn);
        const expiration = now.toISOString();
        return expiration;
    }

    private async checkTokens(): Promise<void> {
        const now = new Date().toISOString();
        if (now > this.expiresIn) {
            await this.refreshTokens();
        }
    }

    private async getTokens(): Promise<void> {
        try {
            const response: AxiosResponse = await axios({
                method: 'POST',
                baseURL: this.baseUrl,
                url: '/oauth2/token',
                timeout: 60000,
                headers: {
                    'accept': 'application/json; charset=utf-8',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: qs.stringify({
                    'grant_type': 'client_credentials',
                    'client_id': SoundCloudConfig.lambda.client_id,
                    'client_secret': SoundCloudConfig.lambda.client_secret
                }),
            });

            const data: GetTokenResponse = response.data;

            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;
            this.expiresIn = this.setExpiryDate(data.expires_in);
        } catch (error) {
            throw new Error('Unable to get access tokens');
        }
    }

    private async refreshTokens(): Promise<void> {
        try {
            const response: AxiosResponse = await axios({
                method: 'POST',
                baseURL: this.baseUrl,
                url: '/oauth2/token',
                timeout: 60000,
                headers: {
                    'accept': 'application/json; charset=utf-8',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: qs.stringify({
                    'grant_type': 'refresh_token',
                    'client_id': SoundCloudConfig.lambda.client_id,
                    'client_secret': SoundCloudConfig.lambda.client_secret,
                    'refresh_token': this.refreshToken
                }),
            });

            const data: GetTokenResponse = response.data;

            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;
            this.expiresIn = this.setExpiryDate(data.expires_in);
        } catch (error) {
            throw new Error('Unable to fresh tokens');
        }
    }

    public async getPlaylist(): Promise<ETPlaylist[]> {

        this.checkTokens();

        let cache_playlist: ETPlaylist[] = cache.get('playlist');

        if (cache_playlist) {
            return cache_playlist;
        }

        let response: AxiosResponse;

        try {
            response = await axios({
                method: 'GET',
                baseURL: this.baseUrl,
                url: `/playlists/${this.playlistId}?show_tracks=true`,
                timeout: 60000,
                headers: {
                    'accept': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
        } catch (error) {
            throw new Error('Unable to fetch playlist from SoundCloud');
        }

        const playlist: SCPlaylist = response.data;
        const tracks: Track[] = playlist.tracks;

        const ETPlaylist = tracks.map((track: Track, _) => {
            return {
                id: track.id,
                title: track.title,
                cover: track.artwork_url.replace('large', 't500x500'),
                duration: track.duration,
            }
        })

        cache.set('playlist', ETPlaylist, 864000);

        return ETPlaylist;
    }

    public async getStream(trackId: string): Promise<AxiosResponse> {

        this.checkTokens(); //middleware?

        let response: AxiosResponse;

        try {
            response = await axios({
                method: 'GET',
                responseType: 'stream',
                baseURL: this.baseUrl,
                url: `/tracks/${trackId}/stream`,
                timeout: 60000,
                headers: {
                    'accept': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
        } catch (error) {
            throw new Error(`Unable to get stream ${trackId} from SoundCloud`);
        }

        return response;
    }
}

interface GetTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
}

interface ETPlaylist {
    id: number,
    title: string;
    cover: string;
    duration: number;
}

export interface ISoundCloudService {
    getPlaylist(): Promise<ETPlaylist[]>
    getStream(trackId: string): Promise<AxiosResponse>
}

export default SoundCloudService