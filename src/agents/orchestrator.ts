import { Logger } from '../core/types.js';
import {
  scrapeAllHackathons,
  filterHackathons as filterHackathonsUtil,
} from './hackathon-scraper.js';
import { findWinningSolutions, analyzeSolutionPatterns } from './solution-finder.js';
import { autoFillSubmissionForm, SubmissionForm } from './form-automation.js';
import { startOpportunityMonitoring, checkMonitorStatus } from './opportunity-monitor.js';

/**
 * Orchestrator Agent
 * Coordinates all sub-agents for comprehensive automation
 */

export class HackathonOrchestratorAgent {
  private monitorRunIds: Map<string, Date> = new Map();

  /**
   * Full pipeline: Discover → Analyze → Match → Prepare
   */
  async discoverAndPrepareOpportunities(userProfile: {
    skills: string[];
    interests: string[];
    availability_days: number;
  }) {
    Logger.info({ userProfile }, 'Starting orchestration pipeline');

    try {
      // Use mock mode for development (skip expensive API calls)
      const useMockMode = process.env.MOCK_MODE === 'true' || process.env.NODE_ENV === 'development';

      // Stage 1: Discover
      Logger.info('Stage 1: Discovering real hackathons...');
      let hackathons;
      
      if (useMockMode) {
        Logger.info('⚠️  Using mock mode hackathons (set MOCK_MODE=false for real data)');
        hackathons = this.getMockHackathons();
      } else {
        Logger.info('🔍 Attempting REAL scraping from HackerEarth, DevPost, MLH...');
        try {
          const scrapePromise = scrapeAllHackathons();
          // Give real scraping 120 seconds to complete
          const timeoutPromise = new Promise<Map<string, any[]>>((resolve) =>
            setTimeout(() => {
              Logger.warn('⏱️  Real scraping timeout (120s exceeded), using mock fallback');
              resolve(new Map());
            }, 120000)
          );

          hackathons = await Promise.race([scrapePromise, timeoutPromise]);
          const totalHackathons = Array.from(hackathons.values()).flat().length;
          
          if (totalHackathons === 0) {
            Logger.warn('⚠️  Real scraping returned 0 results, using mock data');
            hackathons = this.getMockHackathons();
          } else {
            Logger.info(`✅ Real scraping SUCCESS: ${totalHackathons} real hackathons found!`);
          }
        } catch (scrapeError) {
          Logger.error({ scrapeError }, '❌ Real scraping failed, falling back to mock');
          hackathons = this.getMockHackathons();
        }
      }

      // Stage 2: Analyze solutions for user interests (skip in mock mode)
      Logger.info('Stage 2: Analyzing winning solutions...');
      let allSolutions: any[] = [];
      let solutionPatterns: any = {};
      
      if (!useMockMode) {
        const solutionPromises = Array.from(userProfile.interests).map((interest) =>
          findWinningSolutions(interest).catch((e) => {
            Logger.error({ error: e, interest }, 'Failed to find solutions');
            return [];
          })
        );
        allSolutions = await Promise.all(solutionPromises);
        solutionPatterns = analyzeSolutionPatterns(allSolutions.flat());
      } else {
        Logger.info('Using mock solutions');
        allSolutions = [this.getMockSolutions()];
        solutionPatterns = { technologies: ['Python', 'JavaScript', 'React'], averageComplexity: 'medium' };
      }

      // Stage 3: Match opportunities to user
      Logger.info('Stage 3: Matching opportunities...');
      const matches = this.matchOpportunitiesToUser(
        Array.from(hackathons.values()).flat(),
        userProfile,
        solutionPatterns
      );

      // Stage 4: Generate recommendations
      Logger.info('Stage 4: Generating recommendations...');
      const recommendations = this.generateRecommendations(
        matches,
        allSolutions.flat(),
        solutionPatterns
      );

      Logger.info({ count: recommendations.length }, 'Orchestration pipeline completed');
      return {
        hackathons_found: Array.from(hackathons.values()).flat().length,
        solutions_analyzed: allSolutions.flat().length,
        matches: matches.length,
        recommendations,
      };
    } catch (error) {
      Logger.error({ error }, 'Orchestration pipeline failed');
      throw error;
    }
  }

