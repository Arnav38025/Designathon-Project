// src/components/CodePlayground.jsx
'use client';

import { useState, useEffect } from 'react';
import { Code, Play, Save, Trash, Copy, Check } from 'lucide-react';

const DEFAULT_SOLIDITY_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToken {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
    }
    
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}`;

const TEMPLATES = {
  token: DEFAULT_SOLIDITY_CODE,
  auction: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleAuction {
    address payable public beneficiary;
    uint public auctionEndTime;
    
    address public highestBidder;
    uint public highestBid;
    
    mapping(address => uint) pendingReturns;
    bool ended;
    
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);
    
    constructor(uint _biddingTime, address payable _beneficiary) {
        beneficiary = _beneficiary;
        auctionEndTime = block.timestamp + _biddingTime;
    }
    
    function bid() public payable {
        require(block.timestamp <= auctionEndTime, "Auction already ended");
        require(msg.value > highestBid, "There already is a higher bid");
        
        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }
        
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }
    
    function withdraw() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            
            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }
    
    function auctionEnd() public {
        require(block.timestamp >= auctionEndTime, "Auction not yet ended");
        require(!ended, "auctionEnd has already been called");
        
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);
        
        beneficiary.transfer(highestBid);
    }
}`,
  voting: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Ballot {
    struct Voter {
        uint weight;
        bool voted;
        address delegate;
        uint vote;
    }
    
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }
    
    address public chairperson;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    
    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }
    
    function giveRightToVote(address voter) public {
        require(msg.sender == chairperson, "Only chairperson can give right to vote.");
        require(!voters[voter].voted, "The voter already voted.");
        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
    }
    
    function delegate(address to) public {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "You have no right to vote");
        require(!sender.voted, "You already voted.");
        
        require(to != msg.sender, "Self-delegation is disallowed.");
        
        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
            require(to != msg.sender, "Found loop in delegation.");
        }
        
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate_ = voters[to];
        
        if (delegate_.voted) {
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            delegate_.weight += sender.weight;
        }
    }
    
    function vote(uint proposal) public {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        
        proposals[proposal].voteCount += sender.weight;
    }
    
    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }
    
    function winnerName() public view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}`,
};

export default function CodePlayground() {
  const [isVisible, setIsVisible] = useState(false);
  const [code, setCode] = useState(DEFAULT_SOLIDITY_CODE);
  const [output, setOutput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('token');
  
  useEffect(() => {
    // Load code from localStorage if available
    const savedCode = localStorage.getItem('blockpathCode');
    if (savedCode) {
      setCode(savedCode);
    }
  }, []);
  
  const handleTemplateChange = (template) => {
    if (TEMPLATES[template]) {
      setSelectedTemplate(template);
      setCode(TEMPLATES[template]);
    }
  };
  
  const handleSaveCode = () => {
    localStorage.setItem('blockpathCode', code);
    setOutput('Code saved to browser storage.');
    setTimeout(() => {
      setOutput('');
    }, 3000);
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  
  const handleClearCode = () => {
    setCode('');
    setOutput('Code editor cleared.');
    setTimeout(() => {
      setOutput('');
    }, 3000);
  };
  
  const compileAndExecute = () => {
    // Simulate compilation and execution
    setOutput('Compiling...');
    
    setTimeout(() => {
      // Simple validation for illustrative purposes
      const errors = [];
      
      if (!code.includes('contract')) {
        errors.push('No contract definition found');
      }
      
      if (!code.includes('pragma solidity')) {
        errors.push('Missing pragma directive');
      }
      
      if (errors.length > 0) {
        setOutput(`❌ Compilation failed:\n${errors.join('\n')}`);
      } else {
        // Simulate successful compilation and deployment
        setOutput(`✅ Contract compiled successfully!\n\nDeployed to: 0x${Math.random().toString(16).substring(2, 42)}\n\nNote: This is a simulated compilation. In a real environment, this would connect to a testnet or sandbox environment.`);
      }
    }, 1500);
  };
  
  return (
    <>
      {/* Toggle Button */}
      <button
        className="fixed bottom-8 left-8 bg-blue-600 text-white p-3 rounded-full shadow-lg z-30 flex items-center justify-center hover:bg-blue-700 transition-colors"
        onClick={() => setIsVisible(!isVisible)}
      >
        <Code size={24} />
      </button>
      
      {/* Code Playground Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-700">
              <div className="flex items-center">
                <Code className="text-blue-400 mr-2" size={20} />
                <h2 className="text-white font-semibold">Smart Contract Playground</h2>
              </div>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsVisible(false)}
              >
                ✕
              </button>
            </div>
            
            {/* Template Selector */}
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex gap-2">
              <span className="text-gray-400 mr-2">Templates:</span>
              {Object.keys(TEMPLATES).map((template) => (
                <button
                  key={template}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedTemplate === template
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } transition-colors`}
                  onClick={() => handleTemplateChange(template)}
                >
                  {template.charAt(0).toUpperCase() + template.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Main Content */}
            <div className="flex-grow flex flex-col md:flex-row">
              {/* Code Editor */}
              <div className="flex-1 flex flex-col border-r border-gray-700">
                <div className="p-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Solidity Editor</span>
                  <div className="flex gap-2">
                    <button
                      className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                      onClick={handleCopyCode}
                      title="Copy code"
                    >
                      {isCopied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                    <button
                      className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                      onClick={handleSaveCode}
                      title="Save code"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                      onClick={handleClearCode}
                      title="Clear code"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
                <textarea
                  className="flex-grow p-4 bg-gray-950 text-gray-200 font-mono text-sm resize-none outline-none overflow-auto"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck="false"
                ></textarea>
              </div>
              
              {/* Output Panel */}
              <div className="flex-1 flex flex-col bg-gray-900">
                <div className="p-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Output</span>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded flex items-center hover:bg-blue-700 transition-colors"
                    onClick={compileAndExecute}
                  >
                    <Play size={16} className="mr-1" />
                    Run
                  </button>
                </div>
                <div className="flex-grow p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap overflow-auto">
                  {output || 'Click "Run" to compile and execute the smart contract.'}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-800 px-4 py-2 border-t border-gray-700 text-xs text-gray-400">
              Note: This is a simulated environment for educational purposes. Code is not executed on an actual blockchain.
            </div>
          </div>
        </div>
      )}
    </>
  );
}