export function parseJWT(jwt) {
    try {
        const base64 = jwt.split('.')[1];
        const entity = JSON.parse(atob(base64));
        return {
            identity: entity['jti'],
            serverCapabilities: JSON.parse(entity['sub'])
        }
    } catch (err) {
        console.error(err);
    }
}

export const UserCredentials = {
    email: 'roger.hoesl@gmail.com',
    pass: 'Katze123',
    nickname: 'Sugar Ray Shumway'
};