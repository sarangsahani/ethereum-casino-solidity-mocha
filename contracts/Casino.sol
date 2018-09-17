pragma solidity ^0.4.17;

contract Casino{
    address public gameManager;
    address[] public participants;
    
    function Casino() public{
        gameManager = msg.sender;
    }
    
    function random() public view returns(uint){
        return uint(keccak256(block.difficulty, now, participants));
    }
    
    function enter() public payable noCasinoManager{
        require(msg.value > 0.01 ether);
        participants.push(msg.sender);
    }
    
    function getParticipants() public view returns(address[]){
        return participants;
    }
    
    function pickWinner() public restricted(){
        uint index = random() % participants.length;
        participants[index].transfer(this.balance);
        participants = new address[](0);
    }
    
    modifier restricted(){
        require(msg.sender == gameManager);
        _;
    }
    
    modifier noCasinoManager(){
        require(msg.sender != gameManager);
        _;
    }
    
    

    
    
}