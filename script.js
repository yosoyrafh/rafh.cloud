const profile = {
  name: "Rafael Flores",
  role: "Linux Enthusiast and Creative Technologist",
  location: "Woodbridge, Virginia",
  email: "yosoyrafh@rafh.cloud",
  github: "https://github.com/",
  linkedin: "https://linkedin.com/",
  bio: "I enjoy building tools that make life a little easier.",
  skills: ["JavaScript", "TypeScript", "React", "HTML & CSS", "Node.js", "UI/UX"],
  projects: [
    { name: "Project One", description: "A small description of a project you are proud of.", stack: "React · TypeScript" },
    { name: "Project Two", description: "Another project, experiment, or open-source contribution.", stack: "Node.js · API" },
    { name: "Project Three", description: "A recent collaboration or idea brought to life.", stack: "JavaScript · CSS" },
  ],
};

const files = {
  "about.txt": () => [
    { text: profile.name, className: "section-title" },
    { text: profile.role, className: "muted" },
    { text: "" },
    { text: profile.bio },
    { text: "" },
    { text: `📍  ${profile.location}` },
    { text: `✉   ${profile.email}` },
  ],
  "skills.txt": () => [
    { text: "TOOLS I REACH FOR", className: "section-title" },
    { text: profile.skills.join("   ·   ") },
    { text: "" },
    { text: "Always learning something new.", className: "muted" },
  ],
  "projects.txt": () => [
    { text: "SELECTED WORK", className: "section-title" },
    ...profile.projects.flatMap((project) => [
      { text: `▸ ${project.name}`, className: "success" },
      { text: `  ${project.description}` },
      { text: `  ${project.stack}`, className: "muted" },
      { text: "" },
    ]),
  ],
  "contact.txt": () => [
    { text: "LET'S MAKE SOMETHING GOOD.", className: "section-title" },
    { text: `Email: ${profile.email}` },
    { text: `GitHub: ${profile.github}` },
    { text: `LinkedIn: ${profile.linkedin}` },
  ],
  ".hello": () => [
    { text: "You found the hidden file. Nice work.", className: "success" },
    { text: "Every good project starts with a little curiosity.", className: "muted" },
  ],
};

const output = document.querySelector("#output");
const form = document.querySelector("#command-form");
const input = document.querySelector("#command-input");
const history = [];
let historyIndex = 0;
let currentDirectory = "~";
let welcomeShown = false;

function updatePrompt() {
  document.querySelector(".prompt-path").textContent = `:${currentDirectory}`;
}

function addLine(text = "", className = "") {
  const paragraph = document.createElement("p");
  paragraph.className = className;
  paragraph.textContent = text;
  output.append(paragraph);
  output.scrollTop = output.scrollHeight;
}

function addWelcome() {
  if (welcomeShown) return;
  welcomeShown = true;
  addLine("Welcome to rafh.cloud v1.0 - Linux Terminal", "welcome-title");
  addLine("Explore my website using CLI commands.", "welcome-subtitle");
  addLine("");
  addLine("Start here:  ls        list files", "muted");
  addLine("            cat about.txt   learn about me", "muted");
  addLine("            help      see all commands", "muted");
  addLine("");
}

function listFiles(showHidden = false) {
  const entries = currentDirectory === "~"
    ? [
        { name: "about.txt", type: "file" },
        { name: "projects/", type: "directory" },
        { name: "skills.txt", type: "file" },
        { name: "contact.txt", type: "file" },
      ]
    : currentDirectory === "~/projects"
      ? profile.projects.map((project) => ({
          name: `${project.name.toLowerCase().replaceAll(" ", "-")}/`,
          type: "directory",
        }))
      : [{ name: "README.txt", type: "file" }];
  if (showHidden && currentDirectory === "~") entries.push({ name: ".hello", type: "file" });
  const container = document.createElement("div");
  container.className = "file-list";
  for (const entry of entries) {
    const item = document.createElement("span");
    item.className = entry.type;
    item.textContent = entry.name;
    container.append(item);
  }
  output.append(container);
}

function showFile(name) {
  const content = files[name];
  if (!content) {
    addLine(`cat: ${name}: No such file or directory`, "warning");
    return;
  }
  for (const line of content()) addLine(line.text, line.className ?? "");
}

