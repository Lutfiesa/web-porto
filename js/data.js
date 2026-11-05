/**
 * SINGLE SOURCE OF TRUTH DEFAULT DATA
 * Directly transcribed from portfolio-reference.md
 * Owner: Lutfi Esa Prasetyo
 */

const STORAGE_KEY = 'lep_portfolio_data';
const PIN_KEY = 'lep_admin_pin';
const THEME_KEY = 'lep_theme';
const DEFAULT_PIN = '020497'; // 2 April 1997

const DEFAULT_PORTFOLIO_DATA = {
  profile: {
    name: "Lutfi Esa Prasetyo",
    role: "QA Automation Engineer / System Analyst",
    birthInfo: "Banyumas, 2 April 1997",
    email: "lutfiesa@gmail.com",
    phone: "081212882818",
    address: "DKI Jakarta",
    linkedin: "Lutfi Esa Prasetyo",
    linkedinUrl: "https://www.linkedin.com/in/lutfiesap",
    github: "Lutfi Esa Prasetyo",
    githubUrl: "https://github.com/Lutfiesa",
    tagline: "QA Automation Engineer dengan pengalaman membangun test framework, automation script (Web, API, Mobile), dan CI/CD pipeline, serta pengalaman sebagai System Analyst dalam menerjemahkan kebutuhan bisnis menjadi spesifikasi teknis.",
    about: "QA Automation Engineer dengan pengalaman membangun test framework, automation script (Web, API, Mobile), dan CI/CD pipeline, serta pengalaman sebagai System Analyst dalam menerjemahkan kebutuhan bisnis menjadi spesifikasi teknis."
  },
  experiences: [
    {
      id: "exp-1",
      company: "PT Bagus Harapan Tritunggal",
      role: "System Analyst & Application Support",
      period: "April 2026 – Present",
      logo: "https://www.google.com/s2/favicons?domain=bht.co.id&sz=128",
      companyShort: "BHT",
      brandColor: "#0284c7",
      responsibilities: [
        "Gather comprehensive business requirements from stakeholders and transfer them effectively into actionable specifications for the development team.",
        "Define and allocate clear, detailed tasks to the respective development and infrastructure teams based on system architectures.",
        "Create detailed system design documentation, including Functional Specification Documents (FSD), UML diagrams, and technical flowcharts.",
        "Collaborate with cross-functional teams to align business goals with technical execution and delivery.",
        "Manage project timelines, prioritize feature backlogs, and lead daily stand-up meetings to ensure timely delivery.",
        "Provide advanced production support (L2/L3) and perform rapid troubleshooting for application, database, and system integration issues."
      ]
    },
    {
      id: "exp-2",
      company: "PT Qoin Digital Indonesia (QOIN)",
      role: "QA Automation Engineer",
      period: "September 2023 – April 2026",
      logo: "https://www.google.com/s2/favicons?domain=qoin.id&sz=128",
      companyShort: "QOIN",
      brandColor: "#6366f1",
      responsibilities: [
        "Review and analyze system specifications.",
        "Collaborate with team to develop effective strategies and test plans.",
        "Execute test cases (manual or automated) and analyze results.",
        "Developed test scripts using JMeter for performance testing.",
        "Evaluate product code according to specifications.",
        "Create logs to document testing phases and defects.",
        "Report bugs and errors to development teams.",
        "Help troubleshoot issues.",
        "Conduct post-release / post-implementation testing.",
        "Work with cross-functional teams to ensure quality throughout the software development lifecycle."
      ]
    },
    {
      id: "exp-3",
      company: "PT Federal International Finance (FIFGROUP)",
      role: "QA Automation Engineer",
      period: "April 2022 – September 2023",
      logo: "https://www.google.com/s2/favicons?domain=fifgroup.co.id&sz=128",
      companyShort: "FIF",
      brandColor: "#1d4ed8",
      responsibilities: [
        "Developed test scripts using Katalon Studio for API automation, Web UI Automation, and Mobile Automation.",
        "Developed test scripts using Silk Test Performance for performance testing.",
        "Built test framework using Katalon Studio for UI Automation and API automation with Custom Keyword Approaching.",
        "Using git as version control system for every test script automation.",
        "Developed test script for integration testing between UI, API, and Database (PostgreSQL & Oracle).",
        "Create profile environment automation testing for testing application in Dev, Test, Staging, and Production.",
        "Using JIRA as Issue tracking.",
        "Reviewed automation scripts.",
        "Sharing knowledge about automation testing every Friday with all QA member."
      ]
    },
    {
      id: "exp-4",
      company: "PT Federal International Finance (FIFGROUP)",
      role: "QA Deployer",
      period: "Agustus 2019 – April 2022",
      logo: "https://www.google.com/s2/favicons?domain=fifgroup.co.id&sz=128",
      companyShort: "FIF",
      brandColor: "#1d4ed8",
      responsibilities: [
        "Source Control when the source will enter the test/live machine.",
        "Support troubleshoot server environment test.",
        "Create Pipeline Deploy automation using Jenkins."
      ]
    },
    {
      id: "exp-5",
      company: "BOSNET Distribution Indonesia",
      role: "Implementor",
      period: "Januari 2019 – Agustus 2019",
      logo: "https://www.google.com/s2/favicons?domain=bosnetdis.com&sz=128",
      companyShort: "BOSNET",
      brandColor: "#dc2626",
      responsibilities: [
        "Implement Bosnet applications to clients.",
        "User training on the Bosnet application.",
        "Setup, Configure, Test the Application until it runs properly.",
        "Do Live Preparation (Data Transfer, Application settings, etc.).",
        "Monitoring the Implementation Process.",
        "Documenting Project.",
        "Working on application bug issues."
      ]
    },
    {
      id: "exp-6",
      company: "PT. Wisesa Consulting Indonesia",
      role: "Software Implementation Consultant",
      period: "September 2016 – Desember 2018",
      logo: "https://www.wisesa-consulting.com/assets/img/logo-wisesa.svg",
      companyShort: "WISECON",
      brandColor: "#0d9488",
      responsibilities: [
        "Identify, analyze, and develop business requirements for applications.",
        "Testing application, find bugs, teaching users, and professionally manage project deadline.",
        "Create detailed documentations of all handled projects.",
        "Create Script Report using SQL."
      ]
    }
  ],
  skills: [
    {
      id: "skill-1",
      category: "Programming Language",
      items: ["Basic Javascript", "Java", "HTML", "Shell"]
    },
    {
      id: "skill-2",
      category: "Server",
      items: ["Linux Server"]
    },
    {
      id: "skill-3",
      category: "Database",
      items: ["MySQL"]
    },
    {
      id: "skill-4",
      category: "Automation Framework/Tools",
      items: ["Katalon", "Cypress", "Selenium", "Cucumber"]
    },
    {
      id: "skill-5",
      category: "Testing Framework",
      items: ["JUnit", "TestNG"]
    },
    {
      id: "skill-6",
      category: "Mobile Automation",
      items: ["Appium (Android)"]
    },
    {
      id: "skill-7",
      category: "API Automation",
      items: ["Katalon"]
    },
    {
      id: "skill-8",
      category: "Performance Testing",
      items: ["JMeter"]
    },
    {
      id: "skill-9",
      category: "CI/CD",
      items: ["Jenkins"]
    },
    {
      id: "skill-10",
      category: "Methodology",
      items: ["Agile"]
    },
    {
      id: "skill-11",
      category: "Version Control",
      items: ["Git", "SVN"]
    },
    {
      id: "skill-12",
      category: "Issue Tracking",
      items: ["JIRA"]
    },
    {
      id: "skill-13",
      category: "Infrastructure Automation",
      items: ["Ansible"]
    }
  ],
  education: [
    {
      id: "edu-1",
      level: "QA Engineer Bootcamp",
      institution: "JAYJAY",
      period: "2024 – 2025",
      notes: "-"
    },
    {
      id: "edu-2",
      level: "Bachelor Degree, Sistem Informasi",
      institution: "Universitas Siber Asia",
      period: "2021 – Sekarang",
      notes: "GPA: -"
    },
    {
      id: "edu-3",
      level: "Senior High School (TKJ)",
      institution: "SMKN 1 Jakarta",
      period: "2012 – 2015",
      notes: "-"
    }
  ],
  certificates: [
    {
      id: "cert-1",
      name: "Bootcamp Jayjay QA Engineer",
      link: "https://drive.google.com/file/d/149wTMGcNp6A0f52QRigRy1Kn2hVwPvEi/view?usp=sharing",
      issuer: "JAYJAY"
    },
    {
      id: "cert-2",
      name: "Katalon Practitioner Certification",
      link: "https://academy.katalon.com/mcertificate/6881d0a3c6fc3",
      issuer: "Katalon Academy"
    },
    {
      id: "cert-3",
      name: "Katalon Studio Beginners",
      link: "https://www.udemy.com/certificate/UC-3cf92fc3-3b79-42b8-af9c-1d89107ceec2/",
      issuer: "Udemy"
    },
    {
      id: "cert-4",
      name: "Workshop Otomatisasi API Berbasis Pytest",
      link: "https://drive.google.com/file/d/1kLjTAdL6FNYHQpZIi1Fptr8Q_lEbFyxw/view",
      issuer: "Workshop / Training"
    },
    {
      id: "cert-5",
      name: "Quality Assurance Mastery",
      link: "https://www.udemy.com/certificate/UC-80181f26-350d-4276-982a-58a636a9fc31/",
      issuer: "Udemy"
    },
    {
      id: "cert-6",
      name: "Fundamental SQL",
      link: "https://academy.dqlab.id/certificate/pdf/DQLABSQLT1UTVTCV/NONTRACK",
      issuer: "DQLab"
    }
  ]
};
