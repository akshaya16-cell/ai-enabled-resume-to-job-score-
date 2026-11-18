import type { CloudPipelineStage, RolePreset } from '../types/match';

export const DEFAULT_WEIGHTS = {
  coreSkills: 40,
  experienceImpact: 25,
  domainAlignment: 20,
  leadershipCommunication: 15,
};

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'software-engineer',
    label: 'Software Engineer',
    industry: 'Engineering',
    targetRole: 'Senior Full-Stack Software Engineer',
    candidateName: 'Marcus Chen',
    weights: { coreSkills: 40, experienceImpact: 25, domainAlignment: 20, leadershipCommunication: 15 },
    jobDescription: `Senior Full-Stack Software Engineer — Workflow & Automation Platform
Location: New York, NY / Hybrid

Role Overview:
Build responsive React + TypeScript web applications and reliable Node.js / PostgreSQL cloud backends that power automated document processing and analytics workflows.

Required Qualifications:
- 5+ years of production software engineering experience with TypeScript, React, and Node.js (Express or Next.js).
- Strong relational database design, PostgreSQL indexing, and query performance optimization.
- Experience integrating AI or REST/GraphQL APIs with structured JSON validation, error handling, and async background queues.
- Hands-on experience with Docker, CI/CD pipelines, and cloud deployment (AWS ECS, Cloud Run, or Vercel).
- Track record mentoring engineers and partnering with Product and Design on end-to-end delivery.

Preferred Qualifications:
- Familiarity with Tailwind CSS and WCAG AA web accessibility standards.
- Experience handling PDF or document uploads and streaming responses.`,
    resumeText: `MARCUS CHEN
Brooklyn, NY | marcus.chen@example.com | Senior Full-Stack Engineer

SUMMARY
Product-minded software engineer with 5.5 years of experience building TypeScript, React, and Node.js SaaS platforms, high-throughput PostgreSQL APIs, and accessible web interfaces.

EXPERIENCE
Senior Software Engineer — Harbor Ledger (2023–Present)
- Built financial reconciliation workflows in React 18, TypeScript, and Tailwind CSS serving 18,000 monthly active operators with WCAG AA keyboard navigation.
- Designed Node.js Express APIs and PostgreSQL schemas (composite indexes, materialized views), reducing reporting query latency by 62%.
- Containerized backend services with Docker and GitHub Actions CI/CD deploying to AWS ECS.

Software Engineer — Finch Workspace (2021–2023)
- Developed collaborative task boards in React and GraphQL backed by Node.js and Redis background queues.
- Integrated an LLM summarization service for meeting notes using REST endpoints, schema validation, and retry logic.
- Mentored 2 associate engineers through weekly code reviews and sprint technical scoping.

EDUCATION
B.S. Information Systems, New York University`,
    baselineResult: {
      id: 'baseline-software-engineer',
      candidateName: 'Marcus Chen',
      detectedRole: 'Senior Software Engineer',
      targetRole: 'Senior Full-Stack Software Engineer',
      overallScore: 88,
      fitVerdict: 'Strong Fit',
      executiveSummary:
        'Marcus Chen meets all core stack requirements with 5.5 years in TypeScript, React, Node.js, PostgreSQL tuning, Docker, and AWS ECS. His LLM workflow integration and WCAG AA frontend craft align closely, with minor gaps around PDF upload parsing and streaming responses.',
      dimensionScores: {
        coreSkills: 92,
        experienceImpact: 88,
        domainAlignment: 85,
        leadershipCommunication: 84,
      },
      dimensionRationales: {
        coreSkills:
          'Verified production proficiency across TypeScript, React 18, Node.js, Express, PostgreSQL, Tailwind CSS, and Docker.',
        experienceImpact:
          '5.5 years of progressive SaaS delivery exceeding the 5+ year requirement with a 62% query latency reduction.',
        domainAlignment:
          'Built workflow automation SaaS, Redis async queues, and LLM API integration with schema validation.',
        leadershipCommunication:
          'Mentored 2 associate engineers and led sprint scoping alongside product teams.',
      },
      weightsUsed: { coreSkills: 40, experienceImpact: 25, domainAlignment: 20, leadershipCommunication: 15 },
      requirementsMatrix: [
        {
          requirement: '5+ years TypeScript, React, and Node.js',
          category: 'Core Stack',
          importance: 'Must Have',
          status: 'Matched',
          evidence: '5.5 years across Harbor Ledger and Finch Workspace using React 18, TypeScript, and Express.',
        },
        {
          requirement: 'PostgreSQL schema design & query optimization',
          category: 'Database',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Created composite indexes and materialized views reducing reporting query latency by 62%.',
        },
        {
          requirement: 'AI/API integration with JSON validation & queues',
          category: 'Backend Systems',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Integrated LLM summarization via REST with schema validation, retry logic, and Redis queues.',
        },
        {
          requirement: 'Docker, CI/CD, and cloud deployment',
          category: 'Cloud & DevOps',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Containerized services with Docker and GitHub Actions deploying to AWS ECS.',
        },
        {
          requirement: 'Mentoring engineers & cross-functional delivery',
          category: 'Leadership',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Mentored 2 associate engineers and owned sprint technical scoping.',
        },
        {
          requirement: 'Tailwind CSS & WCAG AA accessibility',
          category: 'Preferred Craft',
          importance: 'Preferred',
          status: 'Matched',
          evidence: 'Built dashboard in Tailwind CSS with WCAG AA keyboard navigation for 18,000 MAUs.',
        },
        {
          requirement: 'PDF/document uploads and streaming responses',
          category: 'Preferred Craft',
          importance: 'Preferred',
          status: 'Missing',
          evidence: 'No explicit experience with binary PDF document ingestion or SSE streaming cited.',
        },
      ],
      matchedSkills: [
        'TypeScript',
        'React 18',
        'Node.js & Express',
        'PostgreSQL',
        'Docker & GitHub Actions',
        'AWS ECS',
        'Tailwind CSS',
        'WCAG AA Accessibility',
        'Redis Queues',
        'GraphQL & REST',
      ],
      missingSkills: ['PDF Document Parsing', 'SSE Streaming Responses'],
      candidateRecommendations: [
        'Add concrete throughput or latency metrics for the Redis queue and LLM summarization pipeline.',
        'If you handled file uploads or streaming updates on the reconciliation dashboard, state those protocols explicitly.',
        'Highlight examples of partnering with Product Managers and Designers during technical discovery.',
      ],
      bulletRewrites: [
        {
          original: 'Integrated an LLM summarization service for meeting notes using REST endpoints, schema validation, and retry logic.',
          improved:
            'Engineered resilient AI summarization pipeline in Node.js with strict JSON schema validation, exponential backoff retries, and Redis background queues.',
          rationale: 'Surfaces reliability engineering terms directly matching the job description.',
        },
      ],
      recruiterInterviewProbes: [
        'Walk through how you structured PostgreSQL composite indexes and validated the 62% latency drop.',
        'How would you design streaming progress feedback and timeouts for large PDF document uploads?',
      ],
      telemetry: {
        model: 'gemini-4-hydrogen',
        embeddingModel: 'gemini-embedding-2',
        vectorSimilarity: 0.87,
        coverageScore: 92,
        rubricScore: 88,
        inferenceMs: 1340,
        evaluatedAt: '2026-11-18T08:40:00Z',
        inputFormat: 'text',
        extractedCharacters: 1210,
        pageCount: null,
      },
      source: 'baseline',
    },
  },
  {
    id: 'product-manager',
    label: 'Product Manager',
    industry: 'Product',
    targetRole: 'Senior Product Manager — B2B SaaS',
    candidateName: 'Hannah Alvarez',
    weights: { coreSkills: 35, experienceImpact: 30, domainAlignment: 20, leadershipCommunication: 15 },
    jobDescription: `Senior Product Manager — Enterprise Collaboration & Analytics
Location: Chicago, IL (Hybrid)

Role Overview:
Own the product roadmap, customer discovery, and go-to-market execution for our B2B analytics and workflow suite used by mid-market and enterprise operations teams.

Required Qualifications:
- 5+ years of product management experience owning B2B SaaS products from discovery to GA launch.
- Proven ability to define PRDs, prioritize backlogs using quantitative metrics (retention, activation, NRR), and run A/B experiments.
- Strong SQL or BI analytics fluency (Amplitude, Mixpanel, Looker) to diagnose funnel drop-offs independently.
- Experience leading cross-functional squads across Engineering, Design, Sales, and Customer Success.
- Track record launching enterprise features such as RBAC, audit logs, or self-serve onboarding.

Preferred Qualifications:
- Experience with pricing/packaging experiments or PLG self-serve funnels.
- Background collaborating on AI-assisted workflow features.`,
    resumeText: `HANNAH ALVAREZ
Chicago, IL | hannah.alvarez@example.com | Senior Product Manager

SUMMARY
B2B SaaS Product Manager with 6 years of experience scaling enterprise workflow tools, leading cross-functional engineering squads, and driving measurable activation and retention gains.

EXPERIENCE
Senior Product Manager — BeaconOps Cloud (2023–Present)
- Owned roadmap for multi-tenant workflow analytics platform ($14M ARR); launched self-serve onboarding flow that raised 30-day team activation from 41% to 63%.
- Partnered with 12 engineers and 2 designers to ship role-based access control (RBAC) and SOC 2 audit trails, unlocking 19 enterprise expansions (+$1.8M NRR).
- Built self-serve funnel dashboards in Amplitude and SQL to track cohort retention and run onboarding A/B tests.

Product Manager — Gridline CRM (2020–2023)
- Authored PRDs and prioritized quarterly backlogs for automated email sequences and reporting widgets across 4,500 SMB accounts.
- Conducted 60+ structured customer interviews with VP Operations stakeholders to validate pricing tier changes.

EDUCATION
B.A. Economics, Northwestern University`,
    baselineResult: {
      id: 'baseline-product-manager',
      candidateName: 'Hannah Alvarez',
      detectedRole: 'Senior Product Manager',
      targetRole: 'Senior Product Manager — B2B SaaS',
      overallScore: 91,
      fitVerdict: 'Strong Fit',
      executiveSummary:
        'Hannah Alvarez matches every core qualification for a Senior B2B SaaS PM, combining 6 years of product ownership with verified RBAC/audit-log launches, SQL + Amplitude experimentation, and quantifiable +22pt activation and $1.8M NRR impact.',
      dimensionScores: {
        coreSkills: 90,
        experienceImpact: 94,
        domainAlignment: 91,
        leadershipCommunication: 89,
      },
      dimensionRationales: {
        coreSkills:
          'Demonstrated PRD authoring, A/B experimentation, SQL, Amplitude, and pricing discovery.',
        experienceImpact:
          '6 years in B2B SaaS with concrete $14M ARR ownership, +22% activation lift, and $1.8M NRR expansion.',
        domainAlignment:
          'Shipped RBAC, SOC 2 audit logs, and self-serve onboarding in B2B workflow analytics.',
        leadershipCommunication:
          'Led 14-person product/eng/design squad and conducted 60+ executive stakeholder interviews.',
      },
      weightsUsed: { coreSkills: 35, experienceImpact: 30, domainAlignment: 20, leadershipCommunication: 15 },
      requirementsMatrix: [
        {
          requirement: '5+ years B2B SaaS product management',
          category: 'Experience',
          importance: 'Must Have',
          status: 'Matched',
          evidence: '6 years across BeaconOps Cloud and Gridline CRM managing $14M ARR workflows.',
        },
        {
          requirement: 'PRDs, backlog prioritization & A/B experiments',
          category: 'Product Craft',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Authored PRDs and ran onboarding A/B tests lifting 30-day activation from 41% to 63%.',
        },
        {
          requirement: 'SQL or BI analytics fluency (Amplitude/Looker)',
          category: 'Analytics',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Built cohort retention and funnel dashboards directly in Amplitude and SQL.',
        },
        {
          requirement: 'Cross-functional leadership (Eng, Design, GTM)',
          category: 'Leadership',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Partnered with 12 engineers, 2 designers, and VP Operations stakeholders.',
        },
        {
          requirement: 'Enterprise features (RBAC, audit logs, onboarding)',
          category: 'Domain Scope',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Shipped RBAC, SOC 2 audit trails, and self-serve onboarding generating $1.8M NRR.',
        },
        {
          requirement: 'AI-assisted workflow feature experience',
          category: 'Preferred Craft',
          importance: 'Preferred',
          status: 'Missing',
          evidence: 'No AI-assisted workflow launches documented in resume history.',
        },
      ],
      matchedSkills: [
        'B2B SaaS Product Management',
        'PRD Authoring',
        'A/B Experimentation',
        'SQL & Amplitude',
        'RBAC & Enterprise Readiness',
        'Self-Serve Onboarding',
        'Pricing & Packaging Discovery',
        'NRR & Retention Metrics',
      ],
      missingSkills: ['AI-Assisted Workflow Features', 'Looker / Mixpanel'],
      candidateRecommendations: [
        'Explicitly note Sales and Customer Success enablement work during the RBAC enterprise rollout.',
        'Include any AI/automation discovery or roadmap scoping experience if applicable.',
        'Specify statistical confidence or sample size behind your onboarding A/B experiments.',
      ],
      bulletRewrites: [
        {
          original: 'Conducted 60+ structured customer interviews with VP Operations stakeholders to validate pricing tier changes.',
          improved:
            'Partnered with Sales and Customer Success across 60+ VP Operations interviews to restructure enterprise pricing tiers and increase trial-to-paid conversion.',
          rationale: 'Highlights GTM alignment and commercial outcome alongside user research.',
        },
      ],
      recruiterInterviewProbes: [
        'How did you collaborate with Sales and Customer Success to turn RBAC into $1.8M of expansion NRR?',
        'Walk through an A/B onboarding experiment that failed or produced an unexpected result.',
      ],
      telemetry: {
        model: 'gemini-4-hydrogen',
        embeddingModel: 'gemini-embedding-2',
        vectorSimilarity: 0.88,
        coverageScore: 91,
        rubricScore: 91,
        inferenceMs: 1280,
        evaluatedAt: '2026-11-18T08:42:00Z',
        inputFormat: 'text',
        extractedCharacters: 1180,
        pageCount: null,
      },
      source: 'baseline',
    },
  },
  {
    id: 'data-analyst',
    label: 'Data & Analytics',
    industry: 'Data',
    targetRole: 'Senior Product Data Analyst',
    candidateName: 'Priya Nair',
    weights: { coreSkills: 40, experienceImpact: 25, domainAlignment: 20, leadershipCommunication: 15 },
    jobDescription: `Senior Product Data Analyst — Growth & Marketplace Intelligence
Location: San Francisco, CA

Role Overview:
Partner with Product and Finance leaders to model marketplace liquidity, design experiment readouts, and maintain governed dbt + Snowflake data models.

Required Qualifications:
- 4+ years in Data Analytics, Product Analytics, or Analytics Engineering.
- Advanced SQL (window functions, CTEs, query optimization) and dbt model ownership.
- Strong Python or R statistical analysis skills for experimentation, cohort modeling, and forecasting.
- Experience building executive dashboards in Looker, Tableau, or Mode.
- Clear storytelling translating ambiguous business questions into actionable product recommendations.

Preferred Qualifications:
- Experience with Airflow orchestration and Great Expectations data quality testing.`,
    resumeText: `PRIYA NAIR
San Jose, CA | priya.nair@example.com | Senior Data & Analytics Engineer

SUMMARY
Analytical data specialist with 5 years building governed SQL/dbt warehouse models, Python segmentation pipelines, and executive reporting dashboards.

EXPERIENCE
Senior Data Engineer — RetailPulse (2022–Present)
- Built Python and Spark transformation pipelines on AWS Glue and Redshift processing 4TB of daily e-commerce clickstream events.
- Maintained Airflow DAGs and Great Expectations data quality alerts across 30 core warehouse tables.
- Partnered with merchandising directors to deliver weekly cohort retention and conversion dashboards in Looker.

Data Analyst — FinMetric Corp (2020–2022)
- Automated SQL reporting models (CTEs, window functions) in dbt and Snowflake, reducing batch warehouse runtime by 38%.
- Ran Python churn scoring and customer lifetime value cohort analyses presented to Finance leadership.

EDUCATION
M.S. Data Analytics, San Jose State University`,
    baselineResult: {
      id: 'baseline-data-analyst',
      candidateName: 'Priya Nair',
      detectedRole: 'Senior Data Engineer',
      targetRole: 'Senior Product Data Analyst',
      overallScore: 86,
      fitVerdict: 'Strong Fit',
      executiveSummary:
        'Priya Nair is highly aligned for Senior Product Data Analyst: she brings 5 years of SQL, dbt, Snowflake, Python, Looker, Airflow, and Great Expectations experience, with a minor gap around formal A/B experiment design readouts.',
      dimensionScores: {
        coreSkills: 91,
        experienceImpact: 86,
        domainAlignment: 80,
        leadershipCommunication: 82,
      },
      dimensionRationales: {
        coreSkills:
          'Covers SQL window functions/CTEs, dbt, Snowflake, Python, Looker, Airflow, and Great Expectations.',
        experienceImpact:
          '5 years of analytics & data engineering experience with 38% Snowflake runtime improvement.',
        domainAlignment:
          'Strong e-commerce clickstream and cohort retention work; A/B experiment design not explicitly detailed.',
        leadershipCommunication:
          'Presented LTV cohort analyses to Finance leadership and partnered with merchandising directors.',
      },
      weightsUsed: { coreSkills: 40, experienceImpact: 25, domainAlignment: 20, leadershipCommunication: 15 },
      requirementsMatrix: [
        {
          requirement: '4+ years Data or Product Analytics',
          category: 'Experience',
          importance: 'Must Have',
          status: 'Matched',
          evidence: '5 years across RetailPulse and FinMetric Corp with M.S. in Data Analytics.',
        },
        {
          requirement: 'Advanced SQL (CTEs, window functions) & dbt',
          category: 'Core Stack',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Authored dbt models using CTEs and window functions in Snowflake, cutting runtime by 38%.',
        },
        {
          requirement: 'Python/R statistical modeling & experimentation',
          category: 'Analytics',
          importance: 'Must Have',
          status: 'Partial',
          evidence: 'Python churn scoring and LTV cohorts verified; formal A/B testing experiment readouts omitted.',
        },
        {
          requirement: 'Executive BI dashboards (Looker/Tableau)',
          category: 'Visualization',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Built weekly Looker cohort retention and conversion dashboards for directors.',
        },
        {
          requirement: 'Airflow & Great Expectations quality checks',
          category: 'Preferred Craft',
          importance: 'Preferred',
          status: 'Matched',
          evidence: 'Maintained Airflow DAGs and Great Expectations alerts across 30 warehouse tables.',
        },
      ],
      matchedSkills: [
        'SQL (CTEs & Window Functions)',
        'dbt',
        'Snowflake & Redshift',
        'Python',
        'Looker',
        'Airflow',
        'Great Expectations',
        'Cohort & LTV Modeling',
      ],
      missingSkills: ['A/B Experiment Readouts', 'Marketplace Liquidity Modeling'],
      candidateRecommendations: [
        'Detail any hypothesis testing, p-value, or experimentation analyses you supported in Python.',
        'Include specific business decisions or revenue outcomes influenced by your Looker retention dashboards.',
        'Emphasize product analytics framing in your headline alongside data engineering skills.',
      ],
      bulletRewrites: [
        {
          original: 'Partnered with merchandising directors to deliver weekly cohort retention and conversion dashboards in Looker.',
          improved:
            'Built executive Looker dashboards tracking clickstream conversion and cohort retention, guiding weekly merchandising and product funnel prioritization.',
          rationale: 'Connects dashboard delivery directly to product decision-making impact.',
        },
      ],
      recruiterInterviewProbes: [
        'How would you size sample duration and check for novelty effects on a marketplace pricing A/B test?',
        'Describe how you modeled dbt tests to catch upstream clickstream schema drift.',
      ],
      telemetry: {
        model: 'gemini-4-hydrogen',
        embeddingModel: 'gemini-embedding-2',
        vectorSimilarity: 0.84,
        coverageScore: 89,
        rubricScore: 85,
        inferenceMs: 1210,
        evaluatedAt: '2026-11-18T08:44:00Z',
        inputFormat: 'text',
        extractedCharacters: 1140,
        pageCount: null,
      },
      source: 'baseline',
    },
  },
  {
    id: 'cloud-architect',
    label: 'Cloud Architect',
    industry: 'Cloud & Infra',
    targetRole: 'Principal Cloud Solutions Architect',
    candidateName: 'Elena Vance',
    weights: { coreSkills: 40, experienceImpact: 25, domainAlignment: 20, leadershipCommunication: 15 },
    jobDescription: `Principal Cloud Solutions Architect — Distributed AI & Data Platforms
Location: Seattle, WA (Hybrid)

Role Overview:
Lead multi-region cloud architecture, security governance, and AI inference infrastructure for enterprise B2B deployments.

Required Qualifications:
- 8+ years designing distributed cloud systems on Google Cloud (GCP) or AWS using Terraform or Pulumi.
- Deep expertise in Kubernetes (GKE/EKS), serverless containers (Cloud Run/Lambda), and Pub/Sub or Kafka.
- Experience architecting production LLM/RAG pipelines and vector search (Vertex AI, pgvector, Pinecone).
- Proven SOC 2 Type II compliance, VPC Service Controls, and FinOps cost optimization.
- Experience leading Architecture Review Boards and advising executive stakeholders.`,
    resumeText: `ELENA VANCE
Seattle, WA | elena.vance@example.com | Principal Cloud Infrastructure Engineer

SUMMARY
Cloud infrastructure architect with 9 years designing multi-region GCP and AWS production systems, Terraform automation, and low-latency AI inference services.

EXPERIENCE
Staff Cloud Architect — Meridian Data Systems (2022–Present)
- Architected multi-region GKE and Cloud Run inference platform serving 42M daily API requests at 99.98% availability across us-central1 and europe-west1.
- Built enterprise RAG and semantic matching pipelines using Vertex AI embeddings, pgvector on Cloud SQL, and Cloud Pub/Sub async workers, reducing p95 latency from 1.9s to 340ms.
- Authored modular Terraform and OPA policy guardrails enforcing VPC Service Controls and SOC 2 Type II compliance across 140+ microservices.
- Reduced annual cloud expenditure by 31% ($940K yearly savings) via FinOps governance and autoscaling.
- Led bi-weekly Architecture Review Board for 45 engineers and presented security postures to Fortune 500 CTOs.

Senior Platform Engineer — Northstar Telemetry (2019–2022)
- Migrated EC2 monolith to containerized EKS clusters with Kafka ingestion and ArgoCD Canary rollouts.

EDUCATION & CERTIFICATIONS
B.S. Computer Science, University of Washington | GCP Professional Cloud Architect | CKA`,
    baselineResult: {
      id: 'baseline-cloud-architect',
      candidateName: 'Elena Vance',
      detectedRole: 'Staff Cloud Architect',
      targetRole: 'Principal Cloud Solutions Architect',
      overallScore: 95,
      fitVerdict: 'Strong Fit',
      executiveSummary:
        'Elena Vance aligns across all five principal requirements: 9 years of GCP/AWS architecture, multi-region GKE/Cloud Run scale, production Vertex AI + pgvector RAG pipelines, SOC 2 compliance, $940K FinOps savings, and Architecture Review Board leadership.',
      dimensionScores: {
        coreSkills: 96,
        experienceImpact: 95,
        domainAlignment: 96,
        leadershipCommunication: 92,
      },
      dimensionRationales: {
        coreSkills:
          'Verified hands-on mastery of GCP, AWS, Terraform, GKE/EKS, Cloud Run, Pub/Sub, Kafka, and pgvector.',
        experienceImpact:
          '9 years of progressive scale handling 42M daily requests at 99.98% uptime and $940K FinOps savings.',
        domainAlignment:
          'Directly built enterprise RAG/vector search pipelines and SOC 2 VPC Service Controls.',
        leadershipCommunication:
          'Chairs Architecture Review Board for 45 engineers and briefs Fortune 500 CTOs.',
      },
      weightsUsed: { coreSkills: 40, experienceImpact: 25, domainAlignment: 20, leadershipCommunication: 15 },
      requirementsMatrix: [
        {
          requirement: '8+ years GCP/AWS architecture & Terraform',
          category: 'Cloud Infra',
          importance: 'Must Have',
          status: 'Matched',
          evidence: '9 years across GCP and AWS; authored modular Terraform and OPA policy guardrails.',
        },
        {
          requirement: 'Kubernetes, Cloud Run, and Pub/Sub / Kafka',
          category: 'Orchestration',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Multi-region GKE and Cloud Run (42M req/day) with Pub/Sub and prior EKS/Kafka migration.',
        },
        {
          requirement: 'Production LLM/RAG & vector search pipelines',
          category: 'AI Infrastructure',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Built Vertex AI embedding + pgvector pipelines cutting p95 latency to 340ms.',
        },
        {
          requirement: 'SOC 2 Type II, VPC controls & FinOps',
          category: 'Governance',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Enforced VPC Service Controls and SOC 2 compliance; saved $940K/year (31%).',
        },
        {
          requirement: 'Architecture Review Boards & executive briefings',
          category: 'Leadership',
          importance: 'Must Have',
          status: 'Matched',
          evidence: 'Led Architecture Review Board for 45 engineers and presented to Fortune 500 CTOs.',
        },
      ],
      matchedSkills: [
        'Google Cloud (GCP)',
        'AWS',
        'Terraform',
        'GKE & EKS',
        'Cloud Run',
        'Pub/Sub & Kafka',
        'Vertex AI & pgvector',
        'SOC 2 Type II',
        'FinOps',
      ],
      missingSkills: [],
      candidateRecommendations: [
        'Specify total cloud budget managed alongside the 31% FinOps savings to confirm enterprise scale.',
        'Include failover drill metrics (RTO/RPO) achieved across us-central1 and europe-west1.',
      ],
      bulletRewrites: [
        {
          original: 'Architected multi-region GKE and Cloud Run inference platform serving 42M daily API requests at 99.98% availability.',
          improved:
            'Designed active-active multi-region GKE and Cloud Run inference architecture (42M req/day, 99.98% SLA) with automated failover and sub-60s regional recovery.',
          rationale: 'Highlights multi-region failover resilience explicitly for principal review panels.',
        },
      ],
      recruiterInterviewProbes: [
        'How did you isolate multi-tenant vector indexes inside pgvector to satisfy Fortune 500 SOC 2 auditors?',
        'What autoscaling and spot/committed-use trade-offs drove the $940K FinOps savings without hurting p95 latency?',
      ],
      telemetry: {
        model: 'gemini-4-hydrogen',
        embeddingModel: 'gemini-embedding-2',
        vectorSimilarity: 0.91,
        coverageScore: 100,
        rubricScore: 95,
        inferenceMs: 1390,
        evaluatedAt: '2026-11-18T08:45:00Z',
        inputFormat: 'text',
        extractedCharacters: 1290,
        pageCount: null,
      },
      source: 'baseline',
    },
  },
  {
    id: 'marketing-lead',
    label: 'Marketing Lead',
    industry: 'Marketing',
    targetRole: 'Growth & Demand Generation Manager',
    candidateName: 'Jordan Brooks',
    weights: { coreSkills: 35, experienceImpact: 30, domainAlignment: 20, leadershipCommunication: 15 },
    jobDescription: `Growth & Demand Generation Manager — B2B Software
Location: Austin, TX / Remote

Role Overview:
Own paid acquisition, lifecycle email automation, and pipeline attribution across LinkedIn, Google Search, and HubSpot to drive qualified enterprise demos.

Required Qualifications:
- 4+ years managing B2B demand generation or paid acquisition budgets ($40K+/month).
- Hands-on HubSpot or Marketo marketing automation, Salesforce attribution, and lead scoring.
- Proven track record optimizing Google Ads, LinkedIn Ads, and SEO landing page conversion rates.
- Comfort partnering with Sales Development (SDRs) and Content teams on pipeline targets.

Preferred Qualifications:
- Experience with ABM campaigns (6sense or Demandbase).`,
    resumeText: `JORDAN BROOKS
Austin, TX | jordan.brooks@example.com | Digital Marketing Specialist

SUMMARY
Digital marketer with 3 years of experience managing consumer e-commerce social campaigns, email newsletters, and brand partnerships.

EXPERIENCE
Digital Marketing Coordinator — Sunburst Apparel (2023–Present)
- Managed $15K/month Meta and TikTok paid social campaigns achieving 2.8x ROAS across seasonal apparel drops.
- Designed weekly Klaviyo email newsletters for 95,000 subscribers, lifting click-through rates by 19%.
- Collaborated with graphic designers on ad creative testing.

Marketing Associate — LocalCraft Co. (2022–2023)
- Wrote blog posts and managed Instagram community calendar; increased organic followers by 34%.

EDUCATION
B.S. Marketing, University of Texas at Austin`,
    baselineResult: {
      id: 'baseline-marketing-lead',
      candidateName: 'Jordan Brooks',
      detectedRole: 'Digital Marketing Coordinator',
      targetRole: 'Growth & Demand Generation Manager',
      overallScore: 46,
      fitVerdict: 'Low Alignment',
      executiveSummary:
        'Jordan Brooks brings solid B2C paid social (Meta/TikTok) and Klaviyo email skills, but falls short of B2B SaaS demand-generation requirements including 4+ years experience, $40K+ budgets, HubSpot/Salesforce attribution, and LinkedIn/Google Search pipeline ownership.',
      dimensionScores: {
        coreSkills: 44,
        experienceImpact: 48,
        domainAlignment: 38,
        leadershipCommunication: 56,
      },
      dimensionRationales: {
        coreSkills:
          'Meta, TikTok, and Klaviyo skills do not cover required HubSpot/Marketo, Salesforce attribution, or Google/LinkedIn B2B ads.',
        experienceImpact:
          '3 years at $15K/month consumer spend is below the 4+ year / $40K+/month B2B requirement.',
        domainAlignment:
          'Background is B2C DTC apparel rather than B2B enterprise software pipeline generation.',
        leadershipCommunication:
          'Collaborated with creative designers, though lacks SDR and B2B sales pipeline partnership.',
      },
      weightsUsed: { coreSkills: 35, experienceImpact: 30, domainAlignment: 20, leadershipCommunication: 15 },
      requirementsMatrix: [
        {
          requirement: '4+ years B2B demand gen ($40K+/mo budget)',
          category: 'Experience',
          importance: 'Must Have',
          status: 'Missing',
          evidence: '3 years in B2C e-commerce managing $15K/month Meta/TikTok budgets.',
        },
        {
          requirement: 'HubSpot/Marketo & Salesforce lead attribution',
          category: 'MarTech Stack',
          importance: 'Must Have',
          status: 'Missing',
          evidence: 'Uses Klaviyo for B2C email; no HubSpot, Marketo, or Salesforce CRM listed.',
        },
        {
          requirement: 'Google Ads, LinkedIn Ads & landing page CRO',
          category: 'Acquisition',
          importance: 'Must Have',
          status: 'Missing',
          evidence: 'Paid experience is limited to Meta and TikTok social campaigns.',
        },
        {
          requirement: 'Cross-functional collaboration with SDRs & Content',
          category: 'Collaboration',
          importance: 'Must Have',
          status: 'Partial',
          evidence: 'Worked with content/creative teams, but no SDR or sales-qualified pipeline alignment.',
        },
      ],
      matchedSkills: ['Paid Ad Creative Testing', 'Email Lifecycle Automation', 'Content Marketing'],
      missingSkills: [
        'HubSpot / Marketo',
        'Salesforce Attribution',
        'LinkedIn Ads & Google Search',
        'B2B Pipeline Metrics',
        'ABM (6sense / Demandbase)',
      ],
      candidateRecommendations: [
        'Focus applications on DTC / E-Commerce Growth Specialist roles where Meta, TikTok, and Klaviyo directly match.',
        'If transitioning into B2B SaaS, obtain HubSpot Marketing Software certification and highlight lead-funnel conversion experiments.',
        'Quantify landing page conversion rates alongside ROAS and email CTR improvements.',
      ],
      bulletRewrites: [
        {
          original: 'Designed weekly Klaviyo email newsletters for 95,000 subscribers, lifting click-through rates by 19%.',
          improved:
            'Built automated lifecycle segmentation and A/B tested email workflows for 95,000 contacts in Klaviyo, increasing click-through conversion by 19%.',
          rationale: 'Translates newsletter execution into lifecycle automation terminology.',
        },
      ],
      recruiterInterviewProbes: [
        'Have you ever built multi-touch pipeline attribution or worked directly alongside outbound B2B SDR teams?',
        'How would you adapt your creative testing process from impulse B2C apparel to a 60-day B2B demo funnel?',
      ],
      telemetry: {
        model: 'gemini-4-hydrogen',
        embeddingModel: 'gemini-embedding-2',
        vectorSimilarity: 0.56,
        coverageScore: 34,
        rubricScore: 46,
        inferenceMs: 1190,
        evaluatedAt: '2026-11-18T08:47:00Z',
        inputFormat: 'text',
        extractedCharacters: 910,
        pageCount: null,
      },
      source: 'baseline',
    },
  },
];