function showHelp() {
  addLine("COMMANDS", "section-title");
  addLine("  help               Show this list");
  addLine("  ls [-a]            List files (use -a to show hidden files)");
  addLine("  cd [directory]     Explore projects/ or return with cd ~");
  addLine("  cat [file]         Read about.txt, skills.txt, projects.txt, contact.txt");
  addLine("  whoami             A quick introduction");
  addLine("  pwd                Print your current location");
  addLine("  find [keyword]     Search portfolio files");
  addLine("  history            Show recent commands");
  addLine("  clear              Clear the terminal");
  addLine("");
  addLine("Tip: use ↑ and ↓ to revisit commands. Try `cat about.txt` to get started.", "muted");
}

function showProjects() {
  addLine("projects/", "section-title");
  for (const project of profile.projects) {
    addLine(`${project.name.toLowerCase().replaceAll(" ", "-")}/`, "directory");
  }
  addLine("");
  addLine("Run `cat projects.txt` to see selected work.", "muted");
}

function showProject(name) {
  const project = profile.projects.find((entry) => entry.name.toLowerCase().replaceAll(" ", "-") === name);
  if (!project) return false;
  addLine(project.name, "section-title");
  addLine(project.description);
  addLine(`Built with: ${project.stack}`, "muted");
  return true;
}

function runFind(query) {
  if (!query) {
    addLine("Usage: find [keyword]", "warning");
    return;
  }
  const matches = [];
  if (JSON.stringify(profile).toLowerCase().includes(query)) matches.push("about.txt");
  if (profile.skills.join(" ").toLowerCase().includes(query)) matches.push("skills.txt");
  if (JSON.stringify(profile.projects).toLowerCase().includes(query)) matches.push("projects.txt");
  if (`${profile.email} ${profile.github} ${profile.linkedin}`.toLowerCase().includes(query)) matches.push("contact.txt");
  if (matches.length) {
    addLine(matches.join("\n"));
  } else {
    addLine(`No matches found for "${query}".`, "muted");
  }
}

function runCommand(rawCommand) {
  const command = rawCommand.trim();
  if (!command) return;
  history.push(command);
  historyIndex = history.length;
  addLine(`guest@rafh.cloud:${currentDirectory}$ ${command}`, "command-echo");

  const [action, ...args] = command.split(/\s+/);
  const argument = args.join(" ");
  switch (action.toLowerCase()) {
    case "help":
      showHelp();
      break;
    case "ls":
      listFiles(args.includes("-a"));
      break;
    case "pwd":
      addLine(`/home/${profile.name.toLowerCase().replaceAll(" ", "-")}${currentDirectory === "~" ? "" : `/${currentDirectory.slice(2)}`}`);
      break;
    case "whoami":
      showFile("about.txt");
      break;
    case "cat":
      showFile(argument || "");
      break;
    case "cd":
      if (!argument || argument === "~" || argument === "..") {
        currentDirectory = argument === ".." && currentDirectory.startsWith("~/projects/")
          ? "~/projects"
          : "~";
        updatePrompt();
      } else if (argument === "projects" || argument === "projects/") {
        currentDirectory = "~/projects";
        updatePrompt();
        showProjects();
      } else {
        const projectName = argument.replace(/\/$/, "");
        if (currentDirectory === "~/projects" && showProject(projectName)) {
          currentDirectory = `~/projects/${projectName}`;
          updatePrompt();
        } else {
          addLine(`cd: ${argument}: No such directory`, "warning");
        }
      }
      break;
    case "find":
      runFind(argument.toLowerCase());
      break;
    case "history":
      history.forEach((entry, index) => addLine(`  ${index + 1}  ${entry}`));
      break;
    case "clear":
      output.replaceChildren();
      break;
    case "run":
      for (const name of Object.keys(files)) showFile(name);
      break;
    case "exit":
      addLine("There is no need to leave just yet — make yourself at home.", "muted");
      break;
    default:
      addLine(`${action}: command not found. Type "help" to see available commands.`, "warning");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addWelcome();
  runCommand(input.value);
  input.value = "";
});

input.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    historyIndex = Math.max(0, historyIndex - 1);
    input.value = history[historyIndex] ?? "";
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    historyIndex = Math.min(history.length, historyIndex + 1);
    input.value = history[historyIndex] ?? "";
  }
});

document.querySelector(".console").addEventListener("click", () => input.focus());
addWelcome();
