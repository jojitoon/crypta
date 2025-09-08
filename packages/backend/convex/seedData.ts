import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { api } from './_generated/api';

export const seedCourses = mutation({
  args: {},
  handler: async (ctx) => {
    // const userId = await getAuthUserId(ctx);
    // if (!userId) {
    //   throw new Error('Must be authenticated');
    // }

    const jojitoon = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', 'jojitoon@gmail.com'))
      .first();

    if (!jojitoon) {
      throw new Error('Jojitoon user not found');
    }

    const userId = jojitoon._id;

    // Check if courses already exist
    // const existingCourses = await ctx.db.query('courses').collect();
    // if (existingCourses.length > 0) {
    //   return { success: true, message: 'Courses already exist!' };
    // }

    // Create new, different courses
    const nftCourse = await ctx.db.insert('courses', {
      title: 'NFTs: Beyond the Hype',
      description:
        'Explore the world of Non-Fungible Tokens (NFTs), their use cases, and how to create, buy, and sell them.',
      level: 'intermediate',
      category: 'NFTs',
      estimatedDuration: 100,
      totalLessons: 4,
      isPublished: true,
      isPreview: false,
      createdBy: userId,
      price: 3999, // $39.99
    });

    const tradingCourse = await ctx.db.insert('courses', {
      title: 'Crypto Trading Strategies',
      description:
        'Learn essential trading strategies, risk management, and technical analysis for the crypto markets.',
      level: 'advanced',
      category: 'Trading',
      estimatedDuration: 150,
      totalLessons: 7,
      isPublished: true,
      isPreview: false,
      createdBy: userId,
      price: 5999, // $59.99
    });

    const web3Course = await ctx.db.insert('courses', {
      title: 'Building on Web3',
      description:
        'A developer-focused course on building decentralized applications (dApps) using Web3 technologies.',
      level: 'advanced',
      category: 'Development',
      estimatedDuration: 200,
      totalLessons: 9,
      isPublished: true,
      isPreview: false,
      createdBy: userId,
      price: 7999, // $79.99
    });

    // Lessons for NFT Course
    await ctx.db.insert('lessons', {
      courseId: nftCourse,
      title: 'What are NFTs?',
      content:
        'NFTs, or Non-Fungible Tokens, are unique digital assets stored on a blockchain. Unlike cryptocurrencies such as Bitcoin or Ethereum, NFTs are not interchangeable and each has its own distinct value.',
      duration: 20,
      order: 1,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: nftCourse,
      title: 'NFT Use Cases',
      content:
        'NFTs are used in digital art, gaming, collectibles, music, and even real estate. They enable true ownership and provenance of digital items.',
      duration: 25,
      order: 2,
      type: 'text',
      isPublished: true,
    });

    const nftQuizLesson = await ctx.db.insert('lessons', {
      courseId: nftCourse,
      title: 'NFTs Quiz',
      content: 'Test your knowledge about NFTs and their applications.',
      duration: 10,
      order: 3,
      type: 'quiz',
      isPublished: true,
    });

    await ctx.db.insert('quizzes', {
      lessonId: nftQuizLesson,
      questions: [
        {
          question: 'What does NFT stand for?',
          options: [
            'Non-Financial Token',
            'Non-Fungible Token',
            'New Financial Technology',
            'Network Funded Token',
          ],
          correctAnswer: 1,
          explanation: 'NFT stands for Non-Fungible Token.',
        },
        {
          question: 'Which of the following is a common use case for NFTs?',
          options: [
            'Digital Art',
            'Bank Transfers',
            'Physical Cash',
            'Traditional Stocks',
          ],
          correctAnswer: 0,
          explanation: 'Digital art is a popular use case for NFTs.',
        },
        {
          question: 'What makes an NFT unique?',
          options: [
            'It is divisible',
            'It is interchangeable',
            'It has a unique identifier on the blockchain',
            'It is a physical asset',
          ],
          correctAnswer: 2,
          explanation: 'NFTs have unique identifiers on the blockchain.',
        },
      ],
      passingScore: 70,
    });

    await ctx.db.insert('lessons', {
      courseId: nftCourse,
      title: 'How to Mint and Trade NFTs',
      content:
        'Learn how to create (mint) your own NFTs and trade them on popular marketplaces like OpenSea and Rarible.',
      duration: 45,
      order: 4,
      type: 'text',
      isPublished: true,
    });

    // Lessons for Trading Course
    await ctx.db.insert('lessons', {
      courseId: tradingCourse,
      title: 'Introduction to Crypto Trading',
      content:
        'Crypto trading involves buying and selling digital assets for profit. This lesson covers the basics, including exchanges, order types, and trading pairs.',
      duration: 20,
      order: 1,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: tradingCourse,
      title: 'Technical Analysis Basics',
      content:
        'Technical analysis uses historical price data and chart patterns to predict future market movements. Learn about candlesticks, support/resistance, and indicators.',
      duration: 30,
      order: 2,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: tradingCourse,
      title: 'Risk Management',
      content:
        'Effective risk management is crucial for long-term trading success. Topics include position sizing, stop-losses, and portfolio diversification.',
      duration: 25,
      order: 3,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: tradingCourse,
      title: 'Trading Psychology',
      content:
        'Understand the psychological aspects of trading, including discipline, emotional control, and avoiding common pitfalls.',
      duration: 20,
      order: 4,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: tradingCourse,
      title: 'Advanced Trading Strategies',
      content:
        'Explore advanced strategies such as swing trading, scalping, and arbitrage in the crypto markets.',
      duration: 30,
      order: 5,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: tradingCourse,
      title: 'Backtesting and Tools',
      content:
        'Learn how to backtest your strategies and use trading tools and bots to automate your trades.',
      duration: 15,
      order: 6,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: tradingCourse,
      title: 'Final Trading Assessment',
      content:
        'Take this quiz to assess your understanding of crypto trading concepts and strategies.',
      duration: 10,
      order: 7,
      type: 'quiz',
      isPublished: true,
    });

    // Lessons for Web3 Course
    await ctx.db.insert('lessons', {
      courseId: web3Course,
      title: 'Introduction to Web3',
      content:
        'Web3 represents the next evolution of the internet, enabling decentralized applications and user-owned data.',
      duration: 20,
      order: 1,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: web3Course,
      title: 'Smart Contracts Deep Dive',
      content:
        'Understand how smart contracts work, their security considerations, and how to write them in Solidity.',
      duration: 30,
      order: 2,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: web3Course,
      title: 'Building Your First dApp',
      content:
        'A step-by-step guide to building and deploying your first decentralized application on Ethereum.',
      duration: 40,
      order: 3,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: web3Course,
      title: 'Interacting with Web3.js',
      content:
        'Learn how to use the Web3.js library to interact with smart contracts and the Ethereum blockchain from your JavaScript applications.',
      duration: 25,
      order: 4,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: web3Course,
      title: 'Decentralized Storage',
      content:
        'Explore decentralized storage solutions like IPFS and Filecoin, and how to integrate them into your dApps.',
      duration: 20,
      order: 5,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: web3Course,
      title: 'Web3 Security Best Practices',
      content:
        'Security is paramount in Web3 development. Learn about common vulnerabilities and how to protect your dApps.',
      duration: 25,
      order: 6,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: web3Course,
      title: 'DAOs and Governance',
      content:
        'Understand Decentralized Autonomous Organizations (DAOs) and how on-chain governance works.',
      duration: 20,
      order: 7,
      type: 'text',
      isPublished: true,
    });

    await ctx.db.insert('lessons', {
      courseId: web3Course,
      title: 'Cross-Chain Interoperability',
      content:
        'Learn about protocols and tools that enable interoperability between different blockchains.',
      duration: 20,
      order: 8,
      type: 'text',
      isPublished: true,
    });

    // The lesson type "project" is not allowed by the schema, so we use "text" instead.
    await ctx.db.insert('lessons', {
      courseId: web3Course,
      title: 'Web3 Final Project',
      content:
        'Apply your knowledge by building a complete dApp as your final project.',
      duration: 20,
      order: 9,
      type: 'text', // Changed from "project" to "text"
      isPublished: true,
    });

    return {
      success: true,
      message: 'New sample courses created successfully!',
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
    const nftPreview = await ctx.db.insert('courses', {
      title: 'NFTs Explained (Free Preview)',
      description:
        'A quick introduction to NFTs, their significance, and how they are changing digital ownership.',
      level: 'beginner',
      category: 'NFTs',
      estimatedDuration: 10,
      totalLessons: 1,
      isPublished: true,
      isPreview: true,
      createdBy: sampleTeacherId,
    });

    // Create the lesson for NFT preview course
    await ctx.db.insert('lessons', {
      courseId: nftPreview,
      title: 'NFT Fundamentals',
      content: `# NFTs Explained

NFTs, or Non-Fungible Tokens, are unique digital assets that represent ownership of a specific item or piece of content on the blockchain. Unlike cryptocurrencies such as Bitcoin, each NFT is one-of-a-kind.

## Why are NFTs Important?

- **Digital Ownership**: NFTs prove ownership of digital art, music, collectibles, and more.
- **Provenance**: The blockchain records the history of each NFT, ensuring authenticity.
- **Programmability**: NFTs can have built-in royalties and other features.

## How to Get Started

1. Set up a crypto wallet (e.g., MetaMask)
2. Visit an NFT marketplace (e.g., OpenSea)
3. Buy, sell, or create your own NFTs

**Remember:** Always verify the authenticity of NFTs before purchasing.`,
      duration: 10,
      order: 1,
      type: 'text',
      isPublished: true,
    });

    const tradingPreview = await ctx.db.insert('courses', {
      title: 'Crypto Trading 101 (Free Preview)',
      description:
        'Get a taste of crypto trading with this introductory lesson on exchanges and order types.',
      level: 'beginner',
      category: 'Trading',
      estimatedDuration: 12,
      totalLessons: 1,
      isPublished: true,
      isPreview: true,
      createdBy: sampleTeacherId,
    });

    // Create the lesson for Trading preview course
    await ctx.db.insert('lessons', {
      courseId: tradingPreview,
      title: 'How Crypto Exchanges Work',
      content: `# Crypto Trading 101

Crypto exchanges are platforms where you can buy, sell, and trade cryptocurrencies. There are two main types:

- **Centralized Exchanges (CEX)**: Operated by companies (e.g., Coinbase, Binance)
- **Decentralized Exchanges (DEX)**: Peer-to-peer trading without intermediaries (e.g., Uniswap)

## Order Types

- **Market Order**: Buy or sell immediately at the best available price
- **Limit Order**: Set a specific price at which you want to buy or sell
- **Stop Order**: Trigger a buy or sell when a certain price is reached

**Tip:** Always start with small amounts and learn how the platform works before trading large sums.`,
      duration: 12,
      order: 1,
      type: 'text',
      isPublished: true,
    });

    return { success: true, message: 'Preview courses created successfully!' };
  },
});

// Function to clear all data and re-seed
export const clearAndReseed = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    // Clear all existing data
    const lessons = await ctx.db.query('lessons').collect();
    for (const lesson of lessons) {
      await ctx.db.delete(lesson._id);
    }

    const courses = await ctx.db.query('courses').collect();
    for (const course of courses) {
      await ctx.db.delete(course._id);
    }

    const purchases = await ctx.db.query('coursePurchases').collect();
    for (const purchase of purchases) {
      await ctx.db.delete(purchase._id);
    }

    // Re-seed the data
    await ctx.runMutation(api.seedData.seedCourses, {});
    await ctx.runMutation(api.seedData.seedPreviewCourses, {});

    return {
      success: true,
      message: 'All data cleared and re-seeded successfully',
    };
  },
});
