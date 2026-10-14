/* =========================================================
   CAREERSCOPE — DASHBOARD STEPS 3, 4 & 5
   Metrics + Charts + Job Explorer + Salary Explorer
   Demo data only; connect a verified API for live data.
========================================================= */
(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const byId = (id) => document.getElementById(id);
  const all = (selector) => [...document.querySelectorAll(selector)];

  const on = (element, event, callback) => {
    if (element) element.addEventListener(event, callback);
  };

  const setText = (id, value) => {
    const element = byId(id);
    if (element) element.textContent = value;
  };

  const setHTML = (id, value) => {
    const element = byId(id);
    if (element) element.innerHTML = value;
  };

  const safeRead = (key, fallback) => {
    try {
      const value = localStorage.getItem("cs_" + key);
      return value ? JSON.parse(value) : fallback;
    } catch (_) {
      return fallback;
    }
  };

  const safeWrite = (key, value) => {
    try {
      localStorage.setItem("cs_" + key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  };

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);

  /* =========================================================
     1. SIDEBAR, PROFILE, SEARCH AND LOGOUT
  ========================================================= */

  const shell = $(".dashboard-shell");
  const sidebar = byId("dashboardSidebar");
  const menuButton = byId("mobileMenuButton");
  const navLinks = all(".menu-link");
  const searchInput = byId("dashboardSearch");
  const searchResults = byId("searchResults");
  const profileButton = byId("profileButton");
  const profileDropdown = byId("profileDropdown");

  let guestName = "";

  try {
    guestName = sessionStorage.getItem("guestName")?.trim() || "";
  } catch (_) {}

  const displayName = guestName || "Explorer";

  setText("welcomeName", displayName);
  setText("profileFullName", displayName);
  setText("profileAvatar", displayName.charAt(0).toUpperCase());

  function closeSidebar() {
    shell?.classList.remove("sidebar-open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation");
  }

  on(menuButton, "click", () => {
    if (!shell) return;

    const open = shell.classList.toggle("sidebar-open");

    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );
  });

  function updateActiveLink() {
    const section = location.hash.slice(1) || "overview";

    navLinks.forEach((link) => {
      const active = link.dataset.section === section;

      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  navLinks.forEach((link) => {
    on(link, "click", () => {
      closeSidebar();

      if (searchResults) searchResults.hidden = true;
      if (searchInput) searchInput.value = "";
    });
  });

  window.addEventListener("hashchange", updateActiveLink);
  updateActiveLink();

  function renderSearchResults() {
    if (!searchInput || !searchResults) return;

    const query = searchInput.value.trim().toLowerCase();
    searchResults.replaceChildren();

    if (!query) {
      searchResults.hidden = true;
      return;
    }

    const matches = navLinks.filter((link) =>
      link.textContent.trim().toLowerCase().includes(query)
    );

    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "search-empty";
      empty.textContent =
        "No matching section. Try jobs, skills, trends, or profile.";

      searchResults.append(empty);
    } else {
      matches.forEach((link) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "search-result";

        const title = document.createElement("span");
        title.textContent =
          link.querySelector("span:last-child")?.textContent ||
          link.textContent.trim();

        const description = document.createElement("small");
        description.textContent = "Open dashboard section";

        button.append(title, description);

        button.addEventListener("click", () => {
          location.hash = link.dataset.section;
          searchResults.hidden = true;
          searchInput.value = "";
          closeSidebar();
        });

        searchResults.append(button);
      });
    }

    searchResults.hidden = false;
  }

  on(searchInput, "input", renderSearchResults);

  on(searchInput, "keydown", (event) => {
    if (event.key === "Enter") {
      searchResults?.querySelector(".search-result")?.click();
    }

    if (event.key === "Escape") {
      if (searchResults) searchResults.hidden = true;
      searchInput.blur();
    }
  });

  on(profileButton, "click", () => {
    if (!profileDropdown || !profileButton) return;

    const open = profileButton.getAttribute("aria-expanded") !== "true";

    profileButton.setAttribute("aria-expanded", String(open));
    profileDropdown.hidden = !open;
  });

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!target.closest(".profile-menu")) {
      if (profileButton) {
        profileButton.setAttribute("aria-expanded", "false");
      }

      if (profileDropdown) profileDropdown.hidden = true;
    }

    if (
      !target.closest(".topbar-search") &&
      !target.closest(".profile-menu") &&
      searchResults
    ) {
      searchResults.hidden = true;
    }

    if (
      window.innerWidth <= 760 &&
      shell?.classList.contains("sidebar-open") &&
      !sidebar?.contains(target) &&
      !menuButton?.contains(target)
    ) {
      closeSidebar();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    closeSidebar();

    if (profileDropdown) profileDropdown.hidden = true;

    profileButton?.setAttribute("aria-expanded", "false");

    if (searchResults) searchResults.hidden = true;
  });

  on(byId("logoutButton"), "click", () => {
    try {
      sessionStorage.removeItem("guestName");
      sessionStorage.removeItem("guestMode");
    } catch (_) {}

    window.location.href = "login.html";
  });

  /* =========================================================
     2. STEP 3 — METRICS AND INTERACTIVE CHARTS
  ========================================================= */

  const demo = {
    "30": {
      openings: "8,420",
      salary: "₹12.1L",
      skills: "132",
      role: "Data Analyst",
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      openingsSeries: [1420, 1680, 1910, 2240],
      applications: [610, 720, 685, 840]
    },

    "90": {
      openings: "24,860",
      salary: "₹12.4L",
      skills: "148",
      role: "Data Analyst",
      labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      openingsSeries: [3200, 3540, 3890, 4210, 4620, 5400],
      applications: [1420, 1510, 1640, 1770, 1880, 2130]
    },

    "365": {
      openings: "96,240",
      salary: "₹12.8L",
      skills: "176",
      role: "AI Engineer",
      labels: ["Nov", "Jan", "Mar", "May", "Jul", "Sep"],
      openingsSeries: [10800, 12100, 13900, 15400, 17300, 20100],
      applications: [4200, 4800, 5200, 6100, 6900, 7800]
    }
  };

  const palette = {
    cyan: "#06b6d4",
    violet: "#8b5cf6",
    lavender: "#b9a2ff",
    muted: "rgba(255,255,255,.58)",
    grid: "rgba(255,255,255,.08)"
  };

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 450 },

    plugins: {
      legend: { display: false },

      tooltip: {
        backgroundColor: "rgba(7,7,20,.96)",
        borderColor: "rgba(139,92,246,.45)",
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "#d8d4f5",
        padding: 12,
        displayColors: true
      }
    },

    scales: {
      x: {
        ticks: {
          color: palette.muted,
          font: { family: "JetBrains Mono", size: 10 }
        },
        grid: { display: false },
        border: { display: false }
      },

      y: {
        beginAtZero: true,
        ticks: {
          color: palette.muted,
          font: { family: "JetBrains Mono", size: 10 },
          maxTicksLimit: 5
        },
        grid: { color: palette.grid },
        border: { display: false }
      }
    }
  };

  let trendChart = null;
  let categoryChart = null;
  let skillsChart = null;

  function showChartError() {
    all(".chart-card").forEach((card) => {
      if (card.querySelector(".chart-error")) return;

      const note = document.createElement("p");
      note.className = "chart-error";
      note.textContent =
        "Charts could not load. Check your internet connection and reload.";

      card.append(note);
    });
  }

  function makeCharts(period = "90") {
    const periodSelect = byId("metricPeriod");
    const trendView = byId("trendView");
    const trendCanvas = byId("trendChart");
    const categoryCanvas = byId("categoryChart");
    const skillsCanvas = byId("skillsChart");

    const data = demo[period] || demo["90"];

    setText("openingsMetric", data.openings);
    setText("salaryMetric", data.salary);
    setText("skillsMetric", data.skills);
    setText("roleMetric", data.role);

    if (
      typeof window.Chart === "undefined" ||
      !trendCanvas ||
      !categoryCanvas ||
      !skillsCanvas
    ) {
      if (typeof window.Chart === "undefined") showChartError();
      return;
    }

    const view = trendView?.value || "openings";
    const isApplications = view === "applications";

    setText(
      "trendChartTitle",
      isApplications ? "Hiring activity over time" : "Openings over time"
    );

    const lineValues = isApplications
      ? data.applications
      : data.openingsSeries;

    const lineLabel = isApplications ? "Hiring activity" : "Job openings";

    [trendChart, categoryChart, skillsChart].forEach((chart) => {
      if (chart) chart.destroy();
    });

    trendChart = new Chart(trendCanvas, {
      type: "line",

      data: {
        labels: data.labels,

        datasets: [{
          label: lineLabel,
          data: lineValues,
          borderColor: palette.cyan,

          backgroundColor: (context) => {
            const gradient = context.chart.ctx.createLinearGradient(
              0, 0, 0, 260
            );

            gradient.addColorStop(0, "rgba(6,182,212,.25)");
            gradient.addColorStop(1, "rgba(6,182,212,0)");

            return gradient;
          },

          fill: true,
          tension: 0.38,
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: palette.violet,
          pointBorderColor: "#d8ccff"
        }]
      },

      options: {
        ...chartDefaults,
        interaction: { intersect: false, mode: "index" }
      }
    });

    const categories = [
      "Technology",
      "Analytics",
      "Business",
      "Design"
    ];

    const categoryValues = [38, 27, 21, 14];

    const categoryColors = [
      palette.cyan,
      palette.violet,
      palette.lavender,
      "#386a82"
    ];

    categoryChart = new Chart(categoryCanvas, {
      type: "doughnut",

      data: {
        labels: categories,

        datasets: [{
          data: categoryValues,
          backgroundColor: categoryColors,
          borderColor: "#090914",
          borderWidth: 4,
          hoverOffset: 7
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",

        plugins: {
          legend: { display: false },
          tooltip: chartDefaults.plugins.tooltip
        }
      }
    });

    setHTML(
      "categoryLegend",
      categories.map((label, index) => `
        <div class="legend-item">
          <span class="legend-swatch"
            style="background:${categoryColors[index]}"></span>
          <span>${escapeHTML(label)}</span>
          <strong>${categoryValues[index]}%</strong>
        </div>
      `).join("")
    );

    skillsChart = new Chart(skillsCanvas, {
      type: "bar",

      data: {
        labels: [
          "SQL",
          "Python",
          "Excel",
          "Power BI",
          "Communication"
        ],

        datasets: [{
          label: "Mentions",
          data: [86, 78, 72, 61, 54],

          backgroundColor: [
            palette.cyan,
            palette.violet,
            "#7862bb",
            "#4e7293",
            "#386a82"
          ],

          borderRadius: 5,
          borderSkipped: false
        }]
      },

      options: {
        ...chartDefaults,
        indexAxis: "y",

        scales: {
          x: {
            ...chartDefaults.scales.x,
            grid: { color: palette.grid }
          },

          y: {
            ...chartDefaults.scales.y,
            grid: { display: false }
          }
        }
      }
    });
  }

  on(byId("metricPeriod"), "change", (event) => {
    makeCharts(event.target.value);
  });

  on(byId("trendView"), "change", () => {
    makeCharts(byId("metricPeriod")?.value || "90");
  });

  makeCharts(byId("metricPeriod")?.value || "90");

  /* =========================================================
     3. SHARED DEMO CAREERS, SAVED ITEMS AND APPLICATIONS
  ========================================================= */

  const careerData = [
    {
      title: "Data Analyst",
      level: "Analytics",
      salary: "₹8–14 LPA",
      description:
        "Turn business data into reports, dashboards, and decisions.",
      skills: ["SQL", "Excel", "Power BI", "Statistics"]
    },
    {
      title: "Software Engineer",
      level: "Engineering",
      salary: "₹12–22 LPA",
      description:
        "Build, test, and maintain reliable software products.",
      skills: ["Programming", "Data structures", "Git", "APIs"]
    },
    {
      title: "UX Designer",
      level: "Design",
      salary: "₹7–13 LPA",
      description:
        "Research user needs and design clear, accessible experiences.",
      skills: ["Figma", "User research", "Prototyping", "Usability"]
    },
    {
      title: "Product Manager",
      level: "Product",
      salary: "₹15–26 LPA",
      description:
        "Align customer needs, business outcomes, and product delivery.",
      skills: [
        "Prioritization",
        "Analytics",
        "Communication",
        "Roadmapping"
      ]
    }
  ];

  let savedItems = safeRead("saved", []);
  let applications = safeRead("applications", []);

  if (!Array.isArray(savedItems)) savedItems = [];
  if (!Array.isArray(applications)) applications = [];

  function renderCareers() {
    const container = byId("careerResults");
    if (!container) return;

    container.innerHTML = careerData.map((career) => `
      <article class="feature-card">
        <span class="feature-meta">${escapeHTML(career.level)}</span>
        <h3>${escapeHTML(career.title)}</h3>
        <p>${escapeHTML(career.description)}</p>
        <p><strong>${escapeHTML(career.salary)}</strong></p>
        <p>Core skills: ${career.skills.map(escapeHTML).join(" · ")}</p>

        <div class="feature-actions">
          <button class="small-action"
            type="button"
            data-save-career="${escapeHTML(career.title)}">
            ☆ Save career
          </button>

          <button class="small-action"
            type="button"
            data-skill-career="${escapeHTML(career.title)}">
            Build skill plan
          </button>
        </div>
      </article>
    `).join("");
  }

  function renderSaved() {
    const container = byId("savedItems");
    if (!container) return;

    container.innerHTML = savedItems.length
      ? savedItems.map((item, index) => `
          <article class="feature-card">
            <span class="feature-meta">${escapeHTML(item.kind)}</span>
            <h3>${escapeHTML(item.title)}</h3>

            <div class="feature-actions">
              <button class="small-action"
                type="button"
                data-remove-saved="${index}">
                Remove
              </button>
            </div>
          </article>
        `).join("")
      : `<div class="result-panel">
          No saved items yet. Save a career to see it here.
        </div>`;
  }

  function renderApplications() {
    const container = byId("applicationList");
    if (!container) return;

    container.innerHTML = applications.length
      ? applications.map((application, index) => `
          <article class="feature-card">
            <h3>${escapeHTML(application.role)}</h3>

            <label class="feature-meta">
              STAGE
              <select data-app-stage="${index}">
                ${[
                  "Interested",
                  "Applied",
                  "Interview",
                  "Offer",
                  "Rejected"
                ].map((stage) => `
                  <option ${application.stage === stage ? "selected" : ""}>
                    ${stage}
                  </option>
                `).join("")}
              </select>
            </label>

            <div class="feature-actions">
              <button class="small-action"
                type="button"
                data-remove-app="${index}">
                Remove
              </button>
            </div>
          </article>
        `).join("")
      : `<div class="result-panel">
          No applications tracked yet. Track a role from Explore Jobs.
        </div>`;
  }

  /* =========================================================
     4. STEP 4 — JOB EXPLORER
     This is the ONLY job explorer renderer in this script.
  ========================================================= */

  const jobs = [
    {
      id: 1,
      title: "Data Analyst",
      company: "Nexa Analytics",
      location: "Hyderabad",
      type: "Hybrid",
      experience: "Entry level",
      category: "Analytics",
      minSalary: 8,
      maxSalary: 12,
      skills: ["SQL", "Python", "Power BI"],
      description:
        "Turn business data into insights, reports, and dashboards.",
      responsibilities: [
        "Analyze datasets and identify trends.",
        "Build dashboards and recurring reports.",
        "Present findings to business teams."
      ],
      requirements:
        "SQL, spreadsheet skills, analytical thinking, and basic Python."
    },

    {
      id: 2,
      title: "Frontend Developer",
      company: "PixelForge",
      location: "Bengaluru",
      type: "Remote",
      experience: "Mid level",
      category: "Engineering",
      minSalary: 12,
      maxSalary: 20,
      skills: ["JavaScript", "React", "CSS"],
      description:
        "Build responsive, accessible interfaces for web products.",
      responsibilities: [
        "Develop reusable UI components.",
        "Improve performance and accessibility.",
        "Collaborate with design and backend teams."
      ],
      requirements:
        "JavaScript, modern CSS, React, and Git experience."
    },

    {
      id: 3,
      title: "UI/UX Designer",
      company: "Northstar Studio",
      location: "Pune",
      type: "Hybrid",
      experience: "Mid level",
      category: "Design",
      minSalary: 10,
      maxSalary: 16,
      skills: ["Figma", "Prototyping", "Design Systems"],
      description:
        "Design intuitive digital experiences from research to delivery.",
      responsibilities: [
        "Create user flows and wireframes.",
        "Build prototypes and high-fidelity designs.",
        "Work with engineers to refine experiences."
      ],
      requirements:
        "A strong portfolio, Figma skills, and user-centered design knowledge."
    },

    {
      id: 4,
      title: "Machine Learning Engineer",
      company: "Quantum Labs",
      location: "Hyderabad",
      type: "On-site",
      experience: "Senior",
      category: "AI & Data Science",
      minSalary: 20,
      maxSalary: 32,
      skills: ["Python", "Machine Learning", "PyTorch"],
      description:
        "Develop, evaluate, and deploy machine-learning solutions.",
      responsibilities: [
        "Train and evaluate machine-learning models.",
        "Build reliable model-serving pipelines.",
        "Collaborate with data and platform engineers."
      ],
      requirements:
        "Python, ML fundamentals, model evaluation, and production experience."
    },

    {
      id: 5,
      title: "Product Manager",
      company: "Orbit Digital",
      location: "Bengaluru",
      type: "Hybrid",
      experience: "Senior",
      category: "Product",
      minSalary: 20,
      maxSalary: 30,
      skills: ["Product Strategy", "Analytics", "Roadmapping"],
      description:
        "Guide product strategy, prioritization, and delivery.",
      responsibilities: [
        "Define product goals and roadmaps.",
        "Prioritize work using customer insights.",
        "Coordinate design, engineering, and stakeholders."
      ],
      requirements:
        "Product delivery experience, communication, and analytical thinking."
    },

    {
      id: 6,
      title: "Backend Developer",
      company: "CloudAxis",
      location: "Chennai",
      type: "On-site",
      experience: "Mid level",
      category: "Engineering",
      minSalary: 12,
      maxSalary: 18,
      skills: ["Node.js", "APIs", "SQL"],
      description:
        "Build APIs and reliable backend services for web applications.",
      responsibilities: [
        "Design and maintain backend APIs.",
        "Improve service reliability and performance.",
        "Work with databases and automated tests."
      ],
      requirements:
        "Backend programming, REST APIs, databases, and debugging skills."
    },

    {
      id: 7,
      title: "Business Intelligence Analyst",
      company: "InsightWorks",
      location: "Pune",
      type: "Remote",
      experience: "Entry level",
      category: "Analytics",
      minSalary: 8,
      maxSalary: 13,
      skills: ["Power BI", "SQL", "Excel"],
      description:
        "Help teams understand performance through business reporting.",
      responsibilities: [
        "Prepare and validate business data.",
        "Create BI dashboards and KPI reports.",
        "Translate stakeholder questions into analysis."
      ],
      requirements:
        "SQL basics, Excel, visualization, and attention to detail."
    },

    {
      id: 8,
      title: "AI Engineer",
      company: "NeuralSpring",
      location: "Remote",
      type: "Remote",
      experience: "Mid level",
      category: "AI & Data Science",
      minSalary: 16,
      maxSalary: 26,
      skills: ["Python", "LLMs", "APIs"],
      description:
        "Prototype and integrate AI-powered features into digital products.",
      responsibilities: [
        "Build AI application prototypes.",
        "Evaluate model outputs and quality.",
        "Integrate model APIs into product workflows."
      ],
      requirements:
        "Python, APIs, AI fundamentals, and software development experience."
    },

    {
      id: 9,
      title: "Junior Product Designer",
      company: "BrightPath",
      location: "Chennai",
      type: "Hybrid",
      experience: "Entry level",
      category: "Design",
      minSalary: 6,
      maxSalary: 10,
      skills: ["Figma", "Wireframes", "UI Design"],
      description:
        "Help shape useful experiences for early-stage products.",
      responsibilities: [
        "Create wireframes and interface concepts.",
        "Support usability reviews.",
        "Maintain shared design components."
      ],
      requirements:
        "Design fundamentals, Figma, and a portfolio of projects."
    },

    {
      id: 10,
      title: "Senior Data Engineer",
      company: "DataOrbit",
      location: "Hyderabad",
      type: "Hybrid",
      experience: "Senior",
      category: "Engineering",
      minSalary: 20,
      maxSalary: 34,
      skills: ["Python", "SQL", "Data Pipelines"],
      description:
        "Design scalable data pipelines and analytics infrastructure.",
      responsibilities: [
        "Build and maintain data pipelines.",
        "Improve data quality and reliability.",
        "Optimize data processing performance."
      ],
      requirements:
        "Advanced SQL, Python, data modeling, and pipeline experience."
    }
  ];

  const jobSearch = byId("jobSearch");
  const jobLocation = byId("jobLocation");
  const jobType = byId("jobType");
  const jobExperience = byId("jobExperience");
  const jobCategory = byId("jobCategory");
  const jobSalary = byId("jobSalary");
  const jobSort = byId("jobSort");
  const jobResults = byId("jobResults");
  const jobCount = byId("jobResultCount");
  const clearJobFilters = byId("clearJobFilters");

  let expandedJobId = null;
  let savedJobIds = safeRead("jobIds", []);

  if (!Array.isArray(savedJobIds)) savedJobIds = [];

  function renderJobs() {
    if (!jobResults) return;

    const query = jobSearch?.value.trim().toLowerCase() || "";
    const location = jobLocation?.value || "";
    const type = jobType?.value || "";
    const experience = jobExperience?.value || "";
    const category = jobCategory?.value || "";
    const minimumSalary = Number(jobSalary?.value || 0);
    const sort = jobSort?.value || "recommended";

    let filtered = jobs.filter((job) => {
      const searchableText = [
        job.title,
        job.company,
        job.location,
        job.type,
        job.experience,
        job.category,
        job.description,
        job.skills.join(" ")
      ].join(" ").toLowerCase();

      return (
        (!query || searchableText.includes(query)) &&
        (!location || job.location === location) &&
        (!type || job.type === type) &&
        (!experience || job.experience === experience) &&
        (!category || job.category === category) &&
        job.minSalary >= minimumSalary
      );
    });

    if (sort === "salary-high") {
      filtered.sort((a, b) => b.maxSalary - a.maxSalary);
    } else if (sort === "salary-low") {
      filtered.sort((a, b) => a.minSalary - b.minSalary);
    } else if (sort === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (jobCount) {
      jobCount.textContent =
        filtered.length +
        (filtered.length === 1
          ? " opportunity found"
          : " opportunities found");
    }

    if (!filtered.length) {
      jobResults.innerHTML = `
        <div class="job-empty-state">
          <h3>No matching opportunities</h3>
          <p>Try another keyword or broaden your filters.</p>
          <button class="job-action-button"
            id="jobEmptyReset"
            type="button">
            Clear all filters
          </button>
        </div>
      `;
      return;
    }

    jobResults.innerHTML = filtered.map((job) => {
      const isSaved = savedJobIds.includes(job.id);
      const isExpanded = expandedJobId === job.id;

      return `
        <article class="job-card">
          <div class="job-card-top">
            <div>
              <p class="job-company">${escapeHTML(job.company)}</p>
              <h3 class="job-title">${escapeHTML(job.title)}</h3>
            </div>
            <span class="job-chip">${escapeHTML(job.category)}</span>
          </div>

          <p class="job-salary">
            ₹${job.minSalary}–${job.maxSalary} LPA
            <small>· illustrative demo data</small>
          </p>

          <div class="job-meta">
            <span class="job-chip">⌖ ${escapeHTML(job.location)}</span>
            <span class="job-chip">${escapeHTML(job.type)}</span>
            <span class="job-chip">${escapeHTML(job.experience)}</span>
          </div>

          <p class="job-description">${escapeHTML(job.description)}</p>

          <div class="job-skills">
            ${job.skills.map((skill) =>
              `<span class="job-skill">#${escapeHTML(skill)}</span>`
            ).join("")}
          </div>

          <div class="job-card-actions">
            <button type="button"
              class="job-primary-action"
              data-job-action="details"
              data-job-id="${job.id}">
              ${isExpanded ? "Hide Details ↑" : "View Details ↗"}
            </button>

            <button type="button"
              class="job-save-button ${isSaved ? "is-saved" : ""}"
              data-job-action="save"
              data-job-id="${job.id}">
              ${isSaved ? "★ Saved" : "☆ Save Job"}
            </button>

            <button type="button"
              data-job-action="apply"
              data-job-id="${job.id}">
              Track Application +
            </button>
          </div>

          ${isExpanded ? `
            <div class="job-detail">
              <h4>Role overview</h4>
              <p>${escapeHTML(job.description)}</p>

              <h4>Key responsibilities</h4>
              <ul>
                ${job.responsibilities.map((item) =>
                  `<li>${escapeHTML(item)}</li>`
                ).join("")}
              </ul>

              <h4>Requirements</h4>
              <p>${escapeHTML(job.requirements)}</p>
            </div>
          ` : ""}
        </article>
      `;
    }).join("");
  }

  function resetJobFilters() {
    if (jobSearch) jobSearch.value = "";
    if (jobLocation) jobLocation.value = "";
    if (jobType) jobType.value = "";
    if (jobExperience) jobExperience.value = "";
    if (jobCategory) jobCategory.value = "";
    if (jobSalary) jobSalary.value = "0";
    if (jobSort) jobSort.value = "recommended";

    expandedJobId = null;
    renderJobs();
  }

  [
    jobSearch,
    jobLocation,
    jobType,
    jobExperience,
    jobCategory,
    jobSalary,
    jobSort
  ].filter(Boolean).forEach((element) => {
    element.addEventListener(
      element === jobSearch ? "input" : "change",
      renderJobs
    );
  });

  on(clearJobFilters, "click", resetJobFilters);

  on(jobResults, "click", (event) => {
    const target = event.target;

    if (target.closest("#jobEmptyReset")) {
      resetJobFilters();
      return;
    }

    const button = target.closest("[data-job-action]");
    if (!button) return;

    const jobId = Number(button.dataset.jobId);
    const action = button.dataset.jobAction;
    const job = jobs.find((item) => item.id === jobId);

    if (!job) return;

    if (action === "details") {
      expandedJobId = expandedJobId === jobId ? null : jobId;
      renderJobs();
      return;
    }

    if (action === "save") {
      savedJobIds = savedJobIds.includes(jobId)
        ? savedJobIds.filter((id) => id !== jobId)
        : [...savedJobIds, jobId];

      safeWrite("jobIds", savedJobIds);

      const title = job.title;

      if (savedJobIds.includes(jobId)) {
        if (!savedItems.some((item) => item.title === title)) {
          savedItems.push({ title, kind: "Job" });
          safeWrite("saved", savedItems);
        }
      } else {
        savedItems = savedItems.filter((item) => item.title !== title);
        safeWrite("saved", savedItems);
      }

      renderSaved();
      renderJobs();
      return;
    }

    if (action === "apply") {
      const tracked = safeRead("applications", []);
      const applicationList = Array.isArray(tracked) ? tracked : [];

      const alreadyTracked = applicationList.some(
        (item) => item.jobId === job.id
      );

      if (alreadyTracked) {
        alert("This role is already in your application tracker.");
        return;
      }

      applicationList.push({
        jobId: job.id,
        role: job.title + " — " + job.company,
        stage: "Interested",
        title: job.title,
        company: job.company,
        addedAt: new Date().toISOString()
      });

      safeWrite("applications", applicationList);
      applications = applicationList;
      renderApplications();

      alert(job.title + " added to your application tracker.");
    }
  });

  /* =========================================================
     5. STEP 5 — SALARY AND LOCATIONS EXPLORER

     IMPORTANT:
     This is the ONLY salary explorer renderer.
     There is no duplicate renderSalary() or salaryBase error.
  ========================================================= */

  const roleSelect = byId("salaryRole");
  const experienceSelect = byId("salaryExperience");
  const metricSelect = byId("salaryCompareMetric");
  const costCitySelect = byId("salaryCostCity");
  const salaryChart = byId("salaryCityChart");
  const salaryTableBody = byId("salaryComparisonRows");

  const salarySectionExists = Boolean(
    roleSelect &&
    experienceSelect &&
    metricSelect &&
    costCitySelect &&
    salaryChart &&
    salaryTableBody
  );

  if (salarySectionExists) {
    const cities = {
      Hyderabad: {
        expenses: {
          Rent: 12000,
          Food: 7000,
          Transport: 2500,
          Utilities: 2500,
          Other: 4000
        }
      },

      Bengaluru: {
        expenses: {
          Rent: 16000,
          Food: 7500,
          Transport: 3000,
          Utilities: 2500,
          Other: 4500
        }
      },

      Pune: {
        expenses: {
          Rent: 12000,
          Food: 6500,
          Transport: 2500,
          Utilities: 2200,
          Other: 3800
        }
      },

      Chennai: {
        expenses: {
          Rent: 10000,
          Food: 6000,
          Transport: 2200,
          Utilities: 2200,
          Other: 3500
        }
      },

      Mumbai: {
        expenses: {
          Rent: 22000,
          Food: 8000,
          Transport: 3500,
          Utilities: 3000,
          Other: 5000
        }
      }
    };

    const salaryBase = {
      "Data Analyst": {
        Hyderabad: [5, 9],
        Bengaluru: [6, 11],
        Pune: [5, 9],
        Chennai: [5, 9],
        Mumbai: [6, 11]
      },

      "Frontend Developer": {
        Hyderabad: [6, 11],
        Bengaluru: [7, 13],
        Pune: [6, 11],
        Chennai: [5, 10],
        Mumbai: [7, 13]
      },

      "Data Scientist": {
        Hyderabad: [7, 13],
        Bengaluru: [8, 15],
        Pune: [7, 12],
        Chennai: [6, 12],
        Mumbai: [8, 15]
      },

      "UI/UX Designer": {
        Hyderabad: [5, 9],
        Bengaluru: [6, 11],
        Pune: [5, 9],
        Chennai: [5, 8],
        Mumbai: [6, 11]
      },

      "Backend Developer": {
        Hyderabad: [6, 12],
        Bengaluru: [7, 14],
        Pune: [6, 11],
        Chennai: [5, 10],
        Mumbai: [7, 13]
      }
    };

    const experienceMultipliers = {
      entry: 1,
      mid: 1.45,
      senior: 2
    };

    const experienceLabels = {
      entry: "Entry level",
      mid: "Mid level",
      senior: "Senior level"
    };

    const moneyFormatter = new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 1
    });

    function rupees(value) {
      return "₹" + moneyFormatter.format(Math.round(value));
    }

    function lpa(value) {
      return "₹" + Number(value).toFixed(1) + " LPA";
    }

    function getMonthlyExpenses(city) {
      return Object.values(cities[city].expenses)
        .reduce((total, amount) => total + amount, 0);
    }

    function getSalaryData() {
      const role = roleSelect.value;
      const experience = experienceSelect.value;

      const multiplier =
        experienceMultipliers[experience] || experienceMultipliers.entry;

      const selectedRole = salaryBase[role] || salaryBase["Data Analyst"];

      return Object.keys(cities).map((city) => {
        const base = selectedRole[city];

        const min = Math.round(base[0] * multiplier * 10) / 10;
        const max = Math.round(base[1] * multiplier * 10) / 10;
        const midpoint = (min + max) / 2;
        const monthlyExpenses = getMonthlyExpenses(city);

        // Illustrative estimate only, not an actual tax calculation.
        const estimatedMonthlyIncome = midpoint * 100000 / 12 * 0.8;
        const monthlyBalance = estimatedMonthlyIncome - monthlyExpenses;

        return {
          city,
          min,
          max,
          midpoint,
          monthlyExpenses,
          monthlyBalance
        };
      });
    }

    function renderSalaryStats(data) {
      const highest = data.reduce((best, item) =>
        item.midpoint > best.midpoint ? item : best
      );

      const bestBalance = data.reduce((best, item) =>
        item.monthlyBalance > best.monthlyBalance ? item : best
      );

      setText("salaryHighest", lpa(highest.midpoint));
      setText("salaryHighestCity", highest.city);
      setText("salaryCityCount", data.length + " cities");
      setText("salaryTakehome", rupees(bestBalance.monthlyBalance));
      setText("salaryChartTitle", roleSelect.value + " salaries");

      setText(
        "salaryChartDescription",
        (experienceLabels[experienceSelect.value] || "Entry level") +
        " · Estimated annual salary ranges across five cities."
      );
    }

    function renderSalaryChart(data) {
      const metric = metricSelect.value;

      const values = data.map((item) =>
        metric === "takehome"
          ? item.monthlyBalance * 12 / 100000
          : item.midpoint
      );

      const maximum = Math.max(...values, 1);

      salaryChart.setAttribute(
        "aria-label",
        metric === "salary"
          ? "Estimated annual salary midpoint by city"
          : "Estimated annual salary remaining after illustrative expenses"
      );

      salaryChart.innerHTML = data.map((item, index) => {
        const value = values[index];
        const width = Math.max(2, Math.min(100, value / maximum * 100));

        const valueLabel = lpa(value);

        const rangeLabel = metric === "salary"
          ? lpa(item.min) + " – " + lpa(item.max)
          : "After estimated expenses";

        return `
          <div class="salary-bar-row">
            <div class="salary-bar-city">${escapeHTML(item.city)}</div>

            <div class="salary-bar-main">
              <div class="salary-bar-value">
                <span>${escapeHTML(valueLabel)}</span>
                <small>${metric === "salary" ? "MIDPOINT" : "BALANCE"}</small>
              </div>

              <div class="salary-bar-track">
                <div class="salary-bar-fill" style="width:${width}%"></div>
              </div>

              <div class="salary-bar-range">
                ${escapeHTML(rangeLabel)}
              </div>
            </div>
          </div>
        `;
      }).join("");
    }

    function renderSalaryExpenses() {
      const city = costCitySelect.value;

      if (!cities[city]) return;

      const expenseItems = Object.entries(cities[city].expenses);
      const total = getMonthlyExpenses(city);
      const maximum = Math.max(
        ...expenseItems.map((item) => item[1]),
        1
      );

      setText("salaryMonthlyCost", rupees(total));

      setHTML(
        "salaryExpenseBreakdown",
        expenseItems.map(([name, amount]) => {
          const width = Math.max(2, amount / maximum * 100);

          return `
            <div class="salary-expense-row">
              <span>${escapeHTML(name)}</span>
              <strong>${rupees(amount)}</strong>

              <div class="salary-expense-track">
                <div class="salary-expense-fill"
                  style="width:${width}%"></div>
              </div>
            </div>
          `;
        }).join("")
      );

      const selected = getSalaryData().find(
        (item) => item.city === city
      );

      if (selected) {
        setText(
          "salaryMonthlyBalance",
          rupees(selected.monthlyBalance)
        );
      }
    }

    function renderSalaryTable(data) {
      salaryTableBody.innerHTML = data.map((item) => `
        <tr>
          <td>${escapeHTML(item.city)}</td>
          <td>
            ${escapeHTML(lpa(item.min))} –
            ${escapeHTML(lpa(item.max))}
          </td>
          <td>${rupees(item.monthlyExpenses)}</td>
          <td>${rupees(item.monthlyBalance)}</td>
        </tr>
      `).join("");
    }

    function renderSalaryAll() {
      const data = getSalaryData();

      renderSalaryStats(data);
      renderSalaryChart(data);
      renderSalaryExpenses();
      renderSalaryTable(data);
    }

    on(roleSelect, "change", renderSalaryAll);
    on(experienceSelect, "change", renderSalaryAll);
    on(metricSelect, "change", renderSalaryAll);
    on(costCitySelect, "change", renderSalaryExpenses);

    renderSalaryAll();
    console.log("CareerScope Salary Explorer loaded.");
  }

  /* =========================================================
     6. APPLICATION FORM AND ACTIONS
  ========================================================= */

  document.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;

    const saveJobTitle = target.dataset.saveJob;
    const saveCareerTitle = target.dataset.saveCareer;

    if (saveJobTitle || saveCareerTitle) {
      const title = saveJobTitle || saveCareerTitle;
      const kind = saveJobTitle ? "Job" : "Career";

      if (!savedItems.some((item) => item.title === title)) {
        savedItems.push({ title, kind });
        safeWrite("saved", savedItems);
      }

      renderSaved();
      target.textContent = "✓ Saved";
    }

    if (target.dataset.applyJob) {
      applications.push({
        role: target.dataset.applyJob,
        stage: "Interested"
      });

      safeWrite("applications", applications);
      renderApplications();
      location.hash = "applications";
    }

    if (target.dataset.removeSaved !== undefined) {
      savedItems.splice(Number(target.dataset.removeSaved), 1);
      safeWrite("saved", savedItems);
      renderSaved();
    }

    if (target.dataset.removeApp !== undefined) {
      applications.splice(Number(target.dataset.removeApp), 1);
      safeWrite("applications", applications);
      renderApplications();
    }

    if (target.dataset.skillCareer) {
      const skillRole = byId("skillRole");

      if (skillRole) {
        skillRole.value = target.dataset.skillCareer;
        renderSkillChecklist();
        location.hash = "skills";
      }
    }
  });

  on(byId("applicationForm"), "submit", (event) => {
    event.preventDefault();

    const roleInput = byId("applicationRole");
    const stageInput = byId("applicationStage");

    if (!roleInput || !stageInput || !roleInput.value.trim()) return;

    applications.push({
      role: roleInput.value.trim(),
      stage: stageInput.value
    });

    safeWrite("applications", applications);
    roleInput.value = "";
    renderApplications();
  });

  on(byId("applicationList"), "change", (event) => {
    const select = event.target;

    if (select.dataset.appStage === undefined) return;

    const index = Number(select.dataset.appStage);

    if (!applications[index]) return;

    applications[index].stage = select.value;
    safeWrite("applications", applications);
  });

  /* =========================================================
     7. PROFILE FORM
  ========================================================= */

  on(byId("profileForm"), "submit", (event) => {
    event.preventDefault();

    const getValue = (id) => byId(id)?.value.trim() || "";

    const data = {
      name: getValue("profileNameInput"),
      role: getValue("profileRoleInput"),
      experience: byId("profileExperience")?.value || "",
      skills: getValue("profileSkillsInput"),
      location: getValue("profileLocationInput")
    };

    safeWrite("profile", data);

    if (data.name) {
      setText("welcomeName", data.name);
      setText("profileFullName", data.name);
      setText("profileAvatar", data.name.charAt(0).toUpperCase());

      try {
        sessionStorage.setItem("guestName", data.name);
      } catch (_) {}
    }

    setText("profileStatus", "Profile saved in this browser.");
  });

  const savedProfile = safeRead("profile", {});

  const profileFields = {
    name: "profileNameInput",
    role: "profileRoleInput",
    experience: "profileExperience",
    skills: "profileSkillsInput",
    location: "profileLocationInput"
  };

  Object.entries(profileFields).forEach(([key, id]) => {
    const element = byId(id);

    if (element && savedProfile[key]) {
      element.value = savedProfile[key];
    }
  });

  /* =========================================================
     8. SKILL CHECKLIST
  ========================================================= */

  const skillSets = {
    "Data Analyst": [
      "SQL",
      "Excel",
      "Statistics",
      "Power BI",
      "Python",
      "Data storytelling"
    ],

    "Software Engineer": [
      "Programming fundamentals",
      "Data structures",
      "Git",
      "APIs",
      "Testing",
      "System design"
    ],

    "UX Designer": [
      "Figma",
      "User research",
      "Wireframing",
      "Prototyping",
      "Accessibility",
      "Usability testing"
    ],

    "Product Manager": [
      "User research",
      "Product metrics",
      "Prioritization",
      "Roadmapping",
      "Communication",
      "Experiment design"
    ]
  };

  function renderSkillChecklist() {
    const role = byId("skillRole")?.value;
    const container = byId("skillChecklist");

    if (!role || !container) return;

    const checked = safeRead("skills_" + role, []);
    const skills = skillSets[role] || [];

    container.innerHTML = skills.map((skill) => `
      <label class="check-item">
        <input type="checkbox"
          data-skill="${escapeHTML(skill)}"
          ${checked.includes(skill) ? "checked" : ""}>
        <span>${escapeHTML(skill)}</span>
      </label>
    `).join("");

    setText(
      "skillSummary",
      `${checked.length} of ${skills.length} skills marked as familiar · ` +
      `${skills.length - checked.length} to learn`
    );
  }

  on(byId("skillRole"), "change", renderSkillChecklist);

  on(byId("skillChecklist"), "change", (event) => {
    const checkbox = event.target;

    if (!checkbox.dataset.skill) return;

    const role = byId("skillRole")?.value;
    if (!role) return;

    let selected = safeRead("skills_" + role, []);

    selected = checkbox.checked
      ? [...new Set([...selected, checkbox.dataset.skill])]
      : selected.filter((skill) => skill !== checkbox.dataset.skill);

    safeWrite("skills_" + role, selected);
    renderSkillChecklist();
  });

  /* =========================================================
     9. LEARNING CHECKLIST
  ========================================================= */

  const learningItems = [
    "Update resume headline",
    "Practice SQL or role-specific fundamentals",
    "Prepare a 60-second introduction",
    "Complete one portfolio project",
    "Run a mock interview",
    "Review target job descriptions"
  ];

  function renderLearning() {
    const container = byId("learningList");
    if (!container) return;

    const checked = safeRead("learning", []);

    container.innerHTML = learningItems.map((item, index) => `
      <label class="check-item">
        <input type="checkbox"
          data-learning="${index}"
          ${checked.includes(index) ? "checked" : ""}>
        <span>${escapeHTML(item)}</span>
      </label>
    `).join("");
  }

  on(byId("learningList"), "change", (event) => {
    const checkbox = event.target;

    if (checkbox.dataset.learning === undefined) return;

    let selected = safeRead("learning", []);
    const index = Number(checkbox.dataset.learning);

    selected = checkbox.checked
      ? [...new Set([...selected, index])]
      : selected.filter((item) => item !== index);

    safeWrite("learning", selected);
  });

  /* =========================================================
     10. BASIC RESUME KEYWORD CHECK
  ========================================================= */

  on(byId("analyzeResume"), "click", async () => {
    const fileInput = byId("resumeFile");
    const output = byId("resumeResults");
    const file = fileInput?.files?.[0];

    if (!output) return;

    if (!file) {
      output.textContent = "Choose a .txt resume file first.";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      output.textContent =
        "Please choose a text file smaller than 2 MB.";
      return;
    }

    try {
      const text = await file.text();

      const keywords = [
        "SQL",
        "Python",
        "Excel",
        "Power BI",
        "JavaScript",
        "communication",
        "leadership",
        "project",
        "analysis",
        "teamwork",
        "Git",
        "statistics"
      ];

      const found = keywords.filter((keyword) =>
        new RegExp(
          keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        ).test(text)
      );

      const missing = keywords.filter(
        (keyword) => !found.includes(keyword)
      );

      output.innerHTML = `
        <strong>Keyword scan complete</strong><br>
        Characters scanned: ${text.length}<br>
        Recognized keywords: ${found.length}<br>
        <strong>Found:</strong>
        ${found.map(escapeHTML).join(", ") || "None detected"}<br>
        <strong>Not detected:</strong>
        ${missing.map(escapeHTML).join(", ")}
        <p>This is a basic keyword check, not an ATS score or hiring assessment.</p>
      `;
    } catch (_) {
      output.textContent =
        "Could not read that file. Please try a plain-text .txt file.";
    }
  });

  /* =========================================================
     11. SETTINGS AND CLEAR LOCAL DEMO DATA
  ========================================================= */

  const savedSettings = safeRead("settings", {});

  const compactMode = byId("compactMode");
  const reduceMotion = byId("reduceMotion");

  if (compactMode) compactMode.checked = !!savedSettings.compact;
  if (reduceMotion) reduceMotion.checked = !!savedSettings.motion;

  document.body.classList.toggle(
    "compact-dashboard",
    !!savedSettings.compact
  );

  if (savedSettings.motion) {
    document.documentElement.style.scrollBehavior = "auto";
  }

  on(byId("saveSettings"), "click", () => {
    const settings = {
      compact: !!compactMode?.checked,
      motion: !!reduceMotion?.checked
    };

    safeWrite("settings", settings);

    document.body.classList.toggle(
      "compact-dashboard",
      settings.compact
    );

    document.documentElement.style.scrollBehavior =
      settings.motion ? "auto" : "";

    setText("settingsStatus", "Preferences saved in this browser.");
  });

  on(byId("clearData"), "click", () => {
    const confirmed = confirm(
      "Clear CareerScope demo profile, saved items, skills, applications, " +
      "and preferences from this browser?"
    );

    if (!confirmed) return;

    try {
      Object.keys(localStorage)
        .filter((key) =>
          key.startsWith("cs_") ||
          key === "careerscopeSavedJobs" ||
          key === "careerscopeApplications"
        )
        .forEach((key) => localStorage.removeItem(key));
    } catch (_) {}

    savedItems = [];
    applications = [];
    savedJobIds = [];

    renderSaved();
    renderApplications();
    renderJobs();

    setText(
      "settingsStatus",
      "Local demo data cleared. Reload the page to reset all forms."
    );
  });

  /* =========================================================
     12. INITIAL RENDER
  ========================================================= */

  renderCareers();
  renderJobs();
  renderSaved();
  renderApplications();
  renderSkillChecklist();
  renderLearning();

  console.log("CareerScope dashboard initialized successfully.");
})();

/* =========================================
   CAREERSCOPE — CAREER EXPLORER LOGIC
========================================= */
(() => {
  const root = document.getElementById("careers");
  if (!root || root.dataset.careerExplorerReady === "true") return;

  root.dataset.careerExplorerReady = "true";

  const roles = [
    {
      id: "frontend",
      title: "Frontend Developer",
      icon: "⌘",
      level: "Entry",
      description: "Build responsive, accessible interfaces and turn designs into interactive web experiences.",
      skills: ["HTML & CSS", "JavaScript", "Responsive Design", "Git"]
    },
    {
      id: "data",
      title: "Data Analyst",
      icon: "▥",
      level: "Entry",
      description: "Transform raw data into useful insights, reports, and evidence-based decisions.",
      skills: ["SQL", "Python", "Data Visualization", "Statistics"]
    },
    {
      id: "ux",
      title: "UI/UX Designer",
      icon: "✳",
      level: "Entry",
      description: "Research user needs and design intuitive digital experiences through prototyping and testing.",
      skills: ["Figma", "Wireframing", "User Research", "Prototyping"]
    },
    {
      id: "backend",
      title: "Backend Developer",
      icon: "⌘",
      level: "Mid",
      description: "Develop APIs, server-side systems, and data services that power reliable applications.",
      skills: ["Node.js", "Databases", "API Design", "Authentication"]
    },
    {
      id: "data-science",
      title: "Data Scientist",
      icon: "◈",
      level: "Mid",
      description: "Use statistical analysis and machine learning to uncover patterns and make predictions.",
      skills: ["Python", "Machine Learning", "Statistics", "Data Wrangling"]
    },
    {
      id: "product",
      title: "Product Manager",
      icon: "◎",
      level: "Senior",
      description: "Connect user needs, business goals, and engineering teams to guide product strategy.",
      skills: ["Product Strategy", "Analytics", "Communication", "Roadmapping"]
    }
  ];

  const searchInput = document.getElementById("careerSearchInput");
  const levelFilter = document.getElementById("careerLevelFilter");
  const results = document.getElementById("careerResults");
  const emptyState = document.getElementById("careerEmptyState");

  const careerCount = document.getElementById("careerCount");
  const skillCount = document.getElementById("careerSkillCount");
  const resultLabel = document.getElementById("careerResultLabel");

  const roadmapTitle = document.getElementById("roadmapRoleTitle");
  const roadmapIcon = document.getElementById("roadmapRoleIcon");
  const roadmapSkills = document.getElementById("careerSkillChecklist");
  const roadmapCount = document.getElementById("roadmapSkillCount");
  const progressPercent = document.getElementById("careerProgressPercent");
  const progressRing = document.getElementById("careerProgressRing");
  const roadmapMessage = document.getElementById("careerRoadmapMessage");
  const resetButton = document.getElementById("careerResetSkills");

  let selectedRoleId = "frontend";

  // Store checklist state separately for each career.
  const completedSkills = {};

  const escapeHTML = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  function getSelectedRole() {
    return roles.find((role) => role.id === selectedRoleId) || roles[0];
  }

  function renderCards() {
    const query = searchInput.value.trim().toLowerCase();
    const level = levelFilter.value;

    const filteredRoles = roles.filter((role) => {
      const matchesLevel = level === "all" || role.level === level;
      const searchableText = [
        role.title,
        role.description,
        role.level,
        ...role.skills
      ].join(" ").toLowerCase();

      return matchesLevel && searchableText.includes(query);
    });

    results.innerHTML = filteredRoles.map((role) => {
      const selected = role.id === selectedRoleId;
      const tags = role.skills.slice(0, 3).map((skill) =>
        `<span class="career-skill-tag">${escapeHTML(skill)}</span>`
      ).join("");

      return `
        <article class="career-card ${selected ? "is-selected" : ""}">
          <div class="career-card-top">
            <div class="career-card-icon" aria-hidden="true">
              ${escapeHTML(role.icon)}
            </div>
            <span class="career-level">${escapeHTML(role.level)} level</span>
          </div>

          <h4>${escapeHTML(role.title)}</h4>
          <p class="career-card-description">
            ${escapeHTML(role.description)}
          </p>

          <span class="career-card-skills-label">CORE SKILLS</span>
          <div class="career-card-skills">${tags}</div>

          <button
            type="button"
            class="career-explore-btn"
            data-career-id="${escapeHTML(role.id)}"
            aria-pressed="${selected}"
          >
            <span>${selected ? "Selected career" : "Explore this path"}</span>
            <span aria-hidden="true">↗</span>
          </button>
        </article>
      `;
    }).join("");

    careerCount.textContent = String(roles.length).padStart(2, "0");
    skillCount.textContent = String(
      new Set(roles.flatMap((role) => role.skills)).size
    ).padStart(2, "0");

    resultLabel.textContent =
      `${String(filteredRoles.length).padStart(2, "0")} ROLES`;

    emptyState.hidden = filteredRoles.length !== 0;
  }

  function renderRoadmap() {
    const role = getSelectedRole();

    if (!completedSkills[role.id]) {
      completedSkills[role.id] = new Set();
    }

    const completed = completedSkills[role.id];
    const total = role.skills.length;
    const done = completed.size;
    const percent = Math.round((done / total) * 100);

    roadmapTitle.textContent = role.title;
    roadmapIcon.textContent = role.icon;
    roadmapCount.textContent = `${done} / ${total} SKILLS`;
    progressPercent.textContent = `${percent}%`;

    const degrees = percent * 3.6;
    progressRing.style.background =
      `conic-gradient(#8b5cf6 0deg, #22d3ee ${degrees}deg, rgba(148,163,184,0.13) ${degrees}deg 360deg)`;

    roadmapSkills.innerHTML = role.skills.map((skill, index) => {
      const isDone = completed.has(skill);

      return `
        <div
          class="career-skill-item ${isDone ? "is-complete" : ""}"
          role="checkbox"
          aria-checked="${isDone}"
          aria-label="${escapeHTML(skill)}"
          tabindex="0"
          data-skill-index="${index}"
        >
          <span class="career-skill-checkbox" aria-hidden="true">
            ${isDone ? "✓" : ""}
          </span>
          <span class="career-skill-name">${escapeHTML(skill)}</span>
        </div>
      `;
    }).join("");

    if (percent === 100) {
      roadmapMessage.textContent =
        "Excellent work — you've checked off every skill in this roadmap.";
    } else if (percent > 0) {
      roadmapMessage.textContent =
        `${done} skill${done === 1 ? "" : "s"} completed. Keep building your momentum.`;
    } else {
      roadmapMessage.textContent =
        "Every expert starts with one skill. Check off skills as you develop them.";
    }

    renderCards();
  }

  results.addEventListener("click", (event) => {
    const button = event.target.closest("[data-career-id]");
    if (!button) return;

    selectedRoleId = button.dataset.careerId;
    renderRoadmap();

    // Bring the roadmap into view after a career is selected.
    document.getElementById("careerRoadmap").scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  });

  function toggleSkill(item) {
    const role = getSelectedRole();
    const skill = role.skills[Number(item.dataset.skillIndex)];

    if (!skill) return;

    if (!completedSkills[role.id]) {
      completedSkills[role.id] = new Set();
    }

    const completed = completedSkills[role.id];

    if (completed.has(skill)) {
      completed.delete(skill);
    } else {
      completed.add(skill);
    }

    renderRoadmap();
  }

  roadmapSkills.addEventListener("click", (event) => {
    const item = event.target.closest("[data-skill-index]");
    if (item) toggleSkill(item);
  });

  roadmapSkills.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const item = event.target.closest("[data-skill-index]");
    if (!item) return;

    event.preventDefault();
    toggleSkill(item);
  });

  searchInput.addEventListener("input", renderCards);
  levelFilter.addEventListener("change", renderCards);

  resetButton.addEventListener("click", () => {
    completedSkills[selectedRoleId] = new Set();
    renderRoadmap();
  });

  renderRoadmap();
})();
/* =========================================
   CAREERSCOPE — STEP 7 MATCH ENGINE
========================================= */
(() => {
  const root = document.getElementById("careerMatch");

  if (!root || root.dataset.csmInitialized === "true") return;
  root.dataset.csmInitialized = "true";

  const careers = [
    {
      id: "frontend",
      title: "Frontend Developer",
      icon: "⌘",
      category: "development",
      description: "Build responsive websites and interactive user interfaces.",
      skills: ["html", "css", "javascript", "react", "git", "responsive design"]
    },
    {
      id: "backend",
      title: "Backend Developer",
      icon: "⌘",
      category: "development",
      description: "Build APIs, server-side applications, and database systems.",
      skills: ["javascript", "node.js", "python", "sql", "apis", "databases", "git"]
    },
    {
      id: "fullstack",
      title: "Full-Stack Developer",
      icon: "⌘",
      category: "development",
      description: "Work across frontend interfaces and backend application systems.",
      skills: ["html", "css", "javascript", "react", "node.js", "sql", "git"]
    },
    {
      id: "data-analyst",
      title: "Data Analyst",
      icon: "▥",
      category: "data",
      description: "Analyze datasets and turn findings into actionable insights.",
      skills: ["sql", "excel", "python", "statistics", "data visualization", "power bi"]
    },
    {
      id: "data-scientist",
      title: "Data Scientist",
      icon: "◈",
      category: "data",
      description: "Apply statistics and machine learning to solve complex problems.",
      skills: ["python", "sql", "statistics", "machine learning", "data visualization", "pandas"]
    },
    {
      id: "ml-engineer",
      title: "Machine Learning Engineer",
      icon: "◈",
      category: "data",
      description: "Develop, evaluate, and deploy machine learning systems.",
      skills: ["python", "machine learning", "deep learning", "sql", "apis", "git"]
    },
    {
      id: "ux-designer",
      title: "UI/UX Designer",
      icon: "✳",
      category: "design",
      description: "Design accessible, useful digital experiences through research and prototyping.",
      skills: ["figma", "wireframing", "prototyping", "user research", "visual design", "accessibility"]
    },
    {
      id: "product-designer",
      title: "Product Designer",
      icon: "✳",
      category: "design",
      description: "Connect user needs with product flows, visual design, and usability.",
      skills: ["figma", "user research", "prototyping", "wireframing", "visual design", "analytics"]
    },
    {
      id: "product-manager",
      title: "Product Manager",
      icon: "↗",
      category: "business",
      description: "Coordinate product strategy, user needs, priorities, and delivery.",
      skills: ["communication", "analytics", "product strategy", "roadmapping", "user research", "agile"]
    },
    {
      id: "business-analyst",
      title: "Business Analyst",
      icon: "↗",
      category: "business",
      description: "Translate business requirements into insights and practical improvements.",
      skills: ["excel", "sql", "communication", "data visualization", "analytics", "documentation"]
    },
    {
      id: "cybersecurity",
      title: "Cybersecurity Analyst",
      icon: "⬡",
      category: "security",
      description: "Monitor threats, investigate security issues, and help protect systems.",
      skills: ["networking", "linux", "security fundamentals", "python", "risk analysis", "incident response"]
    },
    {
      id: "cloud-engineer",
      title: "Cloud Engineer",
      icon: "☁",
      category: "cloud",
      description: "Build and maintain cloud infrastructure, deployment pipelines, and reliable services.",
      skills: ["aws", "azure", "linux", "docker", "networking", "ci/cd", "python"]
    }
  ];

  const aliases = {
    js: "javascript",
    "java script": "javascript",
    html5: "html",
    css3: "css",
    "react.js": "react",
    "reactjs": "react",
    "node": "node.js",
    nodejs: "node.js",
    "postgresql": "sql",
    "mysql": "sql",
    "powerbi": "power bi",
    "power-bi": "power bi",
    "machine-learning": "machine learning",
    ml: "machine learning",
    "deep-learning": "deep learning",
    ux: "user experience",
    ui: "user interface",
    "ui/ux": "design",
    "user interface design": "visual design",
    "user experience": "user research",
    "adobe figma": "figma",
    "amazon web services": "aws",
    "microsoft azure": "azure",
    "continuous integration": "ci/cd",
    "continuous deployment": "ci/cd",
    "communication skills": "communication",
    "data analysis": "analytics",
    "data analytics": "analytics",
    "data visualisation": "data visualization",
    "visualisation": "data visualization",
    "visualization": "data visualization",
    "risk assessment": "risk analysis",
    "api": "apis",
    "api development": "apis",
    "database": "databases",
    "user testing": "user research",
    "agile methodology": "agile"
  };

  const skillsInput = document.getElementById("csmSkillsInput");
  const findButton = document.getElementById("csmFindMatches");
  const recommendationList = document.getElementById("csmRecommendationList");
  const topCareer = document.getElementById("csmTopCareer");
  const topDescription = document.getElementById("csmTopDescription");
  const topScore = document.getElementById("csmTopScore");
  const topScoreRing = document.getElementById("csmTopScoreRing");
  const resultsCount = document.getElementById("csmResultsCount");

  const selectedInterests = () =>
    Array.from(root.querySelectorAll('input[name="csmInterest"]:checked'))
      .map((input) => input.value);

  function normalizeSkill(value) {
    const normalized = value
      .toLowerCase()
      .trim()
      .replace(/[._]/g, " ")
      .replace(/\s+/g, " ");

    return aliases[normalized] || normalized;
  }

  function parseSkills() {
    return new Set(
      skillsInput.value
        .split(/[,;\n]+/)
        .map(normalizeSkill)
        .filter((skill) => skill.length > 0)
    );
  }

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function calculateMatch(career, userSkills, interests) {
    const matchingSkills = career.skills.filter((skill) =>
      userSkills.has(normalizeSkill(skill))
    );

    const missingSkills = career.skills.filter((skill) =>
      !userSkills.has(normalizeSkill(skill))
    );

    const skillCoverage = matchingSkills.length / career.skills.length;
    const interestMatch = interests.includes(career.category);

    let score;

    if (userSkills.size > 0 && interests.length > 0) {
      // Skills count for 70%; selected interests count for 30%.
      score = Math.round(
        skillCoverage * 70 + (interestMatch ? 30 : 0)
      );
    } else if (userSkills.size > 0) {
      score = Math.round(skillCoverage * 100);
    } else {
      // Interest-only matches are provisional, not skill-based.
      score = interestMatch ? 55 : 25;
    }

    return {
      ...career,
      score,
      matchingSkills,
      missingSkills,
      interestMatch,
      skillCoverage
    };
  }

  function renderTags(items, className, emptyMessage) {
    if (!items.length) {
      return `<span class="csm-no-tags">${escapeText(emptyMessage)}</span>`;
    }

    return items.map((item) =>
      `<span class="${className}">${escapeText(item)}</span>`
    ).join("");
  }

  function renderRecommendation(career, hasSkills, hasInterests) {
    const matchingContent = hasSkills
      ? renderTags(career.matchingSkills, "csm-match-tag", "No listed skills matched yet")
      : `<span class="csm-no-tags">Add skills for a more personalized comparison.</span>`;

    const missingContent = hasSkills
      ? renderTags(career.missingSkills, "csm-gap-tag", "All listed skills matched")
      : `<span class="csm-no-tags">Enter your skills to identify learning gaps.</span>`;

    const interestNote = hasInterests
      ? (career.interestMatch
          ? "Matches your selected interest"
          : "Outside your selected interests")
      : "Explore this career category";

    return `
      <article class="csm-recommendation">
        <div class="csm-recommendation-top">
          <div class="csm-recommendation-title-wrap">
            <div class="csm-recommendation-icon" aria-hidden="true">
              ${escapeText(career.icon)}
            </div>
            <div>
              <h4>${escapeText(career.title)}</h4>
              <p class="csm-recommendation-subtitle">
                ${escapeText(career.description)}
              </p>
            </div>
          </div>
          <div class="csm-match-number">
            ${career.score}<small>%</small>
          </div>
        </div>

        <div
          class="csm-match-track"
          role="progressbar"
          aria-label="${escapeText(career.title)} illustrative match score"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="${career.score}"
        >
          <div class="csm-match-fill" style="width:${career.score}%"></div>
        </div>

        <div class="csm-match-details">
          <div>
            <span class="csm-detail-heading">MATCHING SKILLS</span>
            <div class="csm-tag-list">${matchingContent}</div>
          </div>
          <div>
            <span class="csm-detail-heading">SKILLS TO DEVELOP</span>
            <div class="csm-tag-list">${missingContent}</div>
          </div>
        </div>

        <p class="csm-recommendation-subtitle" style="margin-top:13px">
          ${escapeText(interestNote)}
        </p>
      </article>
    `;
  }

  function showEmptyState(title, message) {
    topCareer.textContent = title;
    topDescription.textContent = message;
    topScore.textContent = "--";
    topScoreRing.style.background =
      "conic-gradient(rgba(148,163,184,0.13) 0deg 360deg)";

    resultsCount.textContent = "0 PATHS";

    recommendationList.innerHTML = `
      <div class="csm-empty-state">
        <span class="csm-empty-icon">✳</span>
        <h4>${escapeText(title)}</h4>
        <p>${escapeText(message)}</p>
      </div>
    `;
  }

  function updateRecommendations() {
    const userSkills = parseSkills();
    const interests = selectedInterests();

    if (userSkills.size === 0 && interests.length === 0) {
      showEmptyState(
        "Let's discover your career fit.",
        "Enter at least one skill or select a career interest to get started."
      );
      return;
    }

    const ranked = careers
      .map((career) => calculateMatch(career, userSkills, interests))
      .sort((a, b) =>
        b.score - a.score ||
        b.matchingSkills.length - a.matchingSkills.length ||
        a.title.localeCompare(b.title)
      );

    const best = ranked[0];
    const hasSkills = userSkills.size > 0;
    const hasInterests = interests.length > 0;

    topCareer.textContent = best.title;
    topScore.textContent = `${best.score}%`;

    if (!hasSkills) {
      topDescription.textContent =
        "This provisional suggestion is based on your selected interests. Add skills to refine your matches.";
    } else if (!hasInterests) {
      topDescription.textContent =
        `${best.matchingSkills.length} of ${best.skills.length} listed core skills matched. Select interests to include them in your recommendations.`;
    } else {
      topDescription.textContent =
        `${best.matchingSkills.length} of ${best.skills.length} listed core skills matched, with ${best.interestMatch ? "an aligned career interest" : "room to explore outside your selected interests"}.`;
    }

    const degrees = best.score * 3.6;
    topScoreRing.style.background =
      `conic-gradient(#8b5cf6 0deg, #22d3ee ${degrees}deg, rgba(148,163,184,0.13) ${degrees}deg 360deg)`;

    resultsCount.textContent =
      `${String(ranked.length).padStart(2, "0")} PATHS`;

    recommendationList.innerHTML = ranked
      .slice(0, 6)
      .map((career) =>
        renderRecommendation(career, hasSkills, hasInterests)
      )
      .join("");
  }

  findButton.addEventListener("click", updateRecommendations);

  // Also refresh results when the user edits their profile.
  skillsInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      updateRecommendations();
    }
  });

  root.querySelectorAll('input[name="csmInterest"]').forEach((input) => {
    input.addEventListener("change", updateRecommendations);
  });

  // Initial state: invite the user to create their profile.
  showEmptyState(
    "Ready to explore?",
    "Add your skills and choose your interests, then find your career matches."
  );
})();
/* =========================================
   CAREERSCOPE: PERSONAL PROFILE NAVIGATION
   ========================================= */