export const CLOUD_PIPELINE_STAGES: CloudPipelineStage[] = [
  {
    index: '01',
    title: '01. Cloud Document Parsing & Text Verification',
    cloudLayer: 'Express API Gateway + Pure-JS PDF / DOCX Parsers',
    aiComponent: 'unpdf + mammoth + Multimodal PDF OCR Fallback',
    summary:
      'Resumes arrive as multi-column PDFs, Word DOCX files, or plain text. The cloud ingestion layer extracts clean, verifiable text immediately and automatically invokes multimodal PDF reading if a file is image-scanned.',
    mechanism:
      'Parses PDF pages via unpdf and DOCX files via mammoth in milliseconds, returning exact character counts and editable text so users confirm nothing was truncated.',
    inputContract: '{ fileName, mimeType, base64Data }',
    outputContract: '{ text, format, characterCount, pageCount, usedOcrFallback }',
    latencyTarget: '30–120 ms',
  },
  {
    index: '02',
    title: '02. Semantic Vector Embedding & Cosine Alignment',
    cloudLayer: 'Stateless Cloud Compute Tier',
    aiComponent: 'gemini-embedding-2 Dense Vectors',
    summary:
      'Keyword filters reject strong applicants who phrase skills differently (e.g., "Postgres" vs "PostgreSQL" or "K8s" vs "Kubernetes"). Dense vector embeddings measure conceptual overlap across the full resume and job posting.',
    mechanism:
      'Projects extracted resume text and job description into unified embedding vectors and computes exact server-side cosine similarity on every PDF, DOCX, and TXT submission.',
    inputContract: '[extractedResumeText, jobDescription]',
    outputContract: '{ vectorSimilarity: 0.88 }',
    latencyTarget: '180–320 ms',
  },
  {
    index: '03',
    title: '03. High-Reasoning Rubric & Requirement Audit',
    cloudLayer: 'Server-Side AI Orchestrator (Cloud Run Ready)',
    aiComponent: 'gemini-4-hydrogen (ThinkingLevel.HIGH + JSON Schema)',
    summary:
      'Extracts every Must-Have and Preferred qualification from the job description, checks years-of-experience math, recognizes genuine tool equivalents, and cites exact resume proof for each requirement.',
    mechanism:
      'Enforces a strict typed responseSchema so every requirement receives Matched, Partial, or Missing status alongside grounded resume quotes.',
    inputContract: 'System Calibration Prompt + Resume + JD + Type.OBJECT Schema',
    outputContract: '4 Sub-Scores + Requirements Matrix + Bullet Rewrites',
    latencyTarget: '1.2–2.4 s',
  },
  {
    index: '04',
    title: '04. Calibrated Coverage + Weighted Arithmetic',
    cloudLayer: 'Deterministic Server Scoring Guardrail',
    aiComponent: '70% Rubric + 30% Requirement Coverage Formula',
    summary:
      'Composite match scores are calculated deterministically on the server rather than guessed by a language model. Must-Have criteria carry 2x weight inside requirement coverage so missing critical skills accurately affects the final grade.',
    mechanism:
      'overallScore = round(0.70 * weightedRubric + 0.30 * requirementCoverage) with explicit fit verdict bands (>=85 Strong, 70-84 Competitive, 50-69 Partial, <50 Low).',
    inputContract: 'dimensionScores + normalizedWeights + requirementsMatrix',
    outputContract: '{ overallScore, coverageScore, rubricScore, fitVerdict }',
    latencyTarget: '< 2 ms',
  },
  {
    index: '05',
    title: '05. Batch Candidate Ranking & Report Export',
    cloudLayer: 'Multi-Resume Queue + Persistent Browser Ledger',
    aiComponent: 'Concurrent Evaluation & Printable Audit Reports',
    summary:
      'Job seekers get actionable bullet rewrites and missing-skill checklists; recruiters can upload multiple PDF/DOCX/TXT resumes at once and rank candidates side-by-side with CSV, JSON, and print-ready exports.',
    mechanism:
      'Persists evaluations locally across sessions and surfaces tailored interview probes targeting Partial and Missing requirements.',
    inputContract: 'MatchAnalysisResult[]',
    outputContract: 'Sortable Leaderboard + CSV / JSON / Print PDF Export',
    latencyTarget: 'Instant UI Hydration',
  },
];
