// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract DisasterResponseMining {
    
    struct DisasterZone {
        uint256 id;
        string location;
        uint256 latitude;
        uint256 longitude;
        uint256 radius; // in meters
        uint256 rewardPerHour;
        bool isActive;
        uint256 totalFundsAllocated;
        uint256 remainingFunds;
    }
    
    struct Responder {
        address responderAddress;
        uint256 totalHoursMined;
        uint256 totalRewardsEarned;
        bool isVerified;
        string credentialHash;
    }
    
    struct LocationProof {
        address responder;
        uint256 disasterZoneId;
        uint256 timestamp;
        uint256 latitude;
        uint256 longitude;
        bool isVerified;
        uint256 rewardClaimed;
    }
    
    mapping(uint256 => DisasterZone) public disasterZones;
    mapping(address => Responder) public responders;
    mapping(uint256 => LocationProof) public locationProofs;
    mapping(address => uint256[]) public responderProofs;
    
    uint256 public nextDisasterZoneId = 1;
    uint256 public nextProofId = 1;
    address public owner;
    uint256 public minStakeAmount = 0.1 ether;
    
    event DisasterZoneCreated(uint256 indexed zoneId, string location, uint256 rewardPerHour);
    event LocationProofSubmitted(uint256 indexed proofId, address indexed responder, uint256 indexed zoneId);
    event RewardClaimed(address indexed responder, uint256 amount);
    event ResponderVerified(address indexed responder);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function createDisasterZone(
        string memory _location,
        uint256 _latitude,
        uint256 _longitude,
        uint256 _radius,
        uint256 _rewardPerHour
    ) external payable onlyOwner {
        require(msg.value > 0, "Must provide funds for disaster zone");
        
        disasterZones[nextDisasterZoneId] = DisasterZone({
            id: nextDisasterZoneId,
            location: _location,
            latitude: _latitude,
            longitude: _longitude,
            radius: _radius,
            rewardPerHour: _rewardPerHour,
            isActive: true,
            totalFundsAllocated: msg.value,
            remainingFunds: msg.value
        });
        
        emit DisasterZoneCreated(nextDisasterZoneId, _location, _rewardPerHour);
        nextDisasterZoneId++;
    }
    
    function registerResponder(string memory _credentialHash) external payable {
        require(msg.value >= minStakeAmount, "Insufficient stake amount");
        require(!responders[msg.sender].isVerified, "Responder already registered");
        
        responders[msg.sender] = Responder({
            responderAddress: msg.sender,
            totalHoursMined: 0,
            totalRewardsEarned: 0,
            isVerified: false,
            credentialHash: _credentialHash
        });
    }
    
    function verifyResponder(address _responder) external onlyOwner {
        require(responders[_responder].responderAddress == _responder, "Responder not registered");
        responders[_responder].isVerified = true;
        emit ResponderVerified(_responder);
    }
    
    function submitLocationProof(
        uint256 _disasterZoneId,
        uint256 _latitude,
        uint256 _longitude
    ) external {
        require(responders[msg.sender].isVerified, "Responder not verified");
        require(disasterZones[_disasterZoneId].isActive, "Disaster zone not active");
        require(_isWithinZone(_disasterZoneId, _latitude, _longitude), "Location not within disaster zone");
        
        locationProofs[nextProofId] = LocationProof({
            responder: msg.sender,
            disasterZoneId: _disasterZoneId,
            timestamp: block.timestamp,
            latitude: _latitude,
            longitude: _longitude,
            isVerified: true,
            rewardClaimed: 0
        });
        
        responderProofs[msg.sender].push(nextProofId);
        
        emit LocationProofSubmitted(nextProofId, msg.sender, _disasterZoneId);
        nextProofId++;
    }
    
    function claimRewards(uint256[] memory _proofIds) external {
        uint256 totalReward = 0;
        
        for (uint256 i = 0; i < _proofIds.length; i++) {
            uint256 proofId = _proofIds[i];
            LocationProof storage proof = locationProofs[proofId];
            
            require(proof.responder == msg.sender, "Not your proof");
            require(proof.rewardClaimed == 0, "Reward already claimed");
            require(proof.isVerified, "Proof not verified");
            
            uint256 hoursSpent = _calculateHoursSpent(proofId);
            uint256 reward = hoursSpent * disasterZones[proof.disasterZoneId].rewardPerHour;
            
            require(disasterZones[proof.disasterZoneId].remainingFunds >= reward, "Insufficient funds in disaster zone");
            
            proof.rewardClaimed = reward;
            disasterZones[proof.disasterZoneId].remainingFunds -= reward;
            responders[msg.sender].totalRewardsEarned += reward;
            responders[msg.sender].totalHoursMined += hoursSpent;
            
            totalReward += reward;
        }
        
        require(totalReward > 0, "No rewards to claim");
        payable(msg.sender).transfer(totalReward);
        
        emit RewardClaimed(msg.sender, totalReward);
    }
    
    function _isWithinZone(uint256 _zoneId, uint256 _lat, uint256 _lng) internal view returns (bool) {
        DisasterZone storage zone = disasterZones[_zoneId];
        // Simplified distance calculation (in real implementation, use proper haversine formula)
        uint256 latDiff = _lat > zone.latitude ? _lat - zone.latitude : zone.latitude - _lat;
        uint256 lngDiff = _lng > zone.longitude ? _lng - zone.longitude : zone.longitude - _lng;
        
        // Rough approximation - in production, implement proper GPS distance calculation
        return (latDiff + lngDiff) <= zone.radius;
    }
    
    function _calculateHoursSpent(uint256 _proofId) internal pure returns (uint256) {
        // Simplified calculation - assume 1 hour per proof
        // In real implementation, calculate based on consecutive proofs and time intervals
        _proofId; // Silence unused parameter warning
        return 1;
    }
    
    function getDisasterZone(uint256 _zoneId) external view returns (DisasterZone memory) {
        return disasterZones[_zoneId];
    }
    
    function getResponderProofs(address _responder) external view returns (uint256[] memory) {
        return responderProofs[_responder];
    }
}