/* ==========================================
   CAREERSCOPE PROFILE WORKSPACE NAVIGATION
   Main dashboard navigation + profile menu
   ========================================== */
(() => {
  if (window.careerScopeProfileNavReady) return;
  window.careerScopeProfileNavReady = true;

  const main = document.querySelector(".dashboard-main");
  const sidebar = document.getElementById("dashboardSidebar");
  const profileButton = document.getElementById("profileButton");
  const profileDropdown = document.getElementById("profileDropdown");
  const backButton = document.getElementById("backToDashboard");
  const breadcrumb = document.querySelector(".breadcrumb");

  if (!main || !sidebar) return;

  const personalIds = [
    "profile",
    "resume",
    "skills",
    "learning",
    "applications",
    "saved",
    "settings"
  ];

  const personalSections = personalIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const personalLinks = Array.from(
    sidebar.querySelectorAll(".personal-menu a[data-section]")
  );

  const allSidebarLinks = Array.from(
    sidebar.querySelectorAll(".sidebar-menu a[data-section]")
  );

  const mainLinks = allSidebarLinks.filter(
    link => !link.closest(".personal-menu")
  );

  function setBreadcrumb(label) {
    if (!breadcrumb) return;

    breadcrumb.replaceChildren();

    const dot = document.createElement("span");
    dot.className = "status-dot";

    const brand = document.createElement("span");
    brand.textContent = " CAREERSCOPE ";

    const separator = document.createElement("span");
    separator.className = "muted";
    separator.textContent = "/ " + label.toUpperCase();

    breadcrumb.append(dot, brand, separator);
  }

  function closeProfileDropdown() {
    if (profileDropdown) {
      profileDropdown.hidden = true;
    }

    if (profileButton) {
      profileButton.setAttribute("aria-expanded", "false");
    }
  }

  function updateHash(id) {
    if (window.location.hash !== "#" + id) {
      history.replaceState(null, "", "#" + id);
    }
  }

  function openPersonalPage(id, options = {}) {
    const section = document.getElementById(id);

    if (!section || !personalIds.includes(id)) return;

    main.classList.add("profile-workspace");
    document.body.classList.add("profile-workspace-open");

    personalSections.forEach(item => {
      item.classList.toggle(
        "personal-section-active",
        item.id === id
      );
    });

    personalLinks.forEach(link => {
      const selected = link.dataset.section === id;

      link.classList.toggle("active", selected);

      if (selected) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    mainLinks.forEach(link => link.classList.remove("active"));

    const heading = section.querySelector("h1, h2");
    setBreadcrumb(heading ? heading.textContent.trim() : id);

    closeProfileDropdown();

    if (options.updateHash !== false) {
      updateHash(id);
    }

    sidebar.classList.remove("is-open");

    if (options.scroll !== false) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  function showMainDashboard(options = {}) {
    main.classList.remove("profile-workspace");
    document.body.classList.remove("profile-workspace-open");

    personalSections.forEach(section => {
      section.classList.remove("personal-section-active");
    });

    personalLinks.forEach(link => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    });

    closeProfileDropdown();
    setBreadcrumb("Overview");

    if (options.updateHash) {
      updateHash("overview");
    }

    if (options.scroll) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  /* Top-right dropdown: My Profile */
  if (profileDropdown) {
    profileDropdown.addEventListener("click", event => {
      const link = event.target.closest('a[href="#profile"]');
      if (!link) return;

      event.preventDefault();
      event.stopPropagation();

      openPersonalPage("profile");
    }, true);
  }

  /* Personal sidebar: switch between the seven personal pages */
  personalLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();

      openPersonalPage(link.dataset.section);
    }, true);
  });

  /*
   * Main sidebar links:
   * restore the main dashboard and allow normal anchor navigation.
   */
  mainLinks.forEach(link => {
    link.addEventListener("click", () => {
      showMainDashboard();
    }, true);
  });

  /* Back to Dashboard */
  if (backButton) {
    backButton.addEventListener("click", event => {
      event.preventDefault();
      showMainDashboard({
        updateHash: true,
        scroll: true
      });
    });
  }

  /*
   * Support direct URLs and browser back/forward.
   * Main-feature hashes are NOT prevented or replaced here.
   */
  function handleHashChange() {
    const id = decodeURIComponent(
      window.location.hash.slice(1)
    );

    if (personalIds.includes(id)) {
      openPersonalPage(id, {
        updateHash: false,
        scroll: true
      });
    } else {
      showMainDashboard();
    }
  }

  window.addEventListener("hashchange", handleHashChange);

  /* Expose helpers for other dashboard scripts if needed */
  window.careerScopeProfileNavigation = {
    openPersonalPage,
    showMainDashboard: () => showMainDashboard({
      updateHash: true,
      scroll: true
    })
  };

  /* Open the correct view on initial page load */
  handleHashChange();
})();

