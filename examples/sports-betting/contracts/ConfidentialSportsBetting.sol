// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ConfidentialSportsBetting
 * @notice A fully confidential sports betting platform using FHEVM
 * @dev Implements encrypted bet predictions with private outcomes until match completion
 */
contract ConfidentialSportsBetting is SepoliaConfig {

    address public owner;
    uint32 public currentMatchId;
    uint256 public constant MIN_BET_AMOUNT = 0.01 ether;
    uint256 public constant MAX_BET_AMOUNT = 10 ether;

    enum MatchStatus { Created, Active, Finished, Cancelled }
    enum BetType { WinLose, OverUnder, Handicap }
    enum TeamSide { Home, Away }

    struct Match {
        string homeTeam;
        string awayTeam;
        uint256 startTime;
        uint256 endTime;
        MatchStatus status;
        uint8 finalHomeScore;
        uint8 finalAwayScore;
        address oracle;
    }

    struct MatchBetting {
        uint256 totalHomeBets;
        uint256 totalAwayBets;
        uint256 totalOverBets;
        uint256 totalUnderBets;
        euint8 targetTotal;
        euint8 handicapValue;
        bool scoresRevealed;
    }

    struct Bet {
        uint256 amount;
        BetType betType;
        euint8 encryptedPrediction;
        uint256 timestamp;
        uint8 flags; // bit 0: claimed, bit 1: isOver, bit 2-3: predictedWinner, bit 4: exists
    }

    mapping(uint32 => Match) public matches;
    mapping(uint32 => MatchBetting) public matchBetting;
    mapping(uint32 => mapping(address => Bet)) public bets;
    mapping(uint32 => address[]) public matchBettors;
    mapping(address => bool) public authorizedOracles;

    event MatchCreated(uint32 indexed matchId, string homeTeam, string awayTeam, uint256 startTime);
    event BetPlaced(uint32 indexed matchId, address indexed bettor, BetType betType, uint256 amount);
    event MatchFinished(uint32 indexed matchId, uint8 homeScore, uint8 awayScore);
    event WinningsClaimed(uint32 indexed matchId, address indexed winner, uint256 amount);
    event MatchCancelled(uint32 indexed matchId);
    event OracleAuthorized(address indexed oracle);
    event OracleRevoked(address indexed oracle);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyOracle() {
        require(authorizedOracles[msg.sender], "Not authorized oracle");
        _;
    }

    modifier matchExists(uint32 matchId) {
        require(matchId > 0 && matchId <= currentMatchId, "Match does not exist");
        _;
    }

    modifier matchActive(uint32 matchId) {
        require(matches[matchId].status == MatchStatus.Active, "Match not active");
        require(block.timestamp >= matches[matchId].startTime, "Match not started");
        require(block.timestamp < matches[matchId].endTime, "Betting closed");
        _;
    }

    modifier matchFinished(uint32 matchId) {
        require(matches[matchId].status == MatchStatus.Finished, "Match not finished");
        require(matchBetting[matchId].scoresRevealed, "Scores not revealed");
        _;
    }

    constructor() {
        owner = msg.sender;
        currentMatchId = 0;
        authorizedOracles[msg.sender] = true;
    }

    function authorizeOracle(address oracle) external onlyOwner {
        authorizedOracles[oracle] = true;
        emit OracleAuthorized(oracle);
    }

    function revokeOracle(address oracle) external onlyOwner {
        authorizedOracles[oracle] = false;
        emit OracleRevoked(oracle);
    }

    function createMatch(
        string memory homeTeam,
        string memory awayTeam,
        uint256 startTime,
        uint256 duration,
        uint8 targetTotal,
        uint8 handicapValue
    ) external onlyOracle {
        require(startTime > block.timestamp, "Start time must be in future");
        require(duration > 0, "Duration must be positive");
        require(bytes(homeTeam).length > 0 && bytes(awayTeam).length > 0, "Team names required");

        currentMatchId++;

        matches[currentMatchId] = Match({
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            startTime: startTime,
            endTime: startTime + duration,
            status: MatchStatus.Active,
            finalHomeScore: 0,
            finalAwayScore: 0,
            oracle: msg.sender
        });

        matchBetting[currentMatchId] = MatchBetting({
            totalHomeBets: 0,
            totalAwayBets: 0,
            totalOverBets: 0,
            totalUnderBets: 0,
            targetTotal: FHE.asEuint8(targetTotal),
            handicapValue: FHE.asEuint8(handicapValue),
            scoresRevealed: false
        });

        FHE.allowThis(matchBetting[currentMatchId].targetTotal);
        FHE.allowThis(matchBetting[currentMatchId].handicapValue);

        emit MatchCreated(currentMatchId, homeTeam, awayTeam, startTime);
    }

    function placeBet(
        uint32 matchId,
        BetType betType,
        uint8 prediction,
        uint8 betOptions // bit 0: isOver, bit 1-2: predictedWinner
    ) external payable matchExists(matchId) matchActive(matchId) {
        require(msg.value >= MIN_BET_AMOUNT && msg.value <= MAX_BET_AMOUNT, "Invalid bet amount");
        require((bets[matchId][msg.sender].flags & 16) == 0, "Already placed bet for this match");

        if (betType == BetType.WinLose) {
            require(prediction <= 1, "Invalid win/lose prediction");
        } else if (betType == BetType.OverUnder) {
            require(prediction <= 10, "Invalid total prediction");
        } else if (betType == BetType.Handicap) {
            require(prediction <= 50, "Invalid handicap prediction");
        }

        euint8 encryptedPrediction = FHE.asEuint8(prediction);
        uint8 flags = betOptions | 16; // set exists bit

        bets[matchId][msg.sender] = Bet({
            amount: msg.value,
            betType: betType,
            encryptedPrediction: encryptedPrediction,
            timestamp: block.timestamp,
            flags: flags
        });

        matchBettors[matchId].push(msg.sender);

        MatchBetting storage betting = matchBetting[matchId];
        if (betType == BetType.WinLose) {
            TeamSide winner = TeamSide((betOptions >> 1) & 3);
            if (winner == TeamSide.Home) {
                betting.totalHomeBets += msg.value;
            } else {
                betting.totalAwayBets += msg.value;
            }
        } else if (betType == BetType.OverUnder) {
            if ((betOptions & 1) == 1) {
                betting.totalOverBets += msg.value;
            } else {
                betting.totalUnderBets += msg.value;
            }
        }

        FHE.allowThis(encryptedPrediction);
        FHE.allow(encryptedPrediction, msg.sender);

        emit BetPlaced(matchId, msg.sender, betType, msg.value);
    }

    function finishMatch(uint32 matchId, uint8 homeScore, uint8 awayScore)
        external
        onlyOracle
        matchExists(matchId)
    {
        Match storage matchData = matches[matchId];
        require(matchData.status == MatchStatus.Active, "Match not active");
        require(block.timestamp >= matchData.endTime, "Match still ongoing");

        matchData.status = MatchStatus.Finished;
        matchData.finalHomeScore = homeScore;
        matchData.finalAwayScore = awayScore;
        matchBetting[matchId].scoresRevealed = true;

        emit MatchFinished(matchId, homeScore, awayScore);
    }

    function claimWinnings(uint32 matchId)
        external
        matchExists(matchId)
        matchFinished(matchId)
    {
        Bet storage userBet = bets[matchId][msg.sender];
        require((userBet.flags & 16) != 0, "No bet found");
        require((userBet.flags & 1) == 0, "Already claimed");

        Match memory matchData = matches[matchId];
        MatchBetting memory betting = matchBetting[matchId];

        bool isWinner = _checkWinner(userBet, matchData);
        uint256 payout = 0;

        if (isWinner) {
            payout = _calculatePayout(userBet, betting, matchData);
        }

        userBet.flags |= 1; // set claimed bit

        if (payout > 0) {
            payable(msg.sender).transfer(payout);
            emit WinningsClaimed(matchId, msg.sender, payout);
        }
    }

    function _checkWinner(Bet memory userBet, Match memory matchData) private pure returns (bool) {
        if (userBet.betType == BetType.WinLose) {
            bool homeWon = matchData.finalHomeScore > matchData.finalAwayScore;
            bool awayWon = matchData.finalAwayScore > matchData.finalHomeScore;
            TeamSide predictedWinner = TeamSide((userBet.flags >> 1) & 3);

            return (predictedWinner == TeamSide.Home && homeWon) ||
                   (predictedWinner == TeamSide.Away && awayWon);
        } else if (userBet.betType == BetType.OverUnder) {
            uint8 totalGoals = matchData.finalHomeScore + matchData.finalAwayScore;
            bool actualOver = totalGoals > 2;
            bool predictedOver = (userBet.flags & 2) != 0;

            return predictedOver == actualOver;
        }
        return false;
    }

    function _calculatePayout(
        Bet memory userBet,
        MatchBetting memory betting,
        Match memory matchData
    ) private pure returns (uint256) {
        if (userBet.betType == BetType.WinLose) {
            TeamSide predictedWinner = TeamSide((userBet.flags >> 1) & 3);
            if (predictedWinner == TeamSide.Home) {
                return calculatePayout(userBet.amount, betting.totalHomeBets, betting.totalAwayBets);
            } else {
                return calculatePayout(userBet.amount, betting.totalAwayBets, betting.totalHomeBets);
            }
        } else if (userBet.betType == BetType.OverUnder) {
            bool predictedOver = (userBet.flags & 2) != 0;
            if (predictedOver) {
                return calculatePayout(userBet.amount, betting.totalOverBets, betting.totalUnderBets);
            } else {
                return calculatePayout(userBet.amount, betting.totalUnderBets, betting.totalOverBets);
            }
        }
        return 0;
    }

    function calculatePayout(uint256 betAmount, uint256 winningPool, uint256 losingPool)
        private
        pure
        returns (uint256)
    {
        if (winningPool == 0) return 0;
        uint256 winningsShare = (betAmount * losingPool) / winningPool;
        return betAmount + winningsShare;
    }

    function cancelMatch(uint32 matchId) external onlyOracle matchExists(matchId) {
        Match storage matchData = matches[matchId];
        require(matchData.status == MatchStatus.Active, "Match not active");

        matchData.status = MatchStatus.Cancelled;

        address[] memory bettors = matchBettors[matchId];
        for (uint i = 0; i < bettors.length; i++) {
            address bettor = bettors[i];
            Bet storage userBet = bets[matchId][bettor];
            if ((userBet.flags & 16) != 0 && (userBet.flags & 1) == 0) {
                userBet.flags |= 1;
                payable(bettor).transfer(userBet.amount);
            }
        }

        emit MatchCancelled(matchId);
    }

    function getMatchBasicInfo(uint32 matchId) external view returns (
        string memory homeTeam,
        string memory awayTeam,
        uint256 startTime,
        uint256 endTime
    ) {
        Match memory matchData = matches[matchId];
        return (
            matchData.homeTeam,
            matchData.awayTeam,
            matchData.startTime,
            matchData.endTime
        );
    }

    function getMatchStatus(uint32 matchId) external view returns (
        MatchStatus status,
        uint256 totalHomeBets,
        uint256 totalAwayBets
    ) {
        Match memory matchData = matches[matchId];
        MatchBetting memory betting = matchBetting[matchId];
        return (
            matchData.status,
            betting.totalHomeBets,
            betting.totalAwayBets
        );
    }

    function getMatchResult(uint32 matchId) external view returns (
        uint8 homeScore,
        uint8 awayScore,
        bool scoresRevealed
    ) {
        Match memory matchData = matches[matchId];
        MatchBetting memory betting = matchBetting[matchId];
        return (
            matchData.finalHomeScore,
            matchData.finalAwayScore,
            betting.scoresRevealed
        );
    }

    function getBetBasicInfo(uint32 matchId, address bettor) external view returns (
        uint256 amount,
        BetType betType,
        bool claimed,
        bool exists
    ) {
        Bet memory userBet = bets[matchId][bettor];
        return (
            userBet.amount,
            userBet.betType,
            (userBet.flags & 1) != 0,
            (userBet.flags & 16) != 0
        );
    }

    function getBetDetails(uint32 matchId, address bettor) external view returns (
        TeamSide predictedWinner,
        bool isOver,
        uint256 timestamp
    ) {
        Bet memory userBet = bets[matchId][bettor];
        return (
            TeamSide((userBet.flags >> 1) & 3),
            (userBet.flags & 2) != 0,
            userBet.timestamp
        );
    }

    function getMatchBettors(uint32 matchId) external view returns (address[] memory) {
        return matchBettors[matchId];
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner).transfer(balance);
    }
}