  /**
   * Mock hackathons for development
   */
  private getMockHackathons() {
    return new Map([
      [
        'hackerearth',
        [
          {
            name: 'AI Innovation Challenge',
            platform: 'hackerearth',
            url: 'https://www.hackerearth.com/challenges/ai-innovation/',
            prize_pool: '$50,000',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Build AI solutions for real-world problems',
            theme: 'AI/ML',
            difficulty: 'intermediate' as const,
          },
        ],
      ],
      [
        'devpost',
        [
          {
            name: 'Web3 Hackathon',
            platform: 'devpost',
            url: 'https://devpost.com/software/web3-hackathon',
            prize_pool: '$100,000',
            deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Create decentralized applications',
            theme: 'Web3',
            difficulty: 'advanced' as const,
          },
        ],
      ],
      [
        'mlh',
        [
          {
            name: 'Spring League Hackathon',
            platform: 'mlh',
            url: 'https://mlh.io/seasons/2024/events',
            prize_pool: '$25,000',
            deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Premier student hackathon series',
            theme: 'All',
            difficulty: 'beginner' as const,
          },
        ],
      ],
    ]);
  }

  /**
   * Get detailed problem statements for hackathons
   */
  private getProblemStatements() {
    return {
      'AI Innovation Challenge': {
        problem_statement: 'Healthcare systems worldwide struggle with patient diagnosis delays and medical errors. AI-powered diagnostic tools can reduce diagnosis time from weeks to minutes and improve accuracy to 95%+. We need innovative ML models that can process medical imaging, patient history, and lab results to provide preliminary diagnoses.',
        real_world_impact: 'Can save millions of lives annually by enabling early disease detection',
        key_challenges: [
          'Processing multi-modal medical data (images, text, time-series)',
          'Ensuring model explainability for medical professionals',
          'Achieving 99.9% reliability for life-critical decisions',
          'Handling privacy-sensitive patient information',
        ],
        problem_domain: 'Healthcare & Medical AI',
        estimated_potential: 'Global healthcare AI market: $67.4B by 2027',
        example_applications: [
          'Radiology report automation',
          'Predictive patient risk scoring',
          'Drug discovery acceleration',
        ],
      },
      'Web3 Hackathon': {
        problem_statement: 'Financial exclusion affects 1.7B unbanked adults globally. Blockchain technologies can enable borderless, permissionless financial services without traditional intermediaries. We need DeFi solutions that address remittance costs (currently 7% avg), lending accessibility, and asset tokenization.',
        real_world_impact: 'Can provide financial services to underbanked populations and reduce remittance fees by 80%',
        key_challenges: [
          'Scalability: current blockchains handle <100 TPS, but need millions',
          'User experience: 99% of users find crypto wallets too complex',
          'Regulatory compliance across jurisdictions',
          'Smart contract security and auditing',
        ],
        problem_domain: 'FinTech & Web3',
        estimated_potential: 'Global remittances: $759B annually (8% of emerging economy GDP)',
        example_applications: [
          'Low-cost cross-border payments',
          'Decentralized lending protocols',
          'Tokenized real-world assets',
        ],
      },
      'Spring League Hackathon': {
        problem_statement: 'Education technology needs innovation to make learning accessible, personalized, and affordable. Students struggle with: (1) One-size-fits-all curriculum, (2) Lack of real-time feedback, (3) High cost barriers. We need solutions that adapt to learning styles, provide instant feedback, and democratize access.',
        real_world_impact: 'Can improve learning outcomes by 40% and enable education for 250M+ out-of-school children',
        key_challenges: [
          'Personalization at scale without invasive data collection',
          'Works offline in low-connectivity regions',
          'Reduces costs to <$1/month for students in developing countries',
          'Teacher training and adoption',
        ],
        problem_domain: 'EdTech & Learning Innovation',
        estimated_potential: 'Global EdTech market: $250B+ and growing 17% annually',
        example_applications: [
          'AI tutoring systems for underserved students',
          'Multilingual learning platforms',
          'Affordable skill certification programs',
        ],
      },
    };
  }

  /**
   * Mock solutions for development
   */
  private getMockSolutions() {
    return {
      title: 'AI-Powered Analytics Platform',
      author: 'Team Alpha',
      prize: '$10,000',
      description: 'Real-time analytics using machine learning and data visualization',
      technologies: ['Python', 'TensorFlow', 'React', 'PostgreSQL'],
      github_url: 'https://github.com/team-alpha/analytics',
      demo_url: 'https://analytics-demo.example.com',
      votes: 250,
      rating: 4.8,
      year: '2026',
    };
  }

  /**
   * Prepare submission for a specific hackathon
   */
  async prepareSubmission(
    hackathonUrl: string,
    projectDetails: {
      name: string;
      description: string;
      technologies: string[];
      team_members: Array<{ name: string; email: string }>;
      github_url?: string;
      demo_url?: string;
    }
  ) {
    Logger.info({ hackathon_url: hackathonUrl }, 'Preparing submission');

    try {
      const submission: SubmissionForm = {
        hackathon_url: hackathonUrl,
        project_name: projectDetails.name,
        project_description: projectDetails.description,
        team_members: projectDetails.team_members,
        technologies: projectDetails.technologies,
        github_url: projectDetails.github_url,
        demo_url: projectDetails.demo_url,
      };

      const result = await autoFillSubmissionForm(submission);
      return result;
    } catch (error) {
      Logger.error({ error, hackathon_url: hackathonUrl }, 'Submission prep failed');
      throw error;
    }
  }

