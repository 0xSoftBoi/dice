# Smart Contract Setup

## Running Locally

1. Install Node Dependencies:

```bash
yarn global add ganache-cli truffle
```

2. Start and keep Ganache CLI alive:

```bash
ganache-cli
```

3. Compile Solidity contracts

```bash
truffle compile
truffle deploy --network=development
```

** Will automatically place ABI and TX Info in `/web/src` **

4. Run web app

```bash
cd $ROOT/web
yarn
yarn start
```
