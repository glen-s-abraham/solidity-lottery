const assert = require('assert');
const ganache = require('ganache');
const { Web3 } = require('web3');


const { interface, bytecode } = require('../compile');
const web3 = new Web3(ganache.provider());

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
})


describe("Lottery contract", () => {
    it("deploys a contract", () => {
        assert.ok(lottery.options.address)
    });

    it("allows one account to enter", async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        })

        players = await lottery.methods.getPlayers().call({ from: accounts[0] });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length)
    })

    it("allows multipe account to enter", async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        })

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        })

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        })

        players = await lottery.methods.getPlayers().call({ from: accounts[0] });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length)
    })

    it("it requires a minimum amount of ether to enter", async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.0001', 'ether')
            })
            assert(false)
        } catch (err) {
            assert(err);
        }
    })

    it("it allows only manager to call pickWinner", async () => {
        try {
            await lottery.methods.pickWinner().send({ from: accounts[1] });
            assert(false)
        } catch (err) {
            assert(err);
        }
    })

    it("sends money to winner and resets the players array", async () => {
        // Player enters the lottery with 2 ether
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        // Get the initial balance of the player
        const initialBalance = BigInt(await web3.eth.getBalance(accounts[0]));

        // Pick the winner
        await lottery.methods.pickWinner().send({ from: accounts[0] });

        // Get the final balance of the player
        const finalBalance = BigInt(await web3.eth.getBalance(accounts[0]));

        // Calculate the difference in balance
        const difference = finalBalance - initialBalance;

        // Assert that the difference is greater than 1.8 ether
        assert(difference > BigInt(web3.utils.toWei('1.8', 'ether')));

        // Get the list of players after picking the winner
        const players = await lottery.methods.getPlayers().call({ from: accounts[0] });

        // Assert that the players array is reset
        assert.equal(players.length, 0);
    })
})