  /**
   * Start continuous monitoring for new opportunities
   */
  async startBackgroundMonitoring() {
    Logger.info('Starting background opportunity monitoring');

    const runId = await startOpportunityMonitoring();
    this.monitorRunIds.set(runId, new Date());

    return runId;
  }

  /**
   * Check monitor status and collect new opportunities
   */
  async collectNewOpportunities() {
    Logger.info({ monitors: this.monitorRunIds.size }, 'Checking monitors');

    const results = [];
    for (const [runId] of this.monitorRunIds.entries()) {
      try {
        const status = await checkMonitorStatus(runId);
        results.push({
          run_id: runId,
          ...status,
        });
      } catch (error) {
        Logger.error({ error, run_id: runId }, 'Monitor check failed');
      }
    }

    return results;
  }

  // ============ Private Helpers ============

  private matchOpportunitiesToUser(
    hackathons: any[],
    userProfile: {
      skills: string[];
      interests: string[];
      availability_days: number;
    },
    solutionPatterns: any
  ) {
    return hackathons
      .map((hackathon) => {
        let score = 0;

        // Skill match
        const skillMatches = (hackathon.theme || '')
          .toLowerCase()
          .split(' ')
          .filter((word: string) =>
            userProfile.skills.some((s) => s.toLowerCase().includes(word))
          ).length;
        score += skillMatches * 10;

        // Interest match
        const interestMatches = userProfile.interests.filter((interest) =>
          (hackathon.theme || '')
            .toLowerCase()
            .includes(interest.toLowerCase())
        ).length;
        score += interestMatches * 15;

        // Recent/upcoming bias
        if (hackathon.deadline) {
          const daysUntil =
            (new Date(hackathon.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          if (daysUntil > 0 && daysUntil <= userProfile.availability_days) {
            score += 20;
          }
        }

        return {
          hackathon,
          score,
          matched_skills: skillMatches,
          matched_interests: interestMatches,
        };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  private generateRecommendations(matches: any[], solutions: any[], patterns: any) {
    const problemStatements = this.getProblemStatements();

    return matches.slice(0, 10).map((match: any, index: number) => {
      const suggestedTechs = patterns.common_techs
        ? patterns.common_techs.slice(0, 5).map((t: any) => t.tech)
        : patterns.technologies || ['Python', 'JavaScript', 'React'];

      const hackathonName = match.hackathon.name;
      const problemData = problemStatements[hackathonName as keyof typeof problemStatements];

      return {
        rank: index + 1,
        hackathon: {
          name: match.hackathon.name,
          url: match.hackathon.url,
          deadline: match.hackathon.deadline,
          prize_pool: match.hackathon.prize_pool,
          theme: match.hackathon.theme,
          difficulty: match.hackathon.difficulty,
        },
        problem_context: problemData ? {
          problem_statement: problemData.problem_statement,
          real_world_impact: problemData.real_world_impact,
          problem_domain: problemData.problem_domain,
          estimated_potential: problemData.estimated_potential,
          key_challenges: problemData.key_challenges,
          example_applications: problemData.example_applications,
        } : {
          problem_statement: 'Solve real-world problems using technology',
          real_world_impact: 'Create solutions with positive societal impact',
          problem_domain: match.hackathon.theme,
          estimated_potential: 'Unknown',
          key_challenges: [],
          example_applications: [],
        },
        recommendation_reason: `Matches ${match.matched_interests} of your interests and ${match.matched_skills} of your skills`,
        suggested_tech_stack: suggestedTechs,
        similar_winning_solutions: solutions
          .slice(0, 3)
          .map((s: any) => ({
            title: s.title || 'Sample Solution',
            technologies: s.technologies || [],
            github_url: s.github_url || null,
            description: s.description || 'Winning solution from past competition',
          })),
        next_action: 'Review problem statement, study winning solutions, prepare proposal draft, fill submission form',
      };
    });
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new HackathonOrchestratorAgent();

  const userProfile = {
    skills: ['React', 'Node.js', 'Python', 'Machine Learning'],
    interests: ['AI', 'Web', 'Fintech'],
    availability_days: 30,
  };

  orchestrator
    .discoverAndPrepareOpportunities(userProfile)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      Logger.error(error);
      process.exit(1);
    });
}
