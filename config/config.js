const config = require ('config');

module.exports = function () {
    console.log('Verifying environmental variables');
    if (!config.get('UserPoolId')) {
        throw new Error('FATAL ERROR: UserPoolId not defined');
    }
    if (!config.get('ClientId')) {
        throw new Error('FATAL ERROR: ClientId not defined');
    }
    if (!config.get('PoolRegion')) {
        throw new Error('FATAL ERROR: PoolRegion not defined');
    }
    console.log('Environmental variables verified');
}