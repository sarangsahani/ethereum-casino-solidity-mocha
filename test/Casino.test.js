const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const {interface, bytecode} = require ('../compile.js');

let accounts;
let casino;

beforeEach(async () => {
  // Get a list of all account
  accounts = await web3.eth.getAccounts();

  // Use one of the accounts to deploy contract
  casino = await new web3.eth.Contract(JSON.parse(interface))
          .deploy({data: bytecode})
          .send({from: accounts[0], gas: '1000000'});
});

describe('Casino', ()=>{
  // Test case-1 --> Logs the deployed address of the contract
  it('Deploys a contract', () =>{
    assert.ok(casino.options.address);
  });

  // Test case-2 --> Does not allow manager to enter the game
  it('Does not allow manager to enter', async () => {
    try{
        await casino.methods.enter().send({from: accounts[0], value: web3.utils.toWei('0.02', 'ether')});
        assert(false);
    }catch(err){
  			assert(err);
  	}
  });

  // Test case-3 --> Requires minimum amount i.e. > 0.0.1 ethers to enter the game
  it('Requires a minimum amount to enter', async() =>{
    try{
      await casino.methods.enter().send({from: accounts[1], value: 0});
      assert(false);
    }catch(err){
      assert(err);
    }
  });

  // Test case-4 --> Allows one account to enter
  it('Allows one account to enter', async() => {
  		await casino.methods.enter().send({from: accounts[1], value: web3.utils.toWei('0.02', 'ether')});

  		const participants= await casino.methods.getParticipants().call({from: accounts[1]});

  		assert.equal(accounts[1], participants[0]);
  		assert.equal(1, participants.length);
  });

  // Test case-5 --> Allows multiple accounts to enter
  it('Allows multiple account to enter', async() => {
      		await casino.methods.enter().send({from: accounts[1], value: web3.utils.toWei('0.02', 'ether')});
      		await casino.methods.enter().send({from: accounts[2], value: web3.utils.toWei('0.02', 'ether')});
      		await casino.methods.enter().send({from: accounts[3], value: web3.utils.toWei('0.02', 'ether')});

      		const participants= await casino.methods.getParticipants().call({from: accounts[0]});

      		assert.equal(accounts[1], participants[0]);
      		assert.equal(accounts[2], participants[1]);
      		assert.equal(accounts[3], participants[2]);
      		assert.equal(3, participants.length);

      	});

  // Test case-6 --> Only manager can pick winner
	it('Only manager can pick winner', async() => {
  		try{
  			await casino.methods.pickWinner().send({from: accounts[1]});
  			assert(false);
  		}catch(err){
  			assert(err);
  		}
  });

  // Test case-7 --> Sends money to winner
  it('Sends money to the winner and returns balance', async() => {
      await casino.methods.enter().send({from: accounts[1], value: web3.utils.toWei('2', 'ether')});

      const initialBalance = await web3.eth.getBalance(accounts[1]);

      await casino.methods.pickWinner().send({from: accounts[0]});

      const finalBalance = await web3.eth.getBalance(accounts[1]);
      difference = finalBalance - initialBalance;
      console.log(difference);
      assert(difference > web3.utils.toWei('1.8', 'ether'));
 });

});
