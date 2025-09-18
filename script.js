document.addEventListener('DOMContentLoaded', () => {
    // --- Game Configuration ---
    const CARD_VALUES = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };
    const SUITS = ['♥', '♦', '♣', '♠']; // Using symbols for cleaner display
    const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const CHIP_DENOMINATIONS = [20, 30, 50, 100, 300, 1000, 3000, 5000];
    const PAYOUTS = { dragon: 1, tiger: 1, tie: 8 };

    // --- Game State ---
    let playerBalance = 10000;
    let deck = [];
    let currentBets = { dragon: 0, tie: 0, tiger: 0 };
    let selectedChip = null;
    let totalStaked = 0;

    // --- DOM Elements ---
    const balanceDisplay = document.getElementById('balance-display');
    const totalBetDisplay = document.getElementById('total-bet-display');
    const messageDisplay = document.getElementById('message-display');
    const dragonCardDisplay = document.getElementById('dragon-card');
    const tigerCardDisplay = document.getElementById('tiger-card');
    const dragonBetDisplay = document.getElementById('dragon-bet-display');
    const tieBetDisplay = document.getElementById('tie-bet-display');
    const tigerBetDisplay = document.getElementById('tiger-bet-display');
    const dealBtn = document.getElementById('deal-btn');
    const resetBtn = document.getElementById('reset-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const chipRail = document.getElementById('chip-rail');
    const dragonBox = document.getElementById('dragon-box');
    const tieBox = document.getElementById('tie-box');
    const tigerBox = document.getElementById('tiger-box');

    // --- Game Functions ---
    const createDeck = () => RANKS.flatMap(rank => SUITS.map(suit => ({ rank, suit })));

    const shuffleDeck = (deck) => {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    };

    const updateDisplay = () => {
        balanceDisplay.textContent = `$${playerBalance}`;
        totalBetDisplay.textContent = `$${totalStaked}`;
        dragonBetDisplay.textContent = `$${currentBets.dragon}`;
        tieBetDisplay.textContent = `$${currentBets.tie}`;
        tigerBetDisplay.textContent = `$${currentBets.tiger}`;
    };

    const createChips = () => {
        CHIP_DENOMINATIONS.forEach(amount => {
            const chip = document.createElement('div');
            chip.classList.add('chip');
            chip.dataset.value = amount;
            chip.textContent = amount >= 1000 ? `${amount/1000}k` : amount;
            chip.addEventListener('click', () => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
                chip.classList.add('selected');
                selectedChip = amount;
            });
            chipRail.appendChild(chip);
        });
    };
    
    const placeBet = (betType) => {
        if (!selectedChip) {
            alert("Please select a chip first!");
            return;
        }
        if (selectedChip > playerBalance) {
            alert("Not enough balance for this bet!");
            return;
        }

        playerBalance -= selectedChip;
        currentBets[betType] += selectedChip;
        totalStaked += selectedChip;
        updateDisplay();
    };

    const resetBets = () => {
        playerBalance += totalStaked;
        totalStaked = 0;
        currentBets = { dragon: 0, tie: 0, tiger: 0 };
        updateDisplay();
    };

    const nextRound = () => {
        resetBets();
        dragonCardDisplay.textContent = '';
        tigerCardDisplay.textContent = '';
        messageDisplay.textContent = 'Place your bets!';
        
        dealBtn.style.display = 'inline-block';
        resetBtn.style.display = 'inline-block';
        playAgainBtn.style.display = 'none';

        dragonBox.style.borderColor = 'rgba(255, 255, 255, 0.7)';
        tigerBox.style.borderColor = 'rgba(255, 255, 255, 0.7)';
        tieBox.style.borderColor = 'rgba(255, 255, 255, 0.7)';
        
        dealBtn.disabled = false;
        resetBtn.disabled = false;
    };

    const deal = () => {
        if (totalStaked === 0) {
            alert("You must place a bet to deal.");
            return;
        }
        
        dealBtn.disabled = true;
        resetBtn.disabled = true;

        if (deck.length < 10) {
            deck = shuffleDeck(createDeck());
        }

        const dragonCard = deck.pop();
        const tigerCard = deck.pop();

        dragonCardDisplay.textContent = `${dragonCard.rank}${dragonCard.suit}`;
        tigerCardDisplay.textContent = `${tigerCard.rank}${tigerCard.suit}`;

        const dragonValue = CARD_VALUES[dragonCard.rank];
        const tigerValue = CARD_VALUES[tigerCard.rank];

        let winnings = 0;
        let isTie = dragonValue === tigerValue;
        
        if (isTie) {
            messageDisplay.textContent = "TIE!";
            winnings += currentBets.tie * PAYOUTS.tie;
            playerBalance += currentBets.tie; // Return original tie bet
            playerBalance += currentBets.dragon / 2; // Return half for tie
            playerBalance += currentBets.tiger / 2; // Return half for tie
            if (currentBets.tie > 0) tieBox.style.borderColor = '#ffdd00';
        } else if (dragonValue > tigerValue) {
            messageDisplay.textContent = "DRAGON WINS!";
            winnings += currentBets.dragon * PAYOUTS.dragon;
            playerBalance += currentBets.dragon; // Return original dragon bet
            if (currentBets.dragon > 0) dragonBox.style.borderColor = '#ffdd00';
        } else {
            messageDisplay.textContent = "TIGER WINS!";
            winnings += currentBets.tiger * PAYOUTS.tiger;
            playerBalance += currentBets.tiger; // Return original tiger bet
            if (currentBets.tiger > 0) tigerBox.style.borderColor = '#ffdd00';
        }
        
        playerBalance += winnings;
        updateDisplay();
        
        dealBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        playAgainBtn.style.display = 'inline-block';
        
        if(playerBalance <= 0) {
            messageDisplay.textContent = "Game Over! You're out of money.";
            playAgainBtn.disabled = true;
        }
    };
    
    // --- Initial Game Setup ---
    function initializeGame() {
        deck = shuffleDeck(createDeck());
        createChips();
        updateDisplay();

        // Add event listeners
        dragonBox.addEventListener('click', () => placeBet('dragon'));
        tieBox.addEventListener('click', () => placeBet('tie'));
        tigerBox.addEventListener('click', () => placeBet('tiger'));
        dealBtn.addEventListener('click', deal);
        resetBtn.addEventListener('click', resetBets);
        playAgainBtn.addEventListener('click', nextRound);
    }
    
    initializeGame();
});
