const ARTIST_ID = '1eaUcKK9BLeYVEA004CyKi';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const RELEASES_URL = `https://api.spotify.com/v1/artists/${ARTIST_ID}/albums`;

const json = (response, statusCode, data) => {
    response.statusCode = statusCode;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    response.end(JSON.stringify(data));
};

module.exports = async function handler(request, response) {
    if (request.method !== 'GET') {
        json(response, 405, { error: 'Method not allowed' });
        return;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        json(response, 500, { error: 'Spotify credentials are not configured.' });
        return;
    }

    try {
        const tokenResponse = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        if (!tokenResponse.ok) {
            json(response, tokenResponse.status, { error: 'Unable to authenticate with Spotify.' });
            return;
        }

        const tokenData = await tokenResponse.json();
        const releasesResponse = await fetch(`${RELEASES_URL}?include_groups=single,album&market=US&limit=20`, {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        if (!releasesResponse.ok) {
            json(response, releasesResponse.status, { error: 'Unable to load Spotify releases.' });
            return;
        }

        const releasesData = await releasesResponse.json();
        const seen = new Set();
        const releases = releasesData.items
            .filter((item) => {
                const key = `${item.name}-${item.release_date}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .map((item) => ({
                id: item.id,
                title: item.name,
                artists: item.artists.map((artist) => artist.name).join(', '),
                type: item.album_type,
                releaseDate: item.release_date,
                totalTracks: item.total_tracks,
                image: item.images && item.images[0] ? item.images[0].url : '',
                spotifyUrl: item.external_urls.spotify,
                embedUrl: `https://open.spotify.com/embed/album/${item.id}?utm_source=generator`,
            }));

        json(response, 200, { releases });
    } catch (error) {
        json(response, 500, { error: 'Unexpected Spotify sync error.' });
    }
};
