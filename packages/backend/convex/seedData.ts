import { mutation } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

export const seedCourses = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    // Check if courses already exist
    const existingCourses = await ctx.db.query('courses').collect();
    if (existingCourses.length > 0) {
      return { success: true, message: 'Courses already exist!' };
    }

    // Create beginner courses
    const cryptoBasicsCourse = await ctx.db.insert('courses', {
      title: 'Cryptocurrency Fundamentals',
      description:
        'Learn the basics of cryptocurrency, blockchain technology, and digital assets. Perfect for complete beginners.',
      level: 'beginner',
      category: 'Fundamentals',
      estimatedDuration: 120,
      totalLessons: 6,
      isPublished: true,
      isPreview: false,
      createdBy: userId,
    });

    const walletSecurityCourse = await ctx.db.insert('courses', {
      title: 'Wallet Security & Best Practices',
      description:
        'Master the art of keeping your crypto safe with proper wallet management and security practices.',
      level: 'beginner',
      category: 'Security',
      estimatedDuration: 90,
      totalLessons: 5,
      isPublished: true,
      isPreview: false,
      createdBy: userId,
    });

    const defiBasicsCourse = await ctx.db.insert('courses', {
      title: 'Introduction to DeFi',
      description:
        'Discover decentralized finance protocols, yield farming, and liquidity provision strategies.',
      level: 'intermediate',
      category: 'DeFi',
      estimatedDuration: 180,
      totalLessons: 8,
      isPublished: true,
      isPreview: false,
      createdBy: userId,
    });

    // Create lessons for Crypto Basics course
    await ctx.db.insert('lessons', {
      courseId: cryptoBasicsCourse,
      title: 'What is Cryptocurrency?',
      content:
        'Cryptocurrency is a digital or virtual currency that uses cryptography for security. Unlike traditional currencies issued by governments, cryptocurrencies operate on decentralized networks based on blockchain technology.\n\nKey characteristics:\n• Digital-only existence\n• Decentralized control\n• Cryptographic security\n• Peer-to-peer transactions\n• Limited supply (in most cases)',
      duration: 15,
      order: 1,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: cryptoBasicsCourse,
      title: 'Understanding Blockchain',
      content:
        'Blockchain is the underlying technology that powers cryptocurrencies. Think of it as a digital ledger that records transactions across multiple computers in a way that makes it nearly impossible to change or hack.\n\nKey concepts:\n• Blocks contain transaction data\n• Chains link blocks chronologically\n• Distributed across network nodes\n• Immutable once confirmed\n• Transparent and verifiable',
      duration: 20,
      order: 2,
      type: 'text',
      isPublished: true,
    });

    const quizLesson = await ctx.db.insert('lessons', {
      courseId: cryptoBasicsCourse,
      title: 'Crypto Basics Quiz',
      content: 'Test your understanding of cryptocurrency fundamentals.',
      duration: 10,
      order: 3,
      type: 'quiz',
      isPublished: true,
    });

    // Create quiz for the quiz lesson
    await ctx.db.insert('quizzes', {
      lessonId: quizLesson,
      questions: [
        {
          question:
            'What makes cryptocurrency different from traditional currency?',
          options: [
            "It's only available online",
            'It uses cryptography and operates on decentralized networks',
            "It's more expensive",
            'It can only be used for illegal activities',
          ],
          correctAnswer: 1,
          explanation:
            'Cryptocurrency uses cryptography for security and operates on decentralized networks, unlike traditional currencies controlled by governments.',
        },
        {
          question: 'What is a blockchain?',
          options: [
            'A type of cryptocurrency',
            'A digital wallet',
            'A distributed ledger technology',
            'A mining device',
          ],
          correctAnswer: 2,
          explanation:
            'Blockchain is a distributed ledger technology that records transactions across multiple computers in a secure and transparent way.',
        },
        {
          question:
            'Which characteristic is NOT typical of most cryptocurrencies?',
          options: [
            'Limited supply',
            'Decentralized control',
            'Government backing',
            'Cryptographic security',
          ],
          correctAnswer: 2,
          explanation:
            'Most cryptocurrencies are not backed by governments - they operate independently on decentralized networks.',
        },
      ],
      passingScore: 70,
    });

    await ctx.db.insert('lessons', {
      courseId: cryptoBasicsCourse,
      title: 'Popular Cryptocurrencies',
      content:
        'While Bitcoin was the first cryptocurrency, thousands of others now exist. Here are some of the most important ones:\n\n**Bitcoin (BTC)**\n• First and most well-known cryptocurrency\n• Digital gold and store of value\n• Limited supply of 21 million coins\n\n**Ethereum (ETH)**\n• Platform for smart contracts and dApps\n• Powers most DeFi protocols\n• Transitioning to proof-of-stake\n\n**Other Notable Coins**\n• Binance Coin (BNB) - Exchange utility token\n• Cardano (ADA) - Research-driven blockchain\n• Solana (SOL) - High-speed blockchain platform',
      duration: 25,
      order: 4,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: cryptoBasicsCourse,
      title: 'How to Buy Your First Crypto',
      content:
        "Ready to buy your first cryptocurrency? Here's a step-by-step guide:\n\n**Step 1: Choose an Exchange**\n• Coinbase (beginner-friendly)\n• Binance (advanced features)\n• Kraken (security-focused)\n\n**Step 2: Complete Verification**\n• Provide ID documents\n• Verify your identity\n• Link bank account or card\n\n**Step 3: Make Your Purchase**\n• Start small with Bitcoin or Ethereum\n• Use dollar-cost averaging\n• Never invest more than you can afford to lose\n\n**Step 4: Secure Your Investment**\n• Consider a hardware wallet\n• Enable two-factor authentication\n• Keep your private keys safe",
      duration: 30,
      order: 5,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: cryptoBasicsCourse,
      title: 'Final Assessment',
      content:
        'Complete this comprehensive quiz to test your cryptocurrency knowledge.',
      duration: 15,
      order: 6,
      type: 'quiz',
      isPublished: true,
    });

    // Create lessons for Wallet Security course
    await ctx.db.insert('lessons', {
      courseId: walletSecurityCourse,
      title: 'Types of Crypto Wallets',
      content:
        "Understanding different wallet types is crucial for crypto security:\n\n**Hot Wallets (Connected to Internet)**\n• Mobile apps (Trust Wallet, MetaMask)\n• Desktop software\n• Web wallets\n• Convenient but less secure\n\n**Cold Wallets (Offline Storage)**\n• Hardware wallets (Ledger, Trezor)\n• Paper wallets\n• Air-gapped computers\n• More secure but less convenient\n\n**Custodial vs Non-Custodial**\n• Custodial: Exchange controls keys\n• Non-custodial: You control keys\n• Remember: 'Not your keys, not your crypto'",
      duration: 20,
      order: 1,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: walletSecurityCourse,
      title: 'Private Keys and Seed Phrases',
      content:
        "Your private keys and seed phrases are the most important aspects of crypto security:\n\n**Private Keys**\n• Mathematical proof of ownership\n• Never share with anyone\n• Required to sign transactions\n• If lost, funds are gone forever\n\n**Seed Phrases (Recovery Phrases)**\n• 12-24 word backup of your wallet\n• Can restore access to all your crypto\n• Write down on paper, never digital\n• Store in multiple secure locations\n\n**Best Practices**\n• Never take screenshots\n• Don't store in cloud services\n• Use metal backup plates for durability\n• Test recovery process with small amounts",
      duration: 25,
      order: 2,
      type: 'text',
      isPublished: true,
    });

    return {
      success: true,
      message: 'Sample courses and preview courses created successfully!',
    };
  },
});

