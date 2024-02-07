let YungBet = artifacts.require('YungBet');
let fs = require('fs');
let path = require('path');

module.exports = (deployer) => {
    deployer.deploy(YungBet).then(info => {
        let address = info.address;
        let transaction = info.transactionHash;

        let file = JSON.stringify({
            address,
            transaction
        }, null, 2);

        fs.writeFileSync(
            path.join(__dirname, '..', '..', 'web', 'src', 'tx.info.json'),
            file,
            'UTF-8'
        );

        fs.copyFileSync(
            path.join(__dirname, '..', 'build', 'contracts', 'YungBet.json'),
            path.join(__dirname, '..', '..', 'web', 'src', 'YungBet.json')
        )
    });
}
