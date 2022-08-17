import 'dotenv/config'
import axios, { AxiosResponse } from "axios";
import { Request, Response, NextFunction } from "express";
import NodeCache from 'node-cache';
import * as qs from 'qs';
import { Playlist as SCPlaylist, Track } from "./soundcloud-model";

const cache = new NodeCache();

export class SoundCloudService implements ISoundCloudService {
    constructor() {
        this.getTokens()
            .then(() => {
                console.log('SoundCloudService is ready');
            }).catch(error => {
                console.log(error); error
                throw new Error('Unable to get access tokens');
            });
    }

    private setExpiryDate = (expiresIn: number): string => {
        const now = new Date();
        now.setSeconds(now.getSeconds() + expiresIn);
        const expiration = now.toISOString();
        return expiration;
    }

    private getTokens = async (): Promise<void> => {
        try {
            const response: AxiosResponse = await axios({
                method: 'POST',
                url: 'https://api.soundcloud.com/oauth2/token',
                timeout: 60000,
                headers: {
                    'accept': 'application/json; charset=utf-8',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: qs.stringify({
                    'grant_type': 'client_credentials',
                    'client_id': process.env.SOUNDCLOUD_CLIENT_ID,
                    'client_secret': process.env.SOUNDCLOUD_CLIENT_SECRET
                }),
            });

            const data: GetTokenResponse = response.data;

            process.env.ACCESS_TOKEN = data.access_token;
            process.env.REFRESH_TOKEN = data.refresh_token;
            process.env.EXPIRES_IN = this.setExpiryDate(data.expires_in)
        } catch (error) {
            throw new Error('Unable to get access tokens');
        }
    }

    private refreshTokens = async (): Promise<void> => {
        try {
            const response: AxiosResponse = await axios({
                method: 'POST',
                url: 'https://api.soundcloud.com/oauth2/token',
                timeout: 60000,
                headers: {
                    'accept': 'application/json; charset=utf-8',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: qs.stringify({
                    'grant_type': 'refresh_token',
                    'client_id': process.env.SOUNDCLOUD_CLIENT_ID,
                    'client_secret': process.env.SOUNDCLOUD_CLIENT_SECRET,
                    'refresh_token': process.env.REFRESH_TOKEN
                }),
            });

            const data: GetTokenResponse = response.data;

            process.env.ACCESS_TOKEN = data.access_token;
            process.env.REFRESH_TOKEN = data.refresh_token;
            process.env.EXPIRES_IN = this.setExpiryDate(data.expires_in)
        } catch (error) {
            throw new Error('Unable to fresh tokens');
        }
    }

    public getPlaylist = async (_req: Request, res: Response, _next: NextFunction): Promise<Response<ETPlaylist[]>> => {

        const cache_playlist: ETPlaylist[] | undefined = cache.get('playlist');

        if (cache_playlist) {
            res.status(200);
            return res.json(cache_playlist);
        }

        let response: AxiosResponse;

        try {
            response = await axios({
                method: 'GET',
                url: `https://api.soundcloud.com/playlists/1064225653?show_tracks=true`,
                timeout: 60000,
                headers: {
                    'accept': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
                }
            });
        } catch (error) {
            throw new Error('Unable to fetch playlist from SoundCloud');
        }

        const playlist: SCPlaylist = response.data;
        const tracks: Track[] = playlist.tracks;

        const ETPlaylist: ETPlaylist[] = tracks.map((track: Track, i: number) => {
            return {
                id: i,
                stream_id: track.id,
                title: track.title,
                cover: track.artwork_url.replace('large', 't500x500'),
                duration: track.duration,
            }
        })

        cache.set('playlist', ETPlaylist, 864000);

        res.status(200);
        return res.json(ETPlaylist);
    }

    public getStream = async (req: Request, res: Response, _next: NextFunction): Promise<Response<AxiosResponse>> => {

        const trackId = req.params.id;
        let response: AxiosResponse;

        try {
            response = await axios({
                method: 'GET',
                responseType: 'stream',
                url: `https://api.soundcloud.com/tracks/${trackId}/stream`,
                timeout: 60000,
                headers: {
                    'accept': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
                }
            });
        } catch (error) {
            throw new Error(`Unable to get stream ${trackId} from SoundCloud`);
        }

        return response.data.pipe(res);
    }

    public checkTokens = async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
        const now = new Date().toISOString();
        if (process.env?.expires_in && now > process.env.expires_in) {
            await this.refreshTokens();
        }
        next();
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
    stream_id: number,
    title: string;
    cover: string;
    duration: number;
}

export interface ISoundCloudService {
    getPlaylist(req: Request, res: Response, _next: NextFunction): Promise<Response<ETPlaylist[]>>
    getStream(req: Request, res: Response, _next: NextFunction): Promise<Response<AxiosResponse>>
    checkTokens(req: Request, res: Response, next: NextFunction): Promise<void>
}

export default SoundCloudService