export const seedPreviewCourses = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if preview courses already exist
    const existingPreviewCourses = await ctx.db
      .query('courses')
      .withIndex('by_preview', (q) => q.eq('isPreview', true))
      .collect();

    if (existingPreviewCourses.length > 0) {
      return { success: true, message: 'Preview courses already exist!' };
    }

    // Create a sample teacher user for preview courses
    const sampleTeacherId = await ctx.db.insert('users', {
      name: 'Sample Teacher',
      email: 'teacher@cryptalearn.com',
    });

    // Create preview courses with one lesson each
    const bitcoinPreview = await ctx.db.insert('courses', {
      title: 'What is Bitcoin? (Free Preview)',
      description:
        "A comprehensive introduction to Bitcoin, the world's first cryptocurrency. Learn about its history, technology, and why it matters.",
      level: 'beginner',
      category: 'Fundamentals',
      estimatedDuration: 15,
      totalLessons: 1,
      isPublished: true,
      isPreview: true,
      createdBy: sampleTeacherId,
    });

    // Create the lesson for Bitcoin course
    await ctx.db.insert('lessons', {
      courseId: bitcoinPreview,
      title: 'Understanding Bitcoin',
      content: `# What is Bitcoin?

Bitcoin is a decentralized digital currency that was created in 2009 by an anonymous person or group using the pseudonym Satoshi Nakamoto. It was the first cryptocurrency to solve the double-spending problem without requiring a trusted authority or central server.

## Key Characteristics of Bitcoin

### 1. **Decentralization**
- No central authority controls Bitcoin
- Network is maintained by a distributed network of computers (nodes)
- No single point of failure

### 2. **Limited Supply**
- Maximum supply: 21 million bitcoins
- New bitcoins are created through mining
- Supply is predictable and transparent

### 3. **Security**
- Uses cryptographic proof instead of trust
- Transactions are verified by network consensus
- Immutable transaction history

### 4. **Transparency**
- All transactions are publicly recorded on the blockchain
- Anyone can verify transactions
- Pseudonymous (not anonymous)

## How Bitcoin Works

Bitcoin operates on a technology called blockchain, which is essentially a distributed ledger that records all transactions across a network of computers. When you send Bitcoin to someone:

1. The transaction is broadcast to the network
2. Miners verify the transaction using complex mathematical algorithms
3. Once verified, the transaction is added to a block
4. The block is added to the blockchain
5. The transaction is complete and irreversible

## Why Bitcoin Matters

Bitcoin represents a fundamental shift in how we think about money:
- **Store of Value**: Often called "digital gold"
- **Medium of Exchange**: Can be used to buy goods and services
- **Unit of Account**: Can be used to price other assets
- **Financial Inclusion**: Provides access to financial services for the unbanked
- **Censorship Resistance**: Cannot be seized or frozen by authorities

## Getting Started with Bitcoin

To start using Bitcoin, you'll need:
1. A Bitcoin wallet (software or hardware)
2. A way to acquire Bitcoin (exchange, mining, or accepting as payment)
3. Understanding of basic security practices

Remember: Never invest more than you can afford to lose, and always do your own research before making any financial decisions.`,
      duration: 15,
      order: 1,
      type: 'text',
      isPublished: true,
    });

    const ethereumPreview = await ctx.db.insert('courses', {
      title: 'Ethereum Smart Contracts (Free Preview)',
      description:
        "Discover how Ethereum's smart contracts are revolutionizing finance and creating new possibilities for decentralized applications.",
      level: 'intermediate',
      category: 'DeFi',
      estimatedDuration: 20,
      totalLessons: 1,
      isPublished: true,
      isPreview: true,
      createdBy: sampleTeacherId,
    });

    // Create the lesson for Ethereum course
    await ctx.db.insert('lessons', {
      courseId: ethereumPreview,
      title: 'Understanding Smart Contracts',
      content: `# Ethereum Smart Contracts

Ethereum is more than just a cryptocurrency - it's a platform for building decentralized applications (dApps) using smart contracts. Smart contracts are self-executing contracts with the terms of the agreement directly written into code.

## What are Smart Contracts?

Smart contracts are programs that run on the Ethereum blockchain. They automatically execute when predetermined conditions are met, without the need for intermediaries.

### Key Features:
- **Automatic Execution**: No human intervention required
- **Trustless**: No need to trust a third party
- **Transparent**: Code is visible to everyone
- **Immutable**: Cannot be changed once deployed
- **Decentralized**: Runs on the Ethereum network

## How Smart Contracts Work

### 1. **Development**
Smart contracts are written in Solidity (Ethereum's programming language) and compiled into bytecode that runs on the Ethereum Virtual Machine (EVM).

### 2. **Deployment**
Contracts are deployed to the Ethereum blockchain, creating a unique address where they can be interacted with.

### 3. **Execution**
When someone sends a transaction to the contract address, the contract executes its code based on the input provided.

## Real-World Applications

### **DeFi (Decentralized Finance)**
- **Lending Platforms**: Aave, Compound
- **Decentralized Exchanges**: Uniswap, SushiSwap
- **Yield Farming**: Automated yield optimization

### **NFTs (Non-Fungible Tokens)**
- Digital art and collectibles
- Gaming assets
- Real estate tokenization

### **DAO (Decentralized Autonomous Organizations)**
- Community governance
- Investment funds
- Protocol management

## Example: Simple Smart Contract

Here's a basic example of what a smart contract looks like:

\`\`\`solidity
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedData;
    
    function set(uint256 x) public {
        storedData = x;
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}
\`\`\`

## Benefits of Smart Contracts

1. **Efficiency**: Automates processes that would otherwise require manual intervention
2. **Cost Reduction**: Eliminates intermediaries and associated fees
3. **Security**: Cryptographic security and transparency
4. **Accessibility**: Anyone can interact with smart contracts
5. **Innovation**: Enables new business models and applications

## Challenges and Considerations

- **Code Vulnerabilities**: Smart contracts are immutable, so bugs can be costly
- **Scalability**: Ethereum's current limitations on transaction throughput
- **Regulatory Uncertainty**: Evolving legal framework around smart contracts
- **User Experience**: Complex interfaces can be intimidating for new users

## The Future of Smart Contracts

Smart contracts are just beginning to show their potential. As the technology matures, we can expect:
- More sophisticated DeFi protocols
- Integration with traditional finance
- Improved user interfaces
- Cross-chain interoperability
- Enhanced security measures

The possibilities are endless, and smart contracts are fundamentally changing how we think about trust, automation, and value exchange in the digital age.`,
      duration: 20,
      order: 1,
      type: 'text',
      isPublished: true,
    });

    return { success: true, message: 'Preview courses created successfully!' };
  },
});