/* ==========================================
   CAREERSCOPE - FRESH SALARY LOCATION CHART
   ========================================== */
(() => {
  function createCareerScopeSalaryChart() {
    const canvas = document.getElementById("salaryChart");

    if (!canvas || typeof Chart === "undefined") return;

    // Clean up an existing chart if one was already created.
    const previousChart = Chart.getChart(canvas);
    if (previousChart) previousChart.destroy();

    new Chart(canvas, {
      type: "bar",

      data: {
        labels: [
          "Hyderabad",
          "Bengaluru",
          "Pune",
          "Chennai",
          "Mumbai"
        ],

        datasets: [{
          label: "Median annual salary (₹ LPA)",
          data: [10.5, 13.2, 9.8, 9.2, 15.4],

          backgroundColor: [
            "rgba(38, 220, 235, 0.78)",
            "rgba(153, 112, 255, 0.78)",
            "rgba(38, 220, 235, 0.58)",
            "rgba(153, 112, 255, 0.58)",
            "rgba(38, 220, 235, 0.9)"
          ],

          borderColor: [
            "#26DCEB",
            "#9970FF",
            "#26DCEB",
            "#9970FF",
            "#26DCEB"
          ],

          borderWidth: 1,
          borderRadius: 7,
          maxBarThickness: 42
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,

        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            backgroundColor: "#141222",
            titleColor: "#FFFFFF",
            bodyColor: "#D8D2EA",
            borderColor: "#60459B",
            borderWidth: 1,

            callbacks: {
              label: context =>
                ` ₹${context.parsed.y.toFixed(1)} LPA`
            }
          }
        },

        scales: {
          x: {
            ticks: {
              color: "#A7A1B8",
              font: {
                family: "Space Grotesk",
                size: 11
              }
            },

            grid: {
              display: false
            },

            border: {
              display: false
            }
          },

          y: {
            beginAtZero: true,

            ticks: {
              color: "#A7A1B8",
              stepSize: 5,

              callback: value => `₹${value}L`
            },

            grid: {
              color: "rgba(167, 145, 220, 0.12)"
            },

            border: {
              display: false
            }
          }
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      createCareerScopeSalaryChart,
      { once: true }
    );
  } else {
    createCareerScopeSalaryChart();
  }
})();
