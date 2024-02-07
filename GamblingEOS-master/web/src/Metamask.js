import { throws } from 'assert';

export class Metamask {

    constructor() {
        this.init();
    }

    async init() {
        this.ethereum = window.ethereum;
        this.Web3 = window.Web3;
        this.AbiDecoder = require('abi-decoder');
        this.contract = require('./YungBet.json');
        this.contractInfo = require('./tx.info.json');

        this.txs = [];
        this.bets = [];

        this.AbiDecoder.addABI(this.contract.abi);

        if (this.ethereum) {
            this.web3 = new this.Web3(this.ethereum);
            this.contract = this.web3.eth.contract(this.contract.abi).at(this.contractInfo.address);

            try {
                await this.ethereum.enable();
                this.userAddress = this.web3.eth.accounts[0];
                this.loaded = true;
                this.hasMetamask = true;
            } catch (error) {
                this.loaded = false;
                this.hasMetamask = true;
            }
        } else if (window.web3) {
            this.web3 = new this.Web3(this.web3.currentProvider);
            this.contract = this.web3.eth.contract(this.contract.abi).at(this.contractInfo.address);
            this.userAddress = this.web3.eth.accounts[0];
        } else {
            this.loaded = false;
            this.hasMetamask = false;
        }
    }

    makeBet() {
        if (this.loaded && this.hasMetamask) {
            this.contract.makeBet(
                {
                    from: this.user,
                    value: this.web3.toWei(0.1),
                },
                (err, res) => {
                    if (err) console.error(err);
                }
            );
        }
    }

    logBets() {
        this.contract.betPlaced((error, result) => {
            if (error) {
                console.error(error);
                this.error = error;
            } else {
                this.error = null;
                const bet = {
                    address: result.address.substr(0,8) + '...',
                    bet_payout: this.web3.fromWei(result.args.bet_payout ? result.args.bet_payout.toNumber() : 0),
                    bet_amount: this.web3.fromWei(result.args.bet_amount.toNumber()),
                    bet_roll: result.args.bet_roll ? result.args.bet_roll.toNumber() : 0,
                };

                this.bets.unshift(bet);

                console.log('new bet', bet);
            }
        });
    }

    getTransaction(hash) {
        this.web3.eth.getTransaction(hash, (error, result) => {
          if (error) {
            console.error(error);
          } else {
            const inputs = this.AbiDecoder.decodeMethod(result.input);
            const cost = this.web3.fromWei(result.value.toNumber());

            this.txs.push({
              blockNumber: result.blockNumber,
              address: result.from,
              inputs,
              cost
            });
          }
        });
      }

}

const metamask = new Metamask();
metamask.init();
metamask.logBets();

export { metamask };
