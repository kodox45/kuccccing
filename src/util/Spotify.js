const clientId = "54976df28de9486ba584e43f59b6000c";
const reditectUri = "https://kuccccing.surge.sh/";

let accesToken;

const Spotify = {
  getAccesToken() {
    if (accesToken) {
      return accesToken;
    }
    const accesTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accesTokenMatch && expiresInMatch) {
      accesToken = accesTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => (accesToken = ""), expiresIn * 1000);
      window.history.pushState("Acces Token", null, "/");
      return accesToken;
    } else {
      const accesUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${reditectUri}`;
      window.location = accesUrl;
    }
  },
  search(term) {
    const accesToken = Spotify.getAccesToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer  ${accesToken}`,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((jsonResponse) => {
        console.log(jsonResponse);
        if (!jsonResponse.tracks) {
          return [];
        }
        return jsonResponse.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri,
        }));
      });
  },
  savePlayList(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }
    const accesToken = Spotify.getAccesToken();
    const headers = { Authorization: `Bearer ${accesToken}` };
    let userId;

    return fetch("https://api.spotify.com/v1/me", { headers: headers })
      .then((response) => response.json())
      .then((jsonResponse) => {
        userId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
          headers: headers,
          method: "POST",
          body: JSON.stringify({ name: name }),
        })
          .then((response) => response.json())
          .then((jsonResponse) => {
            const playlistID = jsonResponse.id;
            return fetch(
              `https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`,
              {
                headers: headers,
                method: "POST",
                body: JSON.stringify({ uris: trackUris }),
              }
            );
          });
      });
  },
};
export default Spotify